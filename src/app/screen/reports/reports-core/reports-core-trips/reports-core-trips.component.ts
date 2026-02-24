import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, first, map, Subject, Subscription, takeUntil, tap } from 'rxjs';
import RouteConst from '../../../../const/route';
import { ExportType } from '../../../../model/export-type.model';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../store/app-store.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { AccessGroup } from '../../../settings/settings.model';
import { ReportsActions } from '../../reports.actions';
import { TripsParams } from '../../reports.model';
import { ReportsSelectors } from '../../reports.selectors';

@Component({
  selector: 'app-reports-core-trips',
  templateUrl: './reports-core-trips.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreTripsComponent implements OnInit, OnDestroy {
  accessGroup = AccessGroup;
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  vehicleControl = this.fb.control<number[] | undefined | string[]>([]);
  driverControl = this.fb.control<number | undefined | string>('');
  tripsLoading$ = this.store.select(ReportsSelectors.tripsLoading);
  trips$ = this.store.select(ReportsSelectors.trips);
  tripsMeta$ = this.store.select(ReportsSelectors.tripsMeta);
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

  constructor(private readonly store: Store<AppState>, private readonly fb: FormBuilder, private readonly router: Router) {}

  ngOnInit(): void {
    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        first(),
        tap(fleetId => {
          this.store.dispatch(
            ReportsActions.fetchTrips({
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
        .select(ReportsSelectors.tripsParams)
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
                    ReportsActions.fetchTrips({
                      params: {
                        vehicle_id: value ?? undefined,
                        fleet_id: fleetId,
                        page: 1
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
                    ReportsActions.fetchTrips({
                      params: {
                        driver_id: value ? Number(value) : undefined,
                        fleet_id: fleetId,
                        page: 1
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
                    ReportsActions.fetchTrips({
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
              ReportsActions.fetchTrips({
                params: {
                  fleet_id: fleetId,
                  vehicle_id: this.vehicleControl.value ?? undefined,
                  driver_id: this.driverControl.value ? Number(this.driverControl.value) : undefined,
                  page: 1
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

  handleNextPageRequest(page: TripsParams['page']): void {
    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        first(),
        tap(fleetId => {
          this.store.dispatch(
            ReportsActions.fetchTrips({
              params: {
                page,
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
  }

  handleExportClick(exportType: ExportType): void {
    this.store.dispatch(ReportsActions.exportTrips({ exportType }));
  }

  handleViewLiveClick(vehicleId: number): void {
    this.router.navigate(['/', RouteConst.stream, vehicleId]);
  }

  handleViewPlaybackClick(vehicleId: number): void {
    if (!vehicleId) {
      return;
    }
    this.router.navigate(['/', RouteConst.playbacks, vehicleId]);
  }
}
