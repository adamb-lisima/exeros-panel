import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concat, concatMap, EMPTY, map, of, switchMap, withLatestFrom } from 'rxjs';
import { DriversService } from 'src/app/screen/drivers/drivers.service';
import { filterNullish } from 'src/app/util/operators';
import { AccidentsService } from '../../service/http/accidents/accidents.service';
import { LiveFeedsService } from '../../service/http/live-feeds/live-feeds.service';
import { VehicleChecksService } from '../../service/http/vehicle-checks/vehicle-checks.service';
import { AlertActions } from '../../store/alert/alert.actions';
import { applicationLoading } from '../../store/application/application.actions';
import { webSocketReset } from '../../store/web-socket/web-socket.actions';
import { DriversActions } from './drivers.actions';
import { DriversSelectors } from './drivers.selectors';

@Injectable()
export class DriversEffects {
  fetchDrivers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchDrivers),
      withLatestFrom(this.store.select(DriversSelectors.driversParams), this.store.select(DriversSelectors.drivers)),
      switchMap(([{ params }, driversParams, drivers]) =>
        concat(
          of(DriversActions.setDriversLoading({ loading: true })),
          of({ ...driversParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DriversActions.setDriversParams({ params: newParams })),
                this.driversService.fetchDrivers(newParams).pipe(
                  map(({ data, meta }) => DriversActions.fetchDriversSuccess({ data, meta })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(DriversActions.setDriversLoading({ loading: false }))
        )
      )
    )
  );

  fetchDriver$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchDriver),
      withLatestFrom(this.store.select(DriversSelectors.selectedId).pipe(filterNullish()), this.store.select(DriversSelectors.rangeFilter)),
      switchMap(([, id, rangeFilter]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchDriver$' })),
          this.driversService.fetchDriver(id, rangeFilter).pipe(
            concatMap(({ data }) => [DriversActions.fetchDriverSuccess({ data }), DriversActions.fetchLiveFeed()]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchDriver$' }))
        )
      )
    )
  );

  createMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.createMessage),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createMessage$' })),
          this.driversService.createMessage(body).pipe(
            concatMap(({ message }) => [DriversActions.createMessageSuccess(), AlertActions.display({ alert: { type: 'success', message } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createMessage$' }))
        )
      )
    )
  );

  fetchTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchTrips),
      withLatestFrom(this.store.select(DriversSelectors.tripsParams), this.store.select(DriversSelectors.trips)),
      switchMap(([{ params }, tripsParams, trips]) =>
        concat(
          of(DriversActions.setTripsLoading({ loading: true })),
          of({ ...tripsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DriversActions.setTripsParams({ params: newParams })),
                this.driversService.fetchTrips(newParams).pipe(
                  map(({ data, meta }) =>
                    DriversActions.fetchTripsSuccess({
                      data: newParams.page === 1 ? data : [...trips, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(DriversActions.setTripsLoading({ loading: false }))
        )
      )
    )
  );

  fetchTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchTrip),
      switchMap(({ id }) =>
        concat(
          of(DriversActions.setTripLoading({ loading: true })),
          this.driversService.fetchTrip(id).pipe(
            map(({ data }) => DriversActions.fetchTripSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(DriversActions.setTripLoading({ loading: false }))
        )
      )
    )
  );

  fetchSafetyScores$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchSafetyScores),
      withLatestFrom(this.store.select(DriversSelectors.safetyScoresParams), this.store.select(DriversSelectors.rangeFilter)),
      switchMap(([{ params }, safetyScoresParams, rangeFilter]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchSafetyScores$' })),
          of({ ...safetyScoresParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DriversActions.setSafetyScoresParams({ params: newParams })),
                this.driversService.fetchSafetyScores(newParams, rangeFilter).pipe(
                  map(({ data, meta }) => DriversActions.fetchSafetyScoresSuccess({ data, meta })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchSafetyScores$' }))
        )
      )
    )
  );

  fetchAlarms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchAlarms),
      withLatestFrom(this.store.select(DriversSelectors.alarmsParams), this.store.select(DriversSelectors.rangeFilter), this.store.select(DriversSelectors.alarms)),
      switchMap(([{ params }, alarmsParams, rangeFilter, alarms]) =>
        concat(
          of(DriversActions.setAlarmsLoading({ loading: true })),
          of({ ...alarmsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DriversActions.setAlarmsParams({ params: newParams })),
                this.driversService.fetchAlarms(newParams, rangeFilter).pipe(
                  concatMap(({ data, meta }) => [
                    DriversActions.fetchAlarmsSuccess({
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
          of(DriversActions.setAlarmsLoading({ loading: false }))
        )
      )
    )
  );

  fetchEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchEvents),
      withLatestFrom(this.store.select(DriversSelectors.eventsParams), this.store.select(DriversSelectors.rangeFilter)),
      switchMap(([{ params }, eventsParams, rangeFilter]) =>
        concat(
          of(DriversActions.setEventsLoading({ loading: true })),
          of({ ...eventsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DriversActions.setEventsParams({ params: newParams })),
                this.driversService.fetchEvents(newParams, rangeFilter).pipe(
                  map(({ data, meta }) => DriversActions.fetchEventsSuccess({ data, meta })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(DriversActions.setEventsLoading({ loading: false }))
        )
      )
    )
  );

  fetchVehicleChecks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchVehicleChecks),
      withLatestFrom(this.store.select(DriversSelectors.rangeFilter), this.store.select(DriversSelectors.vehicleChecksParams)),
      switchMap(([{ params }, rangeFilter, vehicleChecksParams]) =>
        concat(
          of(DriversActions.setVehicleChecksLoading({ loading: true })),
          of({ ...vehicleChecksParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DriversActions.setVehicleChecksParams({ params: newParams })),
                this.vehicleChecksService.fetchVehicleChecks({ ...newParams, with_offlines: newParams.status !== 'Incomplete' }, rangeFilter).pipe(
                  map(({ data }) => DriversActions.fetchVehicleChecksSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(DriversActions.setVehicleChecksLoading({ loading: false }))
        )
      )
    )
  );

  fetchVehicleCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchVehicleCheck),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehicleCheck$' })),
          this.vehicleChecksService.fetchVehicleCheck(id).pipe(
            map(({ data }) => DriversActions.fetchVehicleCheckSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehicleCheck$' }))
        )
      )
    )
  );

  exportVehicleCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.exportVehicleCheck),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportVehicleCheck$' })),
          this.vehicleChecksService.exportVehicleCheck(id).pipe(
            map(() => DriversActions.exportVehicleCheckSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportVehicleCheck$' }))
        )
      )
    )
  );

  fetchAccidents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchAccidents),
      withLatestFrom(this.store.select(DriversSelectors.rangeFilter), this.store.select(DriversSelectors.accidentsParams), this.store.select(DriversSelectors.accidents)),
      switchMap(([{ params }, rangeFilter, accidentsParams, accidents]) =>
        concat(
          of(DriversActions.setAccidentsLoading({ loading: true })),
          of({ ...accidentsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DriversActions.setAccidentsParams({ params: newParams })),
                this.accidentsService.fetchAccidents(newParams, rangeFilter).pipe(
                  map(({ data, meta }) =>
                    DriversActions.fetchAccidentsSuccess({
                      data: newParams.page === 1 ? data : [...accidents, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(DriversActions.setAccidentsLoading({ loading: false }))
        )
      )
    )
  );

  fetchAccident$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchAccident),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchAccident$' })),
          this.accidentsService.fetchAccident(id).pipe(
            map(({ data }) => DriversActions.fetchAccidentSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchAccident$' }))
        )
      )
    )
  );

  exportAccident$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.exportAccident),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportAccident$' })),
          this.accidentsService.exportAccident(id).pipe(
            map(() => DriversActions.exportAccidentSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportAccident$' }))
        )
      )
    )
  );

  fetchLiveFeed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchLiveFeed),
      withLatestFrom(this.store.select(DriversSelectors.driver).pipe(map(driver => driver?.vehicle?.id))),
      switchMap(([, id]) =>
        concat(
          of(DriversActions.setLiveFeedLoading({ loading: true })),
          id
            ? this.liveFeedsService.fetchLiveFeed(id).pipe(
                map(({ data }) => DriversActions.fetchLiveFeedSuccess({ data })),
                catchError(() => EMPTY)
              )
            : of(DriversActions.resetLiveFeed()),
          of(DriversActions.setLiveFeedLoading({ loading: false }))
        )
      )
    )
  );

  fetchDialogDrivers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriversActions.fetchDialogDrivers),
      withLatestFrom(this.store.select(DriversSelectors.dialogDriversParams)),
      switchMap(([{ params }, dialogDriversParams]) =>
        concat(
          of(DriversActions.setDialogDriversLoading({ loading: true })),
          of({ ...dialogDriversParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DriversActions.setDialogDriversParams({ params: newParams })),
                this.driversService.fetchDrivers(newParams).pipe(
                  map(({ data, meta }) => DriversActions.fetchDialogDriversSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(DriversActions.setDialogDriversLoading({ loading: false }))
        )
      )
    )
  );

  constructor(private readonly store: Store, private readonly actions$: Actions, private readonly driversService: DriversService, private readonly vehicleChecksService: VehicleChecksService, private readonly accidentsService: AccidentsService, private readonly liveFeedsService: LiveFeedsService) {}
}
