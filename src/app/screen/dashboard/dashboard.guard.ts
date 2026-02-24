import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { finalize, map, Observable, of, Subscription, tap, withLatestFrom } from 'rxjs';
import { WebSocketService } from 'src/app/service/web-socket/web-socket.service';
import { AppState } from 'src/app/store/app-store.model';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { FleetUtil } from 'src/app/util/fleet';
import { filterNullish, firstNonNullish, waitOnceForActions } from 'src/app/util/operators';
import { UserData } from '../../store/auth/auth.model';
import { AuthSelectors } from '../../store/auth/auth.selectors';
import { CommonObjectsActions } from '../../store/common-objects/common-objects.actions';
import { CommonObjectsSelectors } from '../../store/common-objects/common-objects.selectors';
import { AccessGroup } from '../settings/settings.model';
import { DashboardActions } from './dashboard.actions';
import { dashboardInitialState } from './dashboard.reducer';
import { DashboardSelectors } from './dashboard.selectors';

@Injectable({ providedIn: 'root' })
export class DashboardGuard implements CanActivate, CanDeactivate<boolean> {
  private sub?: Subscription;

  constructor(private readonly webSocket: WebSocketService, private readonly store: Store<AppState>, private readonly actions$: Actions) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'DashboardGuard' }));
    this.store.dispatch(DashboardActions.reset());

    let waitForActions: any[] = [];

    this.store.select(AuthSelectors.loggedInUser).subscribe((loggedInUser: UserData | undefined) => {
      if (loggedInUser && (loggedInUser.role === 'SUPER_ADMIN' || loggedInUser.access_groups.includes(AccessGroup.DASHBOARD_VIEWER))) {
        this.sub = new Subscription();
        this.sub.add(
          this.store
            .select(CommonObjectsSelectors.mapVehicles)
            .pipe(
              tap(vehicles =>
                this.webSocket.connect(
                  vehicles.map(vehicle => vehicle.device_id),
                  ['sub_gps', 'sub_alarm']
                )
              )
            )
            .subscribe()
        );
        this.sub.add(
          this.store
            .select(state => state.webSocket.shared)
            .pipe(
              withLatestFrom(this.store.select(CommonObjectsSelectors.updatedMapVehicles)),
              map(([event, vehicles]) => FleetUtil.updateFleetInList(event, vehicles)),
              filterNullish(),
              tap(data => this.store.dispatch(CommonObjectsActions.setUpdatedMapVehicles({ data })))
            )
            .subscribe()
        );
        this.sub.add(
          this.store
            .select(CommonObjectsSelectors.fleetsTree)
            .pipe(
              map(fleetsTree => {
                const savedFleetId = localStorage.getItem('exeros-fleet-id');
                if (savedFleetId) {
                  const fleetId = parseInt(savedFleetId, 10);
                  if (!isNaN(fleetId)) {
                    return fleetId;
                  }
                }
                return fleetsTree[0]?.id;
              }),
              firstNonNullish(),
              tap(fleetId => this.store.dispatch(CommonObjectsActions.fetchMapVehicles({ params: { fleet_id: fleetId } }))),
              tap(fleetId => this.store.dispatch(DashboardActions.fetchDashboard({ params: { fleet_id: fleetId } }))),
              tap(fleetId => this.store.dispatch(DashboardActions.fetchVehicleChecks({ params: { fleet_id: fleetId } }))),
              tap(fleetId => this.store.dispatch(DashboardActions.fetchAccidents({ params: { fleet_id: fleetId, page: dashboardInitialState.accidentsParams.page, per_page: dashboardInitialState.accidentsParams.per_page } })))
            )
            .subscribe()
        );
        this.sub.add(
          this.store
            .select(DashboardSelectors.rangeFilter)
            .pipe(
              tap(() => this.store.dispatch(DashboardActions.fetchDashboard({ params: {} }))),
              tap(() => this.store.dispatch(DashboardActions.fetchAccidents({ params: { page: dashboardInitialState.accidentsParams.page, per_page: dashboardInitialState.accidentsParams.per_page } }))),
              tap(() => this.store.dispatch(DashboardActions.fetchVehicleChecks({ params: {} })))
            )
            .subscribe()
        );
        waitForActions.push(CommonObjectsActions.fetchMapVehiclesSuccess);
        waitForActions.push(DashboardActions.fetchDashboardSuccess);
        waitForActions.push(DashboardActions.fetchAccidentsSuccess);
        waitForActions.push(DashboardActions.fetchVehicleChecksSuccess);
      }
    });

    if (waitForActions.length === 0) {
      return of(true).pipe(finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'DashboardGuard' }))));
    }

    return this.actions$.pipe(
      waitOnceForActions(waitForActions),
      finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'DashboardGuard' })))
    );
  }

  canDeactivate(): boolean {
    this.sub?.unsubscribe();
    this.webSocket.disconnect();
    return true;
  }
}
