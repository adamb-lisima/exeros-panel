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
import { VehiclesActions } from './vehicles.actions';
import { VehiclesRouteParams } from './vehicles.model';
import { vehiclesInitialState } from './vehicles.reducer';
import { VehiclesSelectors } from './vehicles.selectors';

@Injectable({ providedIn: 'root' })
export class VehiclesGuard implements CanActivate, CanDeactivate<boolean> {
  private sub?: Subscription;

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly router: Router, private readonly webSocket: WebSocketService) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'VehiclesGuard' }));
    this.store.dispatch(VehiclesActions.reset());

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
            return fleetsTree[0]?.id;
          }),
          firstNonNullish(),
          tap(fleetId => this.store.dispatch(VehiclesActions.fetchVehicles({ params: { fleet_id: fleetId } })))
        )
        .subscribe()
    );
    this.sub.add(
      RoutingUtil.mergeParams<VehiclesRouteParams>(this.router)
        .pipe(
          map(params => (params.id ? Number(params.id) : undefined)),
          tap(id => this.store.dispatch(VehiclesActions.setSelectedId({ id }))),
          tap(id => this.store.dispatch(id ? VehiclesActions.fetchVehicle() : VehiclesActions.resetVehicle())),
          // tap(id => this.store.dispatch(id ? VehiclesActions.fetchTrips({ params: { vehicle_id: id } }) : VehiclesActions.resetTrips())), //TODO temporary disabled
          tap(id => this.store.dispatch(id ? VehiclesActions.fetchAlarms({ params: { vehicle_id: id } }) : VehiclesActions.resetAlarms())),
          tap(id => this.store.dispatch(id ? VehiclesActions.fetchEvents({ params: { vehicle_id: id } }) : VehiclesActions.resetEvents())),
          tap(id => this.store.dispatch(id ? VehiclesActions.fetchVehicleChecks({ params: { vehicle_id: [id] } }) : VehiclesActions.resetVehicleChecks())),
          tap(id => this.store.dispatch(id ? VehiclesActions.fetchAccidents({ params: { vehicle_id: id } }) : VehiclesActions.resetAccidents())),
          tap(id => this.store.dispatch(id ? VehiclesActions.fetchLiveFeed() : VehiclesActions.resetLiveFeed()))
        )
        .subscribe()
    );
    this.sub.add(
      this.store
        .select(VehiclesSelectors.rangeFilter)
        .pipe(
          skip(1),
          tap(() => this.store.dispatch(VehiclesActions.fetchVehicle())),
          tap(() => this.store.dispatch(VehiclesActions.fetchAlarms({ params: { page: vehiclesInitialState.alarmsParams.page, per_page: vehiclesInitialState.alarmsParams.per_page } }))),
          tap(() => this.store.dispatch(VehiclesActions.fetchEvents({ params: {} }))),
          tap(() => this.store.dispatch(VehiclesActions.fetchVehicleChecks({ params: {} }))),
          tap(() => this.store.dispatch(VehiclesActions.fetchAccidents({ params: { page: vehiclesInitialState.alarmsParams.page, per_page: vehiclesInitialState.alarmsParams.per_page } })))
        )
        .subscribe()
    );
    this.sub.add(
      this.store
        .select(VehiclesSelectors.liveFeed)
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
          withLatestFrom(this.store.select(VehiclesSelectors.updatedLiveFeed)),
          tap(([event, liveFeed]) => {
            if (event && liveFeed && liveFeed.device_id === event.deviceno && event.lat && event.lng) {
              this.store.dispatch(
                VehiclesActions.setUpdatedLiveFeed({
                  data: {
                    ...liveFeed,
                    last_updated_at: event.dateTime || liveFeed.last_updated_at,
                    last_speed: event.speed || liveFeed.last_speed,
                    gps_position: [event.lat, event.lng],
                    direction: event.direction || liveFeed.direction
                  }
                })
              );
            }
          })
        )
        .subscribe()
    );

    return this.actions$.pipe(
      waitOnceForActions([VehiclesActions.fetchVehiclesSuccess]),
      finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'VehiclesGuard' })))
    );
  }

  canDeactivate(): boolean {
    this.sub?.unsubscribe();
    this.webSocket.disconnect();
    return true;
  }
}
