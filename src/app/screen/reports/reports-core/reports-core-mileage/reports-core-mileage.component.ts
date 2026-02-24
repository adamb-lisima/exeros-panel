import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, first, map, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { ChartOptions } from '../../../../model/chart.model';
import { ExportType } from '../../../../model/export-type.model';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../store/app-store.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { AccessGroup } from '../../../settings/settings.model';
import { ReportsActions } from '../../reports.actions';
import { ReportsSelectors } from '../../reports.selectors';

@Component({
  selector: 'app-reports-core-mileage',
  templateUrl: './reports-core-mileage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreMileageComponent implements OnInit, OnDestroy {
  accessGroup = AccessGroup;
  mileageDownloaderAccess = AccessGroup.MILEAGE_REPORTS_DOWNLOADER;
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  vehicleControl = this.fb.control<number[] | undefined | string[]>([]);
  driverControl = this.fb.control<number | undefined | string>('');
  mileageLoading$ = this.store.select(ReportsSelectors.mileageLoading);
  options$ = this.store.select(ReportsSelectors.mileage).pipe(map((mileage): ChartOptions => ({ series: [{ name: '', data: mileage.map(time => ({ x: time.date, y: Math.round(time.value * 100) / 100, unit: time.unit })) }] })));
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
    map((drivers): SelectControl[] => [
      { value: '', label: 'All Drivers' },
      ...drivers.map(driver => ({
        value: driver.id,
        label: `${driver.name}`
      }))
    ])
  );

  constructor(private readonly store: Store<AppState>, private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        first(),
        tap(fleetId => {
          this.store.dispatch(
            ReportsActions.fetchMileage({
              params: {
                fleet_id: fleetId
              }
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.sub.add(
      this.store
        .select(ReportsSelectors.mileageParams)
        .pipe(
          first(),
          tap(params => {
            this.vehicleControl.reset(params.vehicle_id ?? []);
            this.driverControl.reset(params.driver_id ?? '');
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
                    ReportsActions.fetchMileage({
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
                    ReportsActions.fetchMileage({
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
                    ReportsActions.fetchMileage({
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

    this.sub.add(
      this.store
        .select(ReportsSelectors.fleetId)
        .pipe(
          distinctUntilChanged(),
          tap(fleetId => {
            this.store.dispatch(
              ReportsActions.fetchMileage({
                params: {
                  fleet_id: fleetId,
                  vehicle_id: this.vehicleControl.value ?? undefined,
                  driver_id: this.driverControl.value ? Number(this.driverControl.value) : undefined
                }
              })
            );
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
    this.store.dispatch(ReportsActions.exportMileage({ exportType }));
  }
}
