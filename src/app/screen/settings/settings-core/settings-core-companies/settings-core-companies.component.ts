import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { debounceTime, filter, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserData } from '../../../../store/auth/auth.model';
import { SettingsActions } from '../../settings.actions';
import { AccessGroup, CompanyElement, FleetAccess, UserElement } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { EditUserData, SettingsCoreRolesCreateUserDialogComponent } from '../settings-core-roles/settings-core-roles-create-user-dialog/settings-core-roles-create-user-dialog.component';
import { SettingsCoreRolesDeleteUserDialogComponent } from '../settings-core-roles/settings-core-roles-delete-user-dialog/settings-core-roles-delete-user-dialog.component';
import { SettingsCoreRolesResetMfaDialogComponent } from '../settings-core-roles/settings-core-roles-reset-mfa-dialog/settings-core-roles-reset-mfa-dialog.component';
import { SettingsCoreRolesResetPasswordDialogComponent } from '../settings-core-roles/settings-core-roles-reset-password-dialog/settings-core-roles-reset-password-dialog.component';
import { EditCompanyData, SettingsCoreCompaniesCreateCompanyDialogComponent } from './settings-core-companies-create-company-dialog/settings-core-companies-create-company-dialog.component';
import { EditFleetAccessData, SettingsCoreCompaniesCreateFleetAccessDialogComponent } from './settings-core-companies-create-fleet-access-dialog/settings-core-companies-create-fleet-access-dialog.component';
import { SettingsCoreCompaniesDeleteCompanyDialogComponent } from './settings-core-companies-delete-company-dialog/settings-core-companies-delete-company-dialog.component';
import { SettingsCoreCompaniesDeleteFleetAccessDialogComponent } from './settings-core-companies-delete-fleet-access-dialog/settings-core-companies-delete-fleet-access-dialog.component';

@Component({
  selector: 'app-settings-core-companies',
  templateUrl: './settings-core-companies.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreCompaniesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly perPage = 10;
  readonly accessGroup = AccessGroup;
  searchControl = this.fb.control('');
  usersResponse$ = this.store.select(SettingsSelectors.usersResponse);
  companyElements$ = this.store.select(SettingsSelectors.companyElements);
  fleetAccesses$ = this.store.select(SettingsSelectors.fleetAccessFilter);
  selectedCompany?: CompanyElement;
  selectedFleetAccess?: FleetAccess;
  @Input() user?: UserData;

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.fetchCompaniesTreeReset());
    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));
    if (this.user?.role !== 'SUPER_ADMIN' && this.user?.company_id) {
      this.store.dispatch(SettingsActions.fetchFleetAccess({ params: { company_id: this.user.company_id, page: 1, per_page: 100 } }));
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        tap(value => this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false, search: value ?? '' } }))),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.companyElements$
      .pipe(
        tap(companies => {
          if (this.selectedCompany) {
            this.selectedCompany = companies.find(company => company.id === this.selectedCompany?.id);
          }
        }),
        filter(() => this.user?.role !== 'SUPER_ADMIN' && this.user?.role !== 'ADMIN'),
        tap(companies => {
          this.selectedCompany = companies.find(company => company.id === this.user?.company_id);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleAllCompanyClick() {
    this.selectedFleetAccess = undefined;
    this.selectedCompany = undefined;
  }

  handleCompanyClick(company: CompanyElement) {
    this.selectedFleetAccess = undefined;
    this.selectedCompany = company;
    this.store.dispatch(SettingsActions.fetchFleetAccessFilter({ params: { company_id: company.id, page: 1, per_page: 100 } }));
  }

  handleFleetAccessClick(fleetAccess: FleetAccess): void {
    this.selectedFleetAccess = fleetAccess;
    this.store.dispatch(SettingsActions.fetchUsersResponse({ params: { search: '', page: 1, company_id: this.selectedCompany?.id, fleet_access: fleetAccess.id } }));
  }

  handleCreateCompanyClick(): void {
    this.dialog.open<void, EditCompanyData>(SettingsCoreCompaniesCreateCompanyDialogComponent, {
      data: {}
    });
  }

  handleEditCompanyClick(company: CompanyElement): void {
    this.dialog.open<void, EditCompanyData>(SettingsCoreCompaniesCreateCompanyDialogComponent, {
      data: {
        id: company.id,
        name: company.name
      }
    });
  }

  handleDeleteCompanyClick(company: CompanyElement): void {
    this.dialog.open<void, { id: number; name: string }>(SettingsCoreCompaniesDeleteCompanyDialogComponent, {
      data: {
        id: company.id,
        name: company.name
      }
    });
  }

  handleCreateUserClick(): void {
    this.dialog.open<void, EditUserData>(SettingsCoreRolesCreateUserDialogComponent, {
      data: {
        type: 'create',
        company_id: this.selectedCompany?.id!
      }
    });
  }

  handleEditUserClick(user: UserElement): void {
    this.dialog.open<void, EditUserData>(SettingsCoreRolesCreateUserDialogComponent, {
      data: {
        type: 'edit',
        id: user.id,
        company_id: user.company_id
      }
    });
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

  handleCreateFleetAccessClick(): void {
    this.dialog.open<void, EditFleetAccessData>(SettingsCoreCompaniesCreateFleetAccessDialogComponent, {
      data: {
        type: 'create',
        companyName: this.selectedCompany?.name ?? '',
        companyId: this.selectedCompany?.id!
      }
    });
  }

  handleEditFleetAccessClick(fleetAccess: FleetAccess): void {
    this.dialog.open<void, EditFleetAccessData>(SettingsCoreCompaniesCreateFleetAccessDialogComponent, {
      data: {
        type: 'edit',
        fleet: fleetAccess,
        companyName: this.selectedCompany?.name ?? '',
        companyId: this.selectedCompany?.id!
      }
    });
  }

  handleDeleteFleetAccessClick(fleetAccess: FleetAccess): void {
    this.dialog.open<void, { id: number; fleetAccess: string; company_id: number | undefined }>(SettingsCoreCompaniesDeleteFleetAccessDialogComponent, {
      data: {
        id: fleetAccess.id,
        fleetAccess: fleetAccess.name,
        company_id: this.selectedCompany?.id
      }
    });
  }

  onPageUserChange(page: number) {
    this.store.dispatch(
      SettingsActions.fetchUsersResponse({
        params: {
          page,
          per_page: this.perPage
        }
      })
    );
  }
}
