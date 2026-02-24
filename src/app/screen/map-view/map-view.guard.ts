import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { finalize, map, Observable, Subscription, tap, withLatestFrom } from 'rxjs';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { firstNonNullish, waitOnceForActions } from 'src/app/util/operators';
import { WebSocketService } from '../../service/web-socket/web-socket.service';
import { AppState } from '../../store/app-store.model';
import { CommonObjectsActions } from '../../store/common-objects/common-objects.actions';
import { CommonObjectsSelectors } from '../../store/common-objects/common-objects.selectors';
import { StreamActions } from '../stream/stream.actions';
import { VehiclesSelectors } from '../vehicles/vehicles.selectors';

@Injectable({ providedIn: 'root' })
export class MapViewGuard implements CanActivate, CanDeactivate<boolean> {
  private sub?: Subscription;

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly router: Router, private readonly webSocket: WebSocketService) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'MapViewGuard' }));
    this.store.dispatch(StreamActions.reset());

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
          tap(fleetId => {
            const params = { fleet_id: fleetId };
            this.store.dispatch(CommonObjectsActions.fetchMapVehicles({ params }));
          })
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
                StreamActions.setUpdatedLiveFeed({
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
      waitOnceForActions([CommonObjectsActions.fetchMapVehiclesSuccess, StreamActions.fetchMapVehiclesSuccess]),
      finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'MapViewGuard' })))
    );
  }

  canDeactivate(): boolean {
    this.sub?.unsubscribe();
    this.webSocket.disconnect();
    return true;
  }
}
