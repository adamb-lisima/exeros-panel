import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { finalize, map, Observable, skip, Subscription, tap, withLatestFrom } from 'rxjs';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { firstNonNullish, waitOnceForActions } from 'src/app/util/operators';
import { WebSocketService } from '../../service/web-socket/web-socket.service';
import { AppState } from '../../store/app-store.model';
import { CommonObjectsSelectors } from '../../store/common-objects/common-objects.selectors';
import RoutingUtil from '../../util/routing.util';
import { DriversActions } from './drivers.actions';
import { DriversRouteParams } from './drivers.model';
import { driversInitialState } from './drivers.reducer';
import { DriversSelectors } from './drivers.selectors';

@Injectable({ providedIn: 'root' })
export class DriversGuard implements CanActivate, CanDeactivate<boolean> {
  private sub?: Subscription;

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly router: Router, private readonly webSocket: WebSocketService) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'DriversGuard' }));
    this.store.dispatch(DriversActions.reset());

    this.sub = new Subscription();
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
            return fleetsTree[0]?.id ?? 1;
          }),
          firstNonNullish(),
          tap(fleetId => this.store.dispatch(DriversActions.fetchDrivers({ params: { fleet_id: fleetId } })))
        )
        .subscribe()
    );
    this.sub.add(
      RoutingUtil.mergeParams<DriversRouteParams>(this.router)
        .pipe(
          map(params => (params.id ? Number(params.id) : undefined)),
          tap(id => this.store.dispatch(DriversActions.setSelectedId({ id }))),
          tap(id => this.store.dispatch(id ? DriversActions.fetchDriver() : DriversActions.resetDriver())),
          // tap(id => this.store.dispatch(id ? DriversActions.fetchTrips({ params: { driver_id: id } }) : DriversActions.resetTrips())), //TODO temporary disabled
          tap(id => this.store.dispatch(id ? DriversActions.fetchSafetyScores({ params: { driver_id: id } }) : DriversActions.resetSafetyScores())),
          tap(id => this.store.dispatch(id ? DriversActions.fetchAlarms({ params: { driver_id: id } }) : DriversActions.resetAlarms())),
          tap(id => this.store.dispatch(id ? DriversActions.fetchEvents({ params: { driver_id: id } }) : DriversActions.resetEvents())),
          tap(id => this.store.dispatch(id ? DriversActions.fetchVehicleChecks({ params: { driver_id: id } }) : DriversActions.resetVehicleChecks())),
          tap(id => this.store.dispatch(id ? DriversActions.fetchAccidents({ params: { driver_id: id } }) : DriversActions.resetAccidents()))
        )
        .subscribe()
    );
    this.sub.add(
      this.store
        .select(DriversSelectors.rangeFilter)
        .pipe(
          skip(1),
          tap(() => this.store.dispatch(DriversActions.fetchDriver())),
          tap(() => this.store.dispatch(DriversActions.fetchSafetyScores({ params: {} }))),
          tap(() => this.store.dispatch(DriversActions.fetchAlarms({ params: { page: driversInitialState.alarmsParams.page, per_page: driversInitialState.alarmsParams.per_page } }))),
          tap(() => this.store.dispatch(DriversActions.fetchEvents({ params: {} }))),
          tap(() => this.store.dispatch(DriversActions.fetchVehicleChecks({ params: {} }))),
          tap(() => this.store.dispatch(DriversActions.fetchAccidents({ params: { page: driversInitialState.alarmsParams.page, per_page: driversInitialState.alarmsParams.per_page } })))
        )
        .subscribe()
    );
    this.sub.add(
      this.store
        .select(DriversSelectors.liveFeed)
        .pipe(
          tap(liveFeed => {
            if (liveFeed) {
              this.webSocket.connect([liveFeed.device_id], ['sub_gps', 'sub_alarm']);
            }
          })
        )
        .subscribe()
    );
    this.sub.add(
      this.store
        .select(state => state.webSocket.shared)
        .pipe(
          withLatestFrom(this.store.select(DriversSelectors.updatedLiveFeed)),
          tap(([event, liveFeed]) => {
            if (event && liveFeed && liveFeed.device_id === event.deviceno && event.lat && event.lng) {
              this.store.dispatch(
                DriversActions.setUpdatedLiveFeed({
                  data: {
                    ...liveFeed,
                    last_updated_at: event.dateTime ?? liveFeed.last_updated_at,
                    last_speed: event.speed ?? liveFeed.last_speed,
                    gps_position: [event.lat, event.lng],
                    direction: event.direction ?? liveFeed.direction
                  }
                })
              );
            }
          })
        )
        .subscribe()
    );

    return this.actions$.pipe(
      waitOnceForActions([DriversActions.fetchDriversSuccess]),
      finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'DriversGuard' })))
    );
  }

  canDeactivate(): boolean {
    this.sub?.unsubscribe();
    this.webSocket.disconnect();
    return true;
  }
}
