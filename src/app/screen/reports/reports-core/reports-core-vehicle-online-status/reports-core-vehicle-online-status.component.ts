import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, first, interval, map, pairwise, startWith, Subject, Subscription, takeUntil, tap, withLatestFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import RouteConst from '../../../../const/route';
import { AppState } from '../../../../store/app-store.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../../util/control';
import { EventsActions } from '../../../events/events.actions';
import { EventsSelectors } from '../../../events/events.selectors';
import { AccessGroup } from '../../../settings/settings.model';
import { ReportsActions } from '../../reports.actions';
import { EventsReportParams } from '../../reports.model';
import { ReportsSelectors } from '../../reports.selectors';

@Component({
  selector: 'app-reports-core-vehicle-online-status',
  templateUrl: './reports-core-vehicle-online-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreVehicleOnlineStatusComponent implements OnInit, OnDestroy {
  readonly SHOW_EXPORT_WITHOUT_FILTERS = environment.reportsAlarmsShowExportWithoutFilters;
  accessGroup = AccessGroup;
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  vehicleOnlineStatusLoading$ = this.store.select(ReportsSelectors.vehicleOnlineStatusLoading);
  vehicles$ = this.store.select(ReportsSelectors.vehicleOnlineStatus);
  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => ControlUtil.mapFleetsTreeToTreeControls(fleetsTree)));
  vehiclesLoading$ = this.store.select(EventsSelectors.vehiclesLoading);
  bodyGroup = this.fb.group<Nullable<Pick<EventsReportParams, 'vehicle_id'>>>({
    vehicle_id: []
  });

  constructor(private readonly store: Store<AppState>, private readonly fb: NonNullableFormBuilder, private readonly router: Router) {}

  ngOnInit(): void {
    this.sub.add(
      this.store
        .select(ReportsSelectors.vehicleOnlineStatusParams)
        .pipe(
          first(),
          tap(() => {
            this.bodyGroup.reset({});
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
          tap(() => this.fetchData()),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      interval(10000)
        .pipe(
          filter(() => !document.hidden),
          withLatestFrom(this.vehicleOnlineStatusLoading$),
          filter(([, loading]) => !loading),
          tap(() => this.fetchData()),
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
            this.store.dispatch(EventsActions.fetchVehicles({ params: { fleet_id: fleetId } }));
            this.fetchData(true);
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
      ReportsActions.exportVehicleOnlineStatus({
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
    const value = this.bodyGroup.value as Pick<EventsReportParams, 'fleet_id' | 'vehicle_id'>;
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
            ReportsActions.fetchVehicleOnlineStatus({
              params: {
                stacked: 'true',
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
