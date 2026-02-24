import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, Subject, Subscription, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthSelectors } from 'src/app/store/auth/auth.selectors';
import { firstNonNullish, waitOnceForAction } from 'src/app/util/operators';
import { SelectControl } from '../../../../../shared/component/control/select-control/select-control.model';
import { SettingsActions } from '../../../settings.actions';
import { CreateUpdateDriver } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';

export interface EditDriverData {
  id?: number;
  company_id: number;
}

export interface AssignVehicleData {
  id?: number;
  vehicle_id?: number;
}

@Component({
  templateUrl: './settings-core-driver-create-new-driver-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreDriverCreateDriverDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly sub = new Subscription();

  bodyGroup = this.fb.group({
    company: [this.data?.company_id, Validators.required],
    name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', Validators.required],
    licence_number: '',
    allow_automated_assignment: [false, Validators.required]
  });
  allowed_notifications = this.fb.control<number[]>([]);
  fleet_access_ids = this.fb.control<number[]>([], Validators.required);
  title = '';
  button = '';
  previousCompanyId = this.data?.company_id;

  companyOptions$ = this.store.select(SettingsSelectors.companyElements).pipe(
    map((elements): SelectControl<number>[] =>
      elements.map(element => ({
        label: element.name,
        value: element.id
      }))
    )
  );

  fleetsOptions$ = this.store.select(SettingsSelectors.fleetAccess).pipe(
    map((elements): SelectControl<number>[] =>
      elements.map(element => ({
        label: element.name,
        value: element.id
      }))
    )
  );

  constructor(private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: EditDriverData | undefined, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef) {
    if (this.data?.id == undefined) {
      this.title = 'Create new driver';
      this.button = 'Add driver';
      return;
    }

    this.title = 'Edit driver';
    this.button = 'Save';
  }

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.fetchFleetAccess({ params: { company_id: this.data?.company_id!, page: 1, per_page: 100 } }));

    this.sub.add(
      this.bodyGroup.valueChanges
        .pipe(
          filter(values => values.company != this.previousCompanyId),
          takeUntil(this.destroy$),
          tap(values => {
            this.previousCompanyId = values.company!;
            this.store.dispatch(SettingsActions.fetchFleetAccess({ params: { company_id: values.company!, page: 1, per_page: 100 } }));
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(AuthSelectors.loggedInUser)
        .pipe(
          takeUntil(this.destroy$),
          tap(user => {
            if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
              const control = this.bodyGroup.controls.company;
              control.disable();
              control.setValue(user?.company_id ?? null);
              this.cdr.detectChanges();
            }
          })
        )
        .subscribe()
    );

    if (this.data?.id == undefined) {
      return;
    }

    this.sub.add(
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.fetchFleetAccessSuccess]),
          firstNonNullish(),
          takeUntil(this.destroy$),
          tap(() => this.store.dispatch(SettingsActions.fetchDriver({ id: this.data?.id! })))
        )
        .subscribe()
    );

    this.sub.add(
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.fetchDriverSuccess]),
          switchMap(() => this.store.select(SettingsSelectors.driver)),
          firstNonNullish(),
          takeUntil(this.destroy$),
          tap(driver => {
            this.fleet_access_ids.patchValue(driver.fleet_access_ids);
            this.bodyGroup.patchValue({
              company: this.data!.company_id,
              email: driver.email,
              name: driver.name,
              username: driver.username,
              licence_number: driver.licence_number,
              allow_automated_assignment: driver.allow_automated_assignment
            });
            this.cdr.detectChanges();
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  handleAddDriverClick() {
    this.markFormAsTouched();
    this.store.dispatch(SettingsActions.createDriver({ body: this.getBody() }));
    this.sub.add(
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.createDriverSuccess]),
          takeUntil(this.destroy$),
          tap(() => this.dialogRef.close()),
          tap(() => this.store.dispatch(SettingsActions.fetchDriverResponse({ params: {} })))
        )
        .subscribe()
    );
  }

  handleUpdateDriverClick() {
    this.markFormAsTouched();

    this.store.dispatch(SettingsActions.updateDriver({ id: this.data?.id!, body: this.getBody() }));
    this.sub.add(
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.updateDriverSuccess]),
          takeUntil(this.destroy$),
          tap(() => this.dialogRef.close()),
          tap(() => this.store.dispatch(SettingsActions.fetchDriverResponse({ params: {} })))
        )
        .subscribe()
    );
  }

  private getBody(): CreateUpdateDriver {
    const form = this.bodyGroup.value!;
    const fleetAccessIds = this.fleet_access_ids.value;
    return {
      company_id: form.company!,
      name: form.name!,
      username: form.username ?? undefined,
      email: form.email!,
      licence_number: form.licence_number ?? undefined,
      fleet_access_ids: (fleetAccessIds ?? []).join(','),
      allow_automated_assignment: form.allow_automated_assignment ?? false
    };
  }

  private markFormAsTouched() {
    Object.keys(this.bodyGroup.controls).forEach(key => {
      const control = this.bodyGroup.get(key);
      control?.markAsTouched();
    });
    this.fleet_access_ids.markAsTouched();
    this.cdr.detectChanges();
  }
}
