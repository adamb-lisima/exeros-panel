import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concat, concatMap, EMPTY, map, of, switchMap, withLatestFrom } from 'rxjs';
import { filterNullish } from 'src/app/util/operators';
import { AccidentsService } from '../../service/http/accidents/accidents.service';
import { LiveFeedsService } from '../../service/http/live-feeds/live-feeds.service';
import { VehicleChecksService } from '../../service/http/vehicle-checks/vehicle-checks.service';
import { applicationLoading } from '../../store/application/application.actions';
import { webSocketReset } from '../../store/web-socket/web-socket.actions';
import { VehiclesActions } from './vehicles.actions';
import { VehiclesSelectors } from './vehicles.selectors';
import { VehiclesService } from './vehicles.service';

@Injectable()
export class VehiclesEffects {
  fetchVehicles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchVehicles),
      withLatestFrom(this.store.select(VehiclesSelectors.vehiclesParams), this.store.select(VehiclesSelectors.vehicles)),
      switchMap(([{ params }, vehiclesParams, vehicles]) =>
        concat(
          of(VehiclesActions.setVehiclesLoading({ loading: true })),
          of({ ...vehiclesParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(VehiclesActions.setVehiclesParams({ params: newParams })),
                this.vehiclesService.fetchVehicles(newParams).pipe(
                  map(({ data, meta }) => VehiclesActions.fetchVehiclesSuccess({ data, meta })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(VehiclesActions.setVehiclesLoading({ loading: false }))
        )
      )
    )
  );

  fetchVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchVehicle),
      withLatestFrom(this.store.select(VehiclesSelectors.selectedId).pipe(filterNullish()), this.store.select(VehiclesSelectors.rangeFilter)),
      switchMap(([, id, rangeFilter]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehicle$' })),
          this.vehiclesService.fetchVehicle(id, rangeFilter).pipe(
            map(({ data }) => VehiclesActions.fetchVehicleSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehicle$' }))
        )
      )
    )
  );

  fetchCameraChannels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchCameraChannels),
      switchMap(({ vehicleId }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchCameraChannels$' })),
          this.vehiclesService.fetchCameraChannels(vehicleId).pipe(
            map(({ data }) => VehiclesActions.fetchCameraChannelsSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchCameraChannels$' }))
        )
      )
    )
  );

  updateCameraChannels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.updateCameraChannels),
      switchMap(({ bodies }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateCameraChannels$' })),
          this.vehiclesService.updateCameraChannels(bodies).pipe(
            map(() => VehiclesActions.updateCameraChannelsSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateCameraChannels$' }))
        )
      )
    )
  );

  fetchTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchTrips),
      withLatestFrom(this.store.select(VehiclesSelectors.tripsParams), this.store.select(VehiclesSelectors.trips)),
      switchMap(([{ params }, tripsParams, trips]) =>
        concat(
          of(VehiclesActions.setTripsLoading({ loading: true })),
          of({ ...tripsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(VehiclesActions.setTripsParams({ params: newParams })),
                this.vehiclesService.fetchTrips(newParams).pipe(
                  map(({ data, meta }) =>
                    VehiclesActions.fetchTripsSuccess({
                      data: newParams.page === 1 ? data : [...trips, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(VehiclesActions.setTripsLoading({ loading: false }))
        )
      )
    )
  );

  fetchTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchTrip),
      switchMap(({ id }) =>
        concat(
          of(VehiclesActions.setTripLoading({ loading: true })),
          this.vehiclesService.fetchTrip(id).pipe(
            map(({ data }) => VehiclesActions.fetchTripSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(VehiclesActions.setTripLoading({ loading: false }))
        )
      )
    )
  );

  fetchAlarms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchAlarms),
      withLatestFrom(this.store.select(VehiclesSelectors.alarmsParams), this.store.select(VehiclesSelectors.rangeFilter), this.store.select(VehiclesSelectors.alarms)),
      switchMap(([{ params }, alarmsParams, rangeFilter, alarms]) =>
        concat(
          of(VehiclesActions.setAlarmsLoading({ loading: true })),
          of({ ...alarmsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(VehiclesActions.setAlarmsParams({ params: newParams })),
                this.vehiclesService.fetchAlarms(newParams, rangeFilter).pipe(
                  concatMap(({ data, meta }) => [
                    VehiclesActions.fetchAlarmsSuccess({
                      data: newParams.page === 1 ? data : [...alarms, ...data],
                      meta
                    }),
                    webSocketReset()
                  ]),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(VehiclesActions.setAlarmsLoading({ loading: false }))
        )
      )
    )
  );

  fetchEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchEvents),
      withLatestFrom(this.store.select(VehiclesSelectors.eventsParams), this.store.select(VehiclesSelectors.rangeFilter), this.store.select(VehiclesSelectors.events)),
      switchMap(([{ params }, eventsParams, rangeFilter, events]) =>
        concat(
          of(VehiclesActions.setEventsLoading({ loading: true })),
          of({ ...eventsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(VehiclesActions.setEventsParams({ params: newParams })),
                this.vehiclesService.fetchEvents(newParams, rangeFilter).pipe(
                  map(({ data, meta }) => VehiclesActions.fetchEventsSuccess({ data, meta })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(VehiclesActions.setEventsLoading({ loading: false }))
        )
      )
    )
  );

  fetchVehicleChecks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchVehicleChecks),
      withLatestFrom(this.store.select(VehiclesSelectors.rangeFilter), this.store.select(VehiclesSelectors.vehicleChecksParams)),
      switchMap(([{ params }, rangeFilter, vehicleChecksParams]) =>
        concat(
          of(VehiclesActions.setVehicleChecksLoading({ loading: true })),
          of({ ...vehicleChecksParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(VehiclesActions.setVehicleChecksParams({ params: newParams })),
                this.vehicleChecksService.fetchVehicleChecks({ ...newParams, with_offlines: newParams.status !== 'Incomplete' }, rangeFilter).pipe(
                  map(({ data }) => VehiclesActions.fetchVehicleChecksSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(VehiclesActions.setVehicleChecksLoading({ loading: false }))
        )
      )
    )
  );

  fetchVehicleCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchVehicleCheck),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehicleCheck$' })),
          this.vehicleChecksService.fetchVehicleCheck(id).pipe(
            map(({ data }) => VehiclesActions.fetchVehicleCheckSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehicleCheck$' }))
        )
      )
    )
  );

  exportVehicleCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.exportVehicleCheck),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportVehicleCheck$' })),
          this.vehicleChecksService.exportVehicleCheck(id).pipe(
            map(() => VehiclesActions.exportVehicleCheckSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportVehicleCheck$' }))
        )
      )
    )
  );

  fetchAccidents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchAccidents),
      withLatestFrom(this.store.select(VehiclesSelectors.rangeFilter), this.store.select(VehiclesSelectors.accidentsParams), this.store.select(VehiclesSelectors.accidents)),
      switchMap(([{ params }, rangeFilter, accidentsParams, accidents]) =>
        concat(
          of(VehiclesActions.setAccidentsLoading({ loading: true })),
          of({ ...accidentsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(VehiclesActions.setAccidentsParams({ params: newParams })),
                this.accidentsService.fetchAccidents(newParams, rangeFilter).pipe(
                  map(({ data, meta }) =>
                    VehiclesActions.fetchAccidentsSuccess({
                      data: newParams.page === 1 ? data : [...accidents, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(VehiclesActions.setAccidentsLoading({ loading: false }))
        )
      )
    )
  );

  fetchAccident$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchAccident),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchAccident$' })),
          this.accidentsService.fetchAccident(id).pipe(
            map(({ data }) => VehiclesActions.fetchAccidentSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchAccident$' }))
        )
      )
    )
  );

  exportAccident$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.exportAccident),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportAccident$' })),
          this.accidentsService.exportAccident(id).pipe(
            map(() => VehiclesActions.exportAccidentSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportAccident$' }))
        )
      )
    )
  );

  fetchLiveFeed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehiclesActions.fetchLiveFeed),
      withLatestFrom(this.store.select(VehiclesSelectors.selectedId).pipe(filterNullish())),
      switchMap(([, id]) =>
        concat(
          of(VehiclesActions.setLiveFeedLoading({ loading: true })),
          this.liveFeedsService.fetchLiveFeed(id).pipe(
            map(({ data }) => VehiclesActions.fetchLiveFeedSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(VehiclesActions.setLiveFeedLoading({ loading: false }))
        )
      )
    )
  );

  constructor(private readonly store: Store, private readonly actions$: Actions, private readonly vehiclesService: VehiclesService, private readonly vehicleChecksService: VehicleChecksService, private readonly accidentsService: AccidentsService, private readonly liveFeedsService: LiveFeedsService) {}
}
