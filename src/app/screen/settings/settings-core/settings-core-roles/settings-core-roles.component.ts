import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, debounceTime, filter, map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthSelectors } from 'src/app/store/auth/auth.selectors';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../settings.actions';
import { CompanyElement, RoleElement, UserElement } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { RoleDialogData, SettingsCoreRolesCreateRoleDialogComponent } from './settings-core-roles-create-role-dialog/settings-core-roles-create-role-dialog.component';
import { EditUserData, SettingsCoreRolesCreateUserDialogComponent } from './settings-core-roles-create-user-dialog/settings-core-roles-create-user-dialog.component';
import { SettingsCoreRolesDeleteUserDialogComponent } from './settings-core-roles-delete-user-dialog/settings-core-roles-delete-user-dialog.component';
import { SettingsCoreRolesResetMfaDialogComponent } from './settings-core-roles-reset-mfa-dialog/settings-core-roles-reset-mfa-dialog.component';
import { SettingsCoreRolesResetPasswordDialogComponent } from './settings-core-roles-reset-password-dialog/settings-core-roles-reset-password-dialog.component';

@Component({
  selector: 'app-settings-core-roles',
  templateUrl: './settings-core-roles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreRolesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  searchControl = this.fb.control('');
  perPage$ = this.store.select(SettingsSelectors.usersResponseParams).pipe(map(params => params.per_page));
  usersResponse$ = this.store.select(SettingsSelectors.usersResponse);
  companyElements$ = this.store.select(SettingsSelectors.companyElements);
  companyRoles?: RoleElement[];
  selectedRole?: RoleElement;
  selectedCompany?: CompanyElement;
  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog, private readonly actions$: Actions, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.store.dispatch(
      SettingsActions.fetchUsersResponse({
        params: {
          page: 1,
          company_id: undefined,
          fleet_access: undefined,
          role: undefined,
          search: undefined
        }
      })
    );

    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));

    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        tap(value => this.store.dispatch(SettingsActions.fetchUsersResponse({ params: { search: value ?? '', page: 1 } }))),
        takeUntil(this.destroy$)
      )
      .subscribe();

    combineLatest([this.store.select(AuthSelectors.loggedInUser), this.companyElements$])
      .pipe(
        filter(([user]) => user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN'),
        tap(([user, companies]) => {
          const selectedCompany = companies.find(company => company.id === user?.company_id);
          if (selectedCompany) {
            this.handleCompanyClick(selectedCompany);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.store
      .select(SettingsSelectors.companyRoles)
      .pipe(
        tap(value => (this.companyRoles = value)),
        tap(roles => {
          if (this.selectedRole) {
            this.selectedRole = roles.find(role => role.id === this.selectedRole?.id);
          }
        }),
        tap(() => this.cdr.detectChanges()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCreateRoleClick(): void {
    this.dialog.open<void, RoleDialogData>(SettingsCoreRolesCreateRoleDialogComponent, {
      data: {
        type: 'create',
        company_id: this.selectedCompany!.id
      }
    });
  }

  handleCompanyClick(company: CompanyElement) {
    this.selectedRole = undefined;
    this.companyRoles = [];
    this.selectedCompany = company;
    this.store.dispatch(SettingsActions.fetchCompanyRoles({ params: { company_id: company.id, page: 1, per_page: 100, only_custom_roles: false }, onlySelect: false }));
    this.store.dispatch(SettingsActions.fetchUsersResponse({ params: { search: '', page: 1, company_id: company.id, role: undefined } }));
  }

  handleRoleClick(role: RoleElement): void {
    this.selectedRole = role;
    this.store.dispatch(SettingsActions.fetchUsersResponse({ params: { search: '', page: 1, company_id: this.selectedCompany?.id, role: role.name } }));
  }

  handleCreateUserClick(): void {
    this.dialog.open<void, EditUserData>(SettingsCoreRolesCreateUserDialogComponent, {
      data: {
        type: 'create',
        company_id: this.selectedCompany!.id
      }
    });
    this.store.dispatch(SettingsActions.fetchCompanyRoles({ params: { company_id: null, page: 1, per_page: 100, only_custom_roles: true }, onlySelect: true }));
  }

  handleEditUserClick(user: UserElement): void {
    this.store.dispatch(SettingsActions.fetchNotifications({ params: { company_id: user.company_id } }));
    this.dialog.open<void, EditUserData>(SettingsCoreRolesCreateUserDialogComponent, {
      data: {
        type: 'edit',
        id: user.id,
        company_id: user.company_id
      }
    });
    this.store.dispatch(
      SettingsActions.fetchCompanyRoles({
        params: {
          company_id: user.company_id,
          page: 1,
          per_page: 100,
          only_custom_roles: true
        },
        onlySelect: true
      })
    );
  }

  handleDeleteUserClick(user: UserElement): void {
    this.dialog.open<void, { id: number; user: string; company: string }>(SettingsCoreRolesDeleteUserDialogComponent, {
      data: {
        id: user.id,
        user: user.name,
        company: user.company_id?.toString() ?? 'Company'
      }
    });
  }

  handleResetPasswordClick(user: UserElement): void {
    this.dialog.open<void, { id: number; user: string }>(SettingsCoreRolesResetPasswordDialogComponent, {
      data: {
        id: user.id,
        user: user.name
      }
    });
  }

  handleResetMFAClick(user: UserElement): void {
    this.dialog.open<void, { id: number; user: string }>(SettingsCoreRolesResetMfaDialogComponent, {
      data: {
        id: user.id,
        user: user.name
      }
    });
  }

  handleEditRoleClick(role: RoleElement): void {
    this.dialog.open<void, RoleDialogData>(SettingsCoreRolesCreateRoleDialogComponent, {
      data: {
        type: 'edit',
        company_id: this.selectedCompany!.id,
        ...role
      }
    });
  }

  handleDeleteRoleClick() {
    this.store.dispatch(SettingsActions.deleteRole({ id: this.selectedRole!.id }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.deleteRoleSuccess]),
        tap(() => (this.selectedRole = undefined)),
        tap(() =>
          this.store.dispatch(
            SettingsActions.fetchCompanyRoles({
              params: {
                company_id: this.selectedCompany!.id,
                page: 1,
                per_page: 100,
                only_custom_roles: false
              },
              onlySelect: false
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  handleAllRolesClick() {
    this.selectedRole = undefined;
    this.selectedCompany = undefined;
    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));
    this.store.dispatch(SettingsActions.fetchCompanyRoles({ params: { company_id: null, page: 1, per_page: 100, only_custom_roles: true }, onlySelect: true }));
    this.store.dispatch(SettingsActions.fetchUsersResponse({ params: { search: '', company_id: undefined, page: 1, role: undefined } }));
  }

  onPageChange(page: number) {
    this.store.dispatch(
      SettingsActions.fetchUsersResponse({
        params: {
          page
        }
      })
    );
  }
}
