import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, first, interval, map, pairwise, startWith, Subject, Subscription, takeUntil, tap, withLatestFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import RouteConst from '../../../../const/route';
import { ExportType } from '../../../../model/export-type.model';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../store/app-store.model';
import { VehiclesTreeElement } from '../../../../store/common-objects/common-objects.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { EventsActions } from '../../../events/events.actions';
import { EventsSelectors } from '../../../events/events.selectors';
import { AccessGroup } from '../../../settings/settings.model';
import { ReportsActions } from '../../reports.actions';
import { AlarmsReportParamsRequest } from '../../reports.model';
import { ReportsSelectors } from '../../reports.selectors';

type VehicleByDeviceId = Record<string, VehiclesTreeElement | undefined>;

@Component({
  selector: 'app-reports-core-vehicles-alarms',
  templateUrl: './reports-core-vehicles-alarms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreVehiclesAlarmsComponent implements OnInit, OnDestroy {
  readonly SHOW_EXPORT_WITHOUT_FILTERS = environment.reportsAlarmsShowExportWithoutFilters;
  accessGroup = AccessGroup;
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  alarmsLoading$ = this.store.select(ReportsSelectors.alarmsLoading);
  alarms$ = this.store.select(ReportsSelectors.alarms);
  vehiclesLoading$ = this.store.select(EventsSelectors.vehiclesLoading);
  bodyGroup = this.fb.group<Nullable<Pick<AlarmsReportParamsRequest, 'vehicle_id' | 'driver_id'>>>({
    vehicle_id: undefined,
    driver_id: undefined
  });

  isFilterChanging = false;

  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
      }))
    )
  );
  driverOptions$ = this.store.select(CommonObjectsSelectors.driversTree).pipe(
    map((drivers): SelectControl[] =>
      drivers.map(driver => ({
        value: driver.id,
        label: `${driver.name}`
      }))
    )
  );
  vehicleByDeviceId$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(map(vehicles => vehicles.reduce((prev, curr): VehicleByDeviceId => ({ ...prev, [curr.device_id]: curr }), {} as VehicleByDeviceId)));

  constructor(private readonly store: Store<AppState>, private readonly fb: NonNullableFormBuilder, private readonly router: Router, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.fetchAlarms({ params: {} }));

    this.sub.add(
      this.store
        .select(EventsSelectors.eventsParams)
        .pipe(
          first(),
          tap(() => {
            this.bodyGroup.reset({
              vehicle_id: undefined,
              driver_id: undefined
            });

            this.fetchData();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.bodyGroup.valueChanges
        .pipe(
          startWith(this.bodyGroup.value),
          pairwise(),
          tap(() => {
            this.isFilterChanging = true;
            this.cdr.detectChanges();
            this.fetchData();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.alarmsLoading$
        .pipe(
          tap(isLoading => {
            if (!isLoading && this.isFilterChanging) {
              this.isFilterChanging = false;
              this.cdr.detectChanges();
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(ReportsSelectors.fleetId)
        .pipe(
          tap(fleetId => {
            this.store.dispatch(EventsActions.fetchVehicles({ params: { fleet_id: fleetId } }));
            this.fetchData(true);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      interval(10000)
        .pipe(
          filter(() => !document.hidden),
          withLatestFrom(this.alarmsLoading$),
          filter(([, loading]) => !loading),
          tap(() => this.fetchData()),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(ReportsSelectors.rangeFilter)
        .pipe(
          tap(() => this.store.dispatch(ReportsActions.fetchAlarms({ params: {} }))),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.alarmsLoading$
        .pipe(
          filter(loading => loading && this.isFilterChanging),
          tap(() => {
            setTimeout(() => {
              if (this.isFilterChanging) {
                this.isFilterChanging = false;
                this.cdr.detectChanges();
              }
            }, 10000);
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

  handleExportClick(exportType: ExportType): void {
    this.store.dispatch(ReportsActions.exportAlarms({ exportType }));
  }

  handleExportAlarmsClick(exportType: ExportType): void {
    this.store.dispatch(
      ReportsActions.exportAlarms({
        exportType: exportType
      })
    );
  }

  handleVehicleClick(id?: number): void {
    if (id) {
      this.router.navigate(['/', RouteConst.vehicles, id]);
    }
  }

  handleDriverClick(id?: number): void {
    if (id) {
      this.router.navigate(['/', RouteConst.drivers, id]);
    }
  }

  private fetchData(resetVehicle?: boolean): void {
    const value = this.bodyGroup.value as Pick<AlarmsReportParamsRequest, 'vehicle_id' | 'driver_id'>;

    if (resetVehicle) {
      this.bodyGroup.controls.vehicle_id.setValue(undefined, { emitEvent: false });
    }

    this.store.dispatch(
      ReportsActions.fetchAlarms({
        params: {
          vehicle_id: value.vehicle_id,
          driver_id: value.driver_id
        }
      })
    );
  }
}
