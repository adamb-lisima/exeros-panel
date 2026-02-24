import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, first, map, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { ExportType } from '../../../../model/export-type.model';
import { VehicleChecksElement, VehicleChecksParams } from '../../../../service/http/vehicle-checks/vehicle-checks.model';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../../util/control';
import { AccessGroup } from '../../../settings/settings.model';
import { ReportsActions } from '../../reports.actions';
import { ReportsSelectors } from '../../reports.selectors';
import { ReportsCoreVehiclesChecksDialogComponent, ReportsCoreVehiclesChecksDialogData } from '../reports-core-vehicles-checks-dialog/reports-core-vehicles-checks-dialog.component';

@Component({
  selector: 'app-reports-core-vehicles-checks',
  templateUrl: './reports-core-vehicles-checks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreVehiclesChecksComponent implements OnInit, OnDestroy {
  accessGroup = AccessGroup;
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  vehicleControl = this.fb.control<number[] | undefined | string[]>([]);
  fleetControl = this.fb.control<number | undefined | string>('');
  driverControl = this.fb.control<number | undefined | string>('');
  statusControl = this.fb.control<VehicleChecksParams['status']>(undefined);
  vehicleChecksLoading$ = this.store.select(ReportsSelectors.vehicleChecksLoading);
  statusOptions: SelectControl<NonNullable<VehicleChecksParams['status']>>[] = [
    { value: 'Passed', label: 'Passed' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Complete', label: 'Complete' },
    { value: 'Incomplete', label: 'Incomplete' }
  ];
  vehicleChecks$ = this.store.select(ReportsSelectors.vehicleChecks);
  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
      }))
    )
  );
  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => ControlUtil.mapFleetsTreeToTreeControls(fleetsTree)));
  driverOptions$ = this.store.select(CommonObjectsSelectors.driversTree).pipe(
    map((drivers): SelectControl[] => [
      { value: '', label: 'All Drivers' },
      ...drivers.map(driver => ({
        value: driver.id,
        label: `${driver.name}`
      }))
    ])
  );

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog) {}
  ngOnInit(): void {
    this.store.dispatch(ReportsActions.fetchVehicleChecks({ params: {} }));

    this.sub.add(
      this.store
        .select(ReportsSelectors.vehicleChecksParams)
        .pipe(
          first(),
          tap(params => {
            this.statusControl.reset(params.status);
            this.vehicleControl.reset(params.vehicle_id ?? []);
            this.driverControl.reset(params.driver_id ?? '');
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(ReportsSelectors.fleetId)
        .pipe(
          distinctUntilChanged(),
          tap(fleetId => {
            this.store.dispatch(
              ReportsActions.fetchVehicleChecks({
                params: {
                  fleet_id: fleetId,
                  vehicle_id: this.vehicleControl.value ?? undefined,
                  driver_id: this.driverControl.value ? Number(this.driverControl.value) : undefined,
                  status: this.statusControl.value ?? undefined
                }
              })
            );
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.vehicleControl.valueChanges
        .pipe(
          tap(value => {
            this.store
              .select(ReportsSelectors.fleetId)
              .pipe(
                first(),
                tap(fleetId => {
                  this.store.dispatch(
                    ReportsActions.fetchVehicleChecks({
                      params: {
                        vehicle_id: value ?? undefined,
                        fleet_id: fleetId
                      }
                    })
                  );
                }),
                takeUntil(this.destroy$)
              )
              .subscribe();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.driverControl.valueChanges
        .pipe(
          tap(value => {
            this.store
              .select(ReportsSelectors.fleetId)
              .pipe(
                first(),
                tap(fleetId => {
                  this.store.dispatch(
                    ReportsActions.fetchVehicleChecks({
                      params: {
                        driver_id: value ? Number(value) : undefined,
                        fleet_id: fleetId
                      }
                    })
                  );
                }),
                takeUntil(this.destroy$)
              )
              .subscribe();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.fleetControl.valueChanges
        .pipe(
          tap(value =>
            this.store.dispatch(
              ReportsActions.fetchVehicleChecks({
                params: { fleet_id: value ? Number(value) : undefined }
              })
            )
          ),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.statusControl.valueChanges
        .pipe(
          tap(value => {
            this.store
              .select(ReportsSelectors.fleetId)
              .pipe(
                first(),
                tap(fleetId => {
                  this.store.dispatch(
                    ReportsActions.fetchVehicleChecks({
                      params: {
                        status: value ?? undefined,
                        fleet_id: fleetId
                      }
                    })
                  );
                }),
                takeUntil(this.destroy$)
              )
              .subscribe();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(ReportsSelectors.rangeFilter)
        .pipe(
          tap(() => {
            this.store
              .select(ReportsSelectors.fleetId)
              .pipe(
                first(),
                tap(fleetId => {
                  this.store.dispatch(
                    ReportsActions.fetchVehicleChecks({
                      params: {
                        fleet_id: fleetId
                      }
                    })
                  );
                }),
                takeUntil(this.destroy$)
              )
              .subscribe();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleExportPageClick(exportType: ExportType): void {
    this.store.dispatch(ReportsActions.exportVehicleChecks({ exportType }));
  }

  handleRowClick(vehicleCheck: VehicleChecksElement): void {
    if (vehicleCheck.vehicle_check_status) {
      this.dialog.open<void, ReportsCoreVehiclesChecksDialogData>(ReportsCoreVehiclesChecksDialogComponent, { data: { id: vehicleCheck.id }, autoFocus: 'dialog' });
    }
  }

  handleExportItemClick(event: MouseEvent | KeyboardEvent, id: number): void {
    event.stopPropagation();
    this.store.dispatch(ReportsActions.exportVehicleCheck({ id }));
  }

  handleExportItem(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.store.dispatch(ReportsActions.exportVehicleCheck({ id }));
  }
}
