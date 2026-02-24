import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { debounceTime, map, Subject, takeUntil, tap } from 'rxjs';
import { SettingsActions } from '../../settings.actions';
import { AccessGroup, CompanyElement, DriverElement } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { SettingsCoreDriverAddVehicleDialogComponent } from './settings-core-driver-add-vehicle-dialog/settings-core-driver-add-vehicle-dialog.component';
import { AssignVehicleData, EditDriverData, SettingsCoreDriverCreateDriverDialogComponent } from './settings-core-driver-create-new-driver-dialog/settings-core-driver-create-new-driver-dialog.component';
import { SettingsCoreDriverDeleteDriverDialogComponent } from './settings-core-driver-delete-driver-dialog/settings-core-driver-delete-driver-dialog.component';
import { SettingsCoreDriverReleaseVehicleDialogComponent } from './settings-core-driver-release-vehicle-dialog/settings-core-driver-release-vehicle-dialog.component';
import { SettingsCoreDriverResetPasswordDialogComponent } from './settings-core-driver-reset-password-dialog/settings-core-driver-reset-password-dialog.component';

@Component({
  selector: 'app-settings-core-driver',
  templateUrl: './settings-core-driver.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreDriverComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  perPage$ = this.store.select(SettingsSelectors.driverResponseParams).pipe(map(params => params.per_page));
  searchControl = this.fb.control('');
  driverResponse$ = this.store.select(SettingsSelectors.driverResponse);
  companyElements$ = this.store.select(SettingsSelectors.companyElements);
  accessGroup = AccessGroup;
  selectedCompany?: CompanyElement;
  selectedCompanyId?: number;

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.store.dispatch(
      SettingsActions.fetchDriverResponse({
        params: {
          page: 1
        }
      })
    );

    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));

    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        tap(value => this.store.dispatch(SettingsActions.fetchDriverResponse({ params: { search: value ?? '', page: 1 } }))),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCompanyClick(company: CompanyElement) {
    this.selectedCompany = company;
    this.store.dispatch(SettingsActions.fetchDriverResponse({ params: { search: '', page: 1, company_id: company.id } }));
  }

  handleAllDriversClick() {
    this.selectedCompany = undefined;
    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));
    this.store.dispatch(SettingsActions.fetchDriverResponse({ params: { search: '', page: 1, company_id: undefined } }));
  }

  handleCreateDriverClick(): void {
    this.dialog.open<void, EditDriverData>(SettingsCoreDriverCreateDriverDialogComponent, {
      data: {
        company_id: this.selectedCompany?.id!
      }
    });
  }

  handleEditDriverClick(driver: DriverElement): void {
    this.dialog.open<void, EditDriverData>(SettingsCoreDriverCreateDriverDialogComponent, {
      data: {
        id: driver.id,
        company_id: driver.company_id
      }
    });
  }

  handleDeleteDriverClick(user: DriverElement): void {
    this.dialog.open<void, { id: number; name: string; company: string }>(SettingsCoreDriverDeleteDriverDialogComponent, {
      data: {
        id: user.id,
        name: user.name,
        company: user.company_id?.toString() ?? 'Company'
      }
    });
  }

  handleResetPasswordClick(user: DriverElement): void {
    this.dialog.open<void, { id: number; name: string }>(SettingsCoreDriverResetPasswordDialogComponent, {
      data: {
        id: user.user_id,
        name: user.name
      }
    });
  }

  handleReleaseVehicleClick(driver: DriverElement): void {
    this.dialog.open<void, EditDriverData>(SettingsCoreDriverReleaseVehicleDialogComponent, {
      data: {
        id: driver.id,
        company_id: driver.company_id
      }
    });
  }
  handleAddVehicleClick(driver: DriverElement): void {
    this.dialog.open<void, AssignVehicleData>(SettingsCoreDriverAddVehicleDialogComponent, {
      data: {
        id: driver.id,
        vehicle_id: driver.vehicle_id
      }
    });
  }

  onPageChange(page: number) {
    this.store.dispatch(
      SettingsActions.fetchDriverResponse({
        params: {
          page
        }
      })
    );
  }
}
