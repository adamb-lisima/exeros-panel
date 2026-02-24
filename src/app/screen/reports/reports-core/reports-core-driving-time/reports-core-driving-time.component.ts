import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, first, map, Subject, Subscription, take, takeUntil, tap } from 'rxjs';
import { ChartOptions } from '../../../../model/chart.model';
import { ExportType } from '../../../../model/export-type.model';
import { LineChartComponent } from '../../../../shared/component/chart/line-chart/line-chart.component';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../store/app-store.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { AccessGroup } from '../../../settings/settings.model';
import { ReportsActions } from '../../reports.actions';
import { ReportsSelectors } from '../../reports.selectors';

@Component({
  selector: 'app-reports-core-driving-time',
  templateUrl: './reports-core-driving-time.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreDrivingTimeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(LineChartComponent) lineChart!: LineChartComponent;

  accessGroup = AccessGroup;
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  vehicleControl = this.fb.control<number[] | undefined | string[]>([]);
  driverControl = this.fb.control<number | undefined | string>('');
  drivingTimeLoading$ = this.store.select(ReportsSelectors.drivingTimeLoading);
  options$ = this.store.select(ReportsSelectors.drivingTime).pipe(
    map(
      (drivingTime): ChartOptions => ({
        series: [{ name: '', data: drivingTime.map(time => ({ x: time.date, y: time.value, unit: time.unit })) }]
      })
    ),
    tap(() => {
      setTimeout(() => this.updateChartWithHours(), 100);
    })
  );

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
            ReportsActions.fetchDrivingTime({
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
        .select(ReportsSelectors.drivingTimeParams)
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
                    ReportsActions.fetchDrivingTime({
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
                    ReportsActions.fetchDrivingTime({
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
                    ReportsActions.fetchDrivingTime({
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
              .subscribe();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.options$.pipe(take(1), takeUntil(this.destroy$)).subscribe();

    this.sub.add(
      this.options$
        .pipe(
          filter(options => options.series[0].data.length > 0),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          Promise.resolve().then(() => this.updateChartWithHours());
        })
    );

    this.sub.add(
      this.store
        .select(ReportsSelectors.fleetId)
        .pipe(
          distinctUntilChanged(),
          tap(fleetId => {
            this.store.dispatch(
              ReportsActions.fetchDrivingTime({
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

  ngAfterViewInit() {
    setTimeout(() => this.updateChartWithHours(), 500);
  }

  private updateChartWithHours() {
    if (this.lineChart && this.lineChart.chart) {
      const customOptions = {
        yaxis: {
          labels: {
            formatter: (val: number) => `${val.toFixed(0)} hours`
          }
        }
      };
      this.lineChart.chart.updateOptions(customOptions);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleExportClick(exportType: ExportType): void {
    this.store.dispatch(ReportsActions.exportDrivingTime({ exportType }));
  }
}
