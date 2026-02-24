import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, first, interval, map, pairwise, startWith, Subject, Subscription, takeUntil, tap, withLatestFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import RouteConst from '../../../../const/route';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../store/app-store.model';
import { VehiclesTreeElement } from '../../../../store/common-objects/common-objects.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../../util/control';
import { EventsActions } from '../../../events/events.actions';
import { EventsSelectors } from '../../../events/events.selectors';
import { AccessGroup } from '../../../settings/settings.model';
import { ReportsActions } from '../../reports.actions';
import { EventsReportParams } from '../../reports.model';
import { ReportsSelectors } from '../../reports.selectors';

type VehicleByDeviceId = Record<string, VehiclesTreeElement | undefined>;

@Component({
  selector: 'app-reports-core-distance-driven',
  templateUrl: './reports-core-distance-driven.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreDistanceDrivenComponent implements OnInit, OnDestroy {
  readonly SHOW_EXPORT_WITHOUT_FILTERS = environment.reportsAlarmsShowExportWithoutFilters;
  accessGroup = AccessGroup;
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  distanceDrivenLoading$ = this.store.select(ReportsSelectors.distanceDrivenLoading);
  vehicles$ = this.store.select(ReportsSelectors.distanceDriven);
  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => ControlUtil.mapFleetsTreeToTreeControls(fleetsTree)));
  vehiclesLoading$ = this.store.select(EventsSelectors.vehiclesLoading);
  bodyGroup = this.fb.group<Nullable<Pick<EventsReportParams, 'vehicle_id'>>>({
    vehicle_id: []
  });

  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
      }))
    )
  );
  vehicleByDeviceId$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(map(vehicles => vehicles.reduce((prev, curr): VehicleByDeviceId => ({ ...prev, [curr.device_id]: curr }), {} as VehicleByDeviceId)));

  constructor(private readonly store: Store<AppState>, private readonly fb: NonNullableFormBuilder, private readonly router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.fetchDistanceDriven({ params: {} }));

    this.sub.add(
      this.store
        .select(ReportsSelectors.distanceDrivenParams)
        .pipe(
          first(),
          tap(() =>
            this.bodyGroup.reset({
              vehicle_id: []
            })
          ),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.bodyGroup.valueChanges
        .pipe(
          startWith(this.bodyGroup.value),
          pairwise(),
          tap(() => this.fetchData()),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      interval(10000)
        .pipe(
          filter(() => !document.hidden),
          withLatestFrom(this.distanceDrivenLoading$),
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
          tap(() => {
            this.store
              .select(ReportsSelectors.fleetId)
              .pipe(
                first(),
                tap(fleetId => {
                  this.store.dispatch(
                    ReportsActions.fetchDistanceDriven({
                      params: {
                        fleet_id: fleetId,
                        vehicle_id: this.bodyGroup.value.vehicle_id ? (this.bodyGroup.value.vehicle_id as any[]).join(',') : undefined
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
          first(),
          tap(fleetId => {
            this.store.dispatch(
              ReportsActions.fetchDistanceDriven({
                params: {
                  fleet_id: fleetId
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

  handleExportDistanceClick(): void {
    this.store.dispatch(
      ReportsActions.exportDistanceDriven({
        exportType: 'xlsx'
      })
    );
  }

  handleVehicleClick(id?: number): void {
    if (id) {
      this.router.navigate(['/', RouteConst.vehicles, id]);
    }
  }

  private fetchData(resetVehicle?: boolean): void {
    const value = this.bodyGroup.value as Pick<EventsReportParams, 'vehicle_id'>;
    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        first(),
        tap(fleetId => {
          if (resetVehicle) {
            this.bodyGroup.controls.vehicle_id.setValue([], { emitEvent: false });
            this.store.dispatch(EventsActions.fetchVehicles({ params: { fleet_id: fleetId } }));
          }

          this.store.dispatch(
            ReportsActions.fetchDistanceDriven({
              params: {
                vehicle_id: resetVehicle ? undefined : (value.vehicle_id ?? []).join(','),
                fleet_id: fleetId
              }
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
