import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, startWith, Subject, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from '../../../../../shared/component/control/select-control/select-control.model';
import { CommonObjectsSelectors } from '../../../../../store/common-objects/common-objects.selectors';
import { ConfigSelectors } from '../../../../../store/config/config.selectors';
import ControlUtil from '../../../../../util/control';
import { firstNonNullish, waitOnceForAction } from '../../../../../util/operators';
import { SettingsActions } from '../../../settings.actions';
import { CreateUpdateReportBody } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';

export interface EditReportData {
  id: number;
  name?: string;
  type?: string;
  receivers?: string[];
  fleet_ids?: number[];
  status?: string;
}
@Component({
  selector: 'app-settings-core-reports-new-report',
  templateUrl: './settings-core-reports-new-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreReportsNewReportComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  bodyGroup = this.fb.group({
    name: ['', Validators.required],
    type: '',
    status: true,
    fleet_ids: this.fb.control<number[]>([]),
    receivers: this.fb.control<string[]>([]),
    event_types: this.fb.control<string[]>([]),
    vehicle_ids: this.fb.control<number[]>([]),
    driver_ids: this.fb.control<number[]>([]),
    report_type: 'EVENT',
    resource_type: 'FLEET'
  });
  fleets = this.fb.control<number[]>([]);

  title = '';
  button = '';
  mode = '';
  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-success-500' : undefined
      }))
    )
  );
  driverOptions$ = this.store.select(CommonObjectsSelectors.driversTree).pipe(
    map((drivers): SelectControl[] =>
      drivers.map(driver => ({
        value: driver.id,
        label: driver.name
      }))
    )
  );
  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => ControlUtil.mapFleetsTreeToTreeControls(fleetsTree)));
  eventTypes$ = this.store.select(ConfigSelectors.data).pipe(map(data => data?.event_types.map(type => ({ value: type.default_name, label: type.name }))));
  reportTypes: SelectControl[] = [
    { value: 'EVENT', label: 'EVENT' },
    { value: 'DISTANCE', label: 'DISTANCE' },
    { value: 'DRIVER_SCORE', label: 'DRIVER SCORE' }
  ];
  typeOptions: SelectControl<CreateUpdateReportBody['type']>[] = [
    { value: 'WEEKLY', label: 'WEEKLY' },
    { value: 'DAILY', label: 'DAILY' },
    { value: 'MONTHLY', label: 'MONTHLY' }
  ];

  resourceTypes: SelectControl<CreateUpdateReportBody['resource_type']>[] = [
    { value: 'FLEET', label: 'FLEET' },
    { value: 'VEHICLE', label: 'VEHICLE' }
  ];

  constructor(private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: EditReportData | undefined, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.bodyGroup.controls.report_type.valueChanges
      .pipe(
        startWith(this.bodyGroup.controls.report_type.value),
        takeUntil(this.destroy$),
        tap(reportType => {
          this.updateResourceTypes(reportType ?? 'EVENT');
        })
      )
      .subscribe();

    if (this.data?.id === undefined) {
      this.title = 'Create new report';
      this.button = 'Add report';
      this.mode = 'create';
      return;
    }

    this.store.dispatch(SettingsActions.fetchReport({ id: this.data.id }));
    this.title = 'Edit report';
    this.button = 'Save';
    this.mode = 'edit';

    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.fetchReportSuccess]),
        switchMap(() => this.store.select(SettingsSelectors.report)),
        firstNonNullish(),
        tap(report => {
          this.updateResourceTypes(report.report_type ?? 'EVENT');

          let statusBoolean = false;
          if (report.status === 'ACTIVE') {
            statusBoolean = true;
          }
          this.bodyGroup.patchValue({
            name: report.name,
            type: report.type,
            status: statusBoolean,
            fleet_ids: report.fleet_ids,
            vehicle_ids: report.vehicle_ids,
            driver_ids: report.driver_ids,
            receivers: report.receivers,
            event_types: report.event_types,
            report_type: report.report_type,
            resource_type: report.resource_type
          });

          setTimeout(() => {
            this.cdr.detectChanges();
          }, 0);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private updateResourceTypes(reportType: string): void {
    if (reportType === 'DRIVER_SCORE') {
      this.resourceTypes = [
        { value: 'FLEET', label: 'FLEET' },
        { value: 'VEHICLE', label: 'VEHICLE' },
        { value: 'DRIVER', label: 'DRIVER' }
      ];
    } else {
      this.resourceTypes = [
        { value: 'FLEET', label: 'FLEET' },
        { value: 'VEHICLE', label: 'VEHICLE' }
      ];

      const currentResourceType = this.bodyGroup.controls.resource_type.value;
      if (currentResourceType === 'DRIVER') {
        this.bodyGroup.controls.resource_type.setValue('FLEET');
      }
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleAddReportClick() {
    this.markFormAsTouched();

    this.store.dispatch(SettingsActions.createReport({ body: this.getBody() }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.createReportSuccess]),
        tap(() => this.dialogRef.close()),
        tap(() => this.store.dispatch(SettingsActions.fetchReportResponse({ params: {} }))),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  handleUpdateReportClick() {
    this.markFormAsTouched();

    this.store.dispatch(SettingsActions.updateReport({ id: this.data?.id!, body: this.getBody() }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.updateReportSuccess]),
        tap(() => this.dialogRef.close()),
        tap(() => this.store.dispatch(SettingsActions.fetchReportResponse({ params: {} }))),
        tap(() => this.store.dispatch(SettingsActions.fetchReport({ id: this.data?.id! }))),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private getBody(): CreateUpdateReportBody {
    const form = this.bodyGroup.value!;
    const fleetIds = this.bodyGroup.controls.fleet_ids.value;
    const vehicleIds = this.bodyGroup.controls.vehicle_ids.value;
    const driverIds = this.bodyGroup.controls.driver_ids.value;

    return {
      name: form.name!,
      fleet_ids: form.resource_type === 'FLEET' ? fleetIds ?? [] : [],
      vehicle_ids: form.resource_type === 'VEHICLE' ? vehicleIds ?? [] : [],
      driver_ids: form.resource_type === 'DRIVER' ? driverIds ?? [] : [],
      resource_type: form.resource_type! as 'FLEET' | 'VEHICLE' | 'DRIVER',
      type: form.type === 'DAILY' || form.type === 'WEEKLY' || form.type === 'MONTHLY' ? form.type : 'DAILY',
      receivers: Array.isArray(form.receivers) ? form.receivers.join(',') : form.receivers ?? '',
      status: form.status ? 'ACTIVE' : 'INACTIVE',
      event_types: form.report_type! === 'EVENT' ? form.event_types ?? [] : [],
      report_type: form.report_type!
    };
  }

  private markFormAsTouched() {
    Object.keys(this.bodyGroup.controls).forEach(key => {
      const control = this.bodyGroup.get(key);
      control?.markAsTouched();
    });
    this.cdr.detectChanges();
  }
}
