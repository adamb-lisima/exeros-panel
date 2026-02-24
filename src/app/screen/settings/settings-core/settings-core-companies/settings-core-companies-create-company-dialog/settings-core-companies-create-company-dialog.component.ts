import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { first, map, Subject, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from '../../../../../shared/component/control/select-control/select-control.model';
import { LicenseRenewalRemindMeBefore } from '../../../../../store/auth/auth.model';
import { CommonObjectsSelectors } from '../../../../../store/common-objects/common-objects.selectors';
import { ConfigSelectors } from '../../../../../store/config/config.selectors';
import { firstNonNullish, waitOnceForAction } from '../../../../../util/operators';
import { SettingsActions } from '../../../settings.actions';
import { CreateUpdateCompany } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';

export interface EditCompanyData {
  id?: number;
  name?: string;
}

@Component({
  selector: 'app-settings-core-companies-create-company-dialog',
  templateUrl: './settings-core-companies-create-company-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreCompaniesCreateCompanyDialogComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  rolesOptions$ = this.store.select(SettingsSelectors.allRoles).pipe(
    map((elements): SelectControl<number>[] =>
      elements.map(element => ({
        label: element.name,
        value: element.id
      }))
    )
  );

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(
    map(data =>
      data[0].children.map(fleet => ({
        value: fleet.id,
        label: fleet.name,
        profile: fleet.profile
      }))
    )
  );

  remindOptions: SelectControl<LicenseRenewalRemindMeBefore>[] = [
    { value: 'DAY', label: 'DAY' },
    { value: 'WEEK', label: 'WEEK' },
    { value: 'TWO_WEEKS', label: 'TWO WEEKS' },
    { value: 'MONTH', label: 'MONTH' }
  ];

  eventTypes: SelectControl<string>[] = [];

  bodyGroup = this.fb.group({
    company: 1,
    role_ids: this.fb.control<number[]>([]),
    fleet_ids: this.fb.control<number[]>([]),
    name: ['', Validators.required],
    licence_end_date: ['', Validators.required],
    license_renewal_remind_me_before: this.fb.control<LicenseRenewalRemindMeBefore[]>([]),
    mfa_status: true,
    video_timeout: 60,
    review_required_event_types: this.fb.control<string[]>([]),
    users_limit: this.fb.control<number | null>(10)
  });

  title = '';
  button = '';
  file?: File;

  constructor(@Inject(DIALOG_DATA) public data: EditCompanyData, private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.fetchAllRoles());

    this.store
      .select(ConfigSelectors.data)
      .pipe(
        first(),
        takeUntil(this.destroy$),
        map(data => data?.event_types),
        tap(events => {
          if (events) {
            this.eventTypes = events.map(event => ({
              label: event.name,
              value: event.name
            }));
          }
        })
      )
      .subscribe();

    if (this.data?.id == undefined) {
      this.title = 'Create new company';
      this.button = 'Add company';
      return;
    }

    this.title = 'Edit company';
    this.button = 'Save';

    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.fetchAllRolesSuccess]),
        firstNonNullish(),
        takeUntil(this.destroy$),
        tap(() => this.store.dispatch(SettingsActions.fetchCompany({ id: this.data.id! })))
      )
      .subscribe();

    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.fetchCompanySuccess]),
        switchMap(() => this.store.select(SettingsSelectors.companyElement)),
        firstNonNullish(),
        takeUntil(this.destroy$),
        tap(company => {
          let statusBoolean = false;
          if (company.mfa_status === 'ACTIVE') {
            statusBoolean = true;
          }
          this.bodyGroup.patchValue({
            name: company.name,
            licence_end_date: company.licence_end_date,
            role_ids: company.role_ids,
            fleet_ids: company.fleet_ids,
            mfa_status: statusBoolean,
            video_timeout: company.video_timeout,
            license_renewal_remind_me_before: company.license_renewal_remind_me_before,
            review_required_event_types: company.review_required_event_types,
            users_limit: company.users_limit
          });
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  handleAddCompanyClick() {
    this.markFormAsTouched();

    this.store.dispatch(SettingsActions.createCompany({ body: this.getBody() }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.updateCompanySuccess]),
        takeUntil(this.destroy$),
        tap(() => this.dialogRef.close()),
        tap(() => this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }))),
        switchMap(() => this.store.select(SettingsSelectors.companyElement)),
        firstNonNullish(),
        tap(companyElement => this.handleLogoChange(companyElement.id))
      )
      .subscribe();
  }

  handleUpdateCompanyClick() {
    this.markFormAsTouched();

    this.store.dispatch(SettingsActions.updateCompany({ id: this.data.id!, body: this.getBody() }));
    this.handleLogoChange(this.data.id!);
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.updateCompanySuccess]),
        takeUntil(this.destroy$),
        tap(() => this.dialogRef.close()),
        tap(() => this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } })))
      )
      .subscribe();
  }

  private getBody(): CreateUpdateCompany {
    const form = this.bodyGroup.value;
    return {
      name: form.name!,
      fleet_ids: (form.fleet_ids ?? []).join(','),
      role_ids: (form.role_ids ?? []).join(','),
      licence_end_date: form.licence_end_date!,
      license_renewal_remind_me_before: form.license_renewal_remind_me_before ?? [],
      mfa_status: form.mfa_status ? 'ACTIVE' : 'INACTIVE',
      video_timeout: form.video_timeout && form.video_timeout > 0 ? form.video_timeout : 0,
      review_required_event_types: form.review_required_event_types ?? [],
      users_limit: form.users_limit ?? null
    };
  }

  handleAvatarChange(file: File): void {
    this.file = file;
  }

  handleLogoChange(companyId: number): void {
    if (this.file) {
      this.store.dispatch(SettingsActions.updateCompanyLogo({ companyId: companyId, file: this.file }));
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.updateCompanySuccess]),
          takeUntil(this.destroy$),
          tap(() => this.dialogRef.close()),
          tap(() => this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } })))
        )
        .subscribe();
    }
  }

  private markFormAsTouched() {
    Object.keys(this.bodyGroup.controls).forEach(key => {
      const control = this.bodyGroup.get(key);
      control?.markAsTouched();
    });
    this.cdr.detectChanges();
  }
}
