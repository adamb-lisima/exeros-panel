import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, finalize, firstValueFrom, map, Observable, Subscription, take, tap, withLatestFrom } from 'rxjs';
import { SubRouteConst } from 'src/app/const/route';
import { StreamActions } from 'src/app/screen/stream/stream.actions';
import { StreamRouteParams } from 'src/app/screen/stream/stream.model';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { WebSocketService } from 'src/app/service/web-socket/web-socket.service';
import { AppState } from 'src/app/store/app-store.model';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { FleetUtil } from 'src/app/util/fleet';
import { firstNonNullish, waitOnceForActions } from 'src/app/util/operators';
import RoutingUtil from 'src/app/util/routing.util';
import { CommonObjectsActions } from '../../store/common-objects/common-objects.actions';
import { CommonObjectsSelectors } from '../../store/common-objects/common-objects.selectors';

@Injectable({ providedIn: 'root' })
export class StreamGuard implements CanActivate, CanDeactivate<boolean> {
  private subscription?: Subscription;
  playbackTimeline$ = this.store.select(StreamSelectors.playbackTimeline);

  constructor(private readonly webSocket: WebSocketService, private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly router: Router) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'StreamGuard' }));
    this.store.dispatch(StreamActions.reset());

    this.subscription = new Subscription();
    this.subscription.add(
      combineLatest([this.store.select(StreamSelectors.vehicles), this.store.select(StreamSelectors.liveFeed), this.store.select(StreamSelectors.playbackActive), this.store.select(CommonObjectsSelectors.mapVehicles)])
        .pipe(
          tap(([vehicles, liveFeed, playbackActive, mapVehicles]) => {
            const vehicleDeviceIds = vehicles.map(vehicle => vehicle.device_id);
            if (liveFeed) {
              if (!playbackActive) {
                this.webSocket.connect([liveFeed.device_id], ['sub_gps', 'sub_alarm']);
              }
            } else if (vehicleDeviceIds.length) {
              this.webSocket.connect(Array.from(new Set([...vehicleDeviceIds, ...mapVehicles.map(vehicle => vehicle.device_id)])), ['sub_gps', 'sub_alarm']);
            }
          })
        )
        .subscribe()
    );
    this.subscription.add(
      this.store
        .select(state => state.webSocket.shared)
        .pipe(
          withLatestFrom(this.store.select(StreamSelectors.updatedVehicles), this.store.select(StreamSelectors.updatedLiveFeed), this.store.select(CommonObjectsSelectors.updatedMapVehicles)),
          tap(([event, vehicles, liveFeed, mapVehicles]) => {
            const vehicleIndex = vehicles?.findIndex(vehicle => vehicle.device_id === event.deviceno);
            if (vehicleIndex > -1) {
              const newVehicles = [...vehicles];
              const newVehicle = { ...newVehicles[vehicleIndex] };

              newVehicle.last_updated_at = event.dateTime ?? newVehicle.last_updated_at;
              newVehicle.last_speed = event.speed ?? newVehicle.last_speed;
              newVehicles[vehicleIndex] = newVehicle;
              this.store.dispatch(StreamActions.setUpdatedVehicles({ data: newVehicles }));
            }
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

            const data = FleetUtil.updateFleetInList(event, mapVehicles);
            if (data) {
              this.store.dispatch(CommonObjectsActions.setUpdatedMapVehicles({ data }));
            }
          })
        )
        .subscribe()
    );

    this.subscription.add(
      RoutingUtil.mergeParams<StreamRouteParams>(this.router)
        .pipe(
          map(params => (params.id ? Number(params.id) : undefined)),
          map((id): [number | undefined, boolean] => [id, this.router.url.includes(SubRouteConst.playback)]),
          tap(([id]) => this.store.dispatch(StreamActions.setSelectedId({ id }))),
          tap(([, playbackActive]) => this.store.dispatch(StreamActions.setPlaybackActive({ playbackActive }))),
          tap(([id, playbackActive]) => {
            if (id && !playbackActive) {
              this.store.dispatch(StreamActions.fetchLiveFeed());

              const liveFeedSub = this.actions$
                .pipe(
                  ofType(StreamActions.fetchLiveFeedSuccess),
                  take(1),
                  tap(async action => {
                    const liveFeed = action.data;
                    if (liveFeed) {
                      const playbackTimeline = await firstValueFrom(this.playbackTimeline$);
                      const timeline = liveFeed.telemetry_timeline ?? [];
                      const latestTelemetry = timeline[0];
                      const currentLiveFeed = await firstValueFrom(this.store.select(StreamSelectors.liveFeed));

                      if (!playbackTimeline?.has_video && latestTelemetry && currentLiveFeed && latestTelemetry.lat && latestTelemetry.lng) {
                        this.store.dispatch(
                          StreamActions.setUpdatedLiveFeed({
                            data: {
                              ...currentLiveFeed,
                              id: liveFeed.id,
                              last_updated_at: latestTelemetry.started_at,
                              location: latestTelemetry.location || liveFeed.location,
                              gps_position: [latestTelemetry.lat, latestTelemetry.lng]
                            }
                          })
                        );
                      }
                    }
                  })
                )
                .subscribe();

              this.subscription?.add(liveFeedSub);
            } else {
              this.store.dispatch(StreamActions.resetLiveFeed());
            }
          }),
          tap(([id, playbackActive]) => this.store.dispatch(id && !playbackActive ? StreamActions.fetchAlarms({ params: { vehicle_id: id } }) : StreamActions.resetAlarms())),
          tap(([id, playbackActive]) => this.store.dispatch(id && playbackActive ? StreamActions.fetchPlayback({ params: {} }) : StreamActions.resetAllPlayback()))
        )
        .subscribe()
    );
    this.subscription.add(
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
            this.store.dispatch(CommonObjectsActions.fetchMapVehicles({ params: { fleet_id: fleetId } }));
            this.store.dispatch(StreamActions.fetchMapVehicles({ params: { fleet_id: fleetId } }));

            this.store.dispatch(
              StreamActions.fetchVehicles({
                params: {
                  fleet_id: fleetId
                }
              })
            );
          })
        )
        .subscribe()
    );

    return this.actions$.pipe(
      waitOnceForActions([CommonObjectsActions.fetchMapVehiclesSuccess, StreamActions.fetchMapVehiclesSuccess]),
      finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'StreamGuard' })))
    );
  }

  canDeactivate(): boolean {
    this.subscription?.unsubscribe();
    this.webSocket.disconnect();
    return true;
  }
}
