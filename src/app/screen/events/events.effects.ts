import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concat, EMPTY, forkJoin, map, of, switchMap, withLatestFrom } from 'rxjs';
import { EventsActions } from 'src/app/screen/events/events.actions';
import { EventsSelectors } from 'src/app/screen/events/events.selectors';
import { AppState } from 'src/app/store/app-store.model';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { filterNullish } from 'src/app/util/operators';
import { EventsService } from './events.service';

@Injectable()
export class EventsEffects {
  fetchEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.fetchEvents),
      withLatestFrom(this.store.select(EventsSelectors.eventsParams), this.store.select(EventsSelectors.events)),
      switchMap(([{ params }, eventsParams, currentEvents]) =>
        concat(
          of(EventsActions.setEventsLoading({ loading: true })),
          of({ ...eventsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(EventsActions.setEventsParams({ params: newParams })),
                this.eventsService.fetchEvents(newParams).pipe(
                  map(({ data, meta }) =>
                    EventsActions.fetchEventsSuccess({
                      data: newParams.page && Number(newParams.page) > 1 ? [...currentEvents, ...data] : data,
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(EventsActions.setEventsLoading({ loading: false }))
        )
      )
    )
  );

  fetchEventsInBackground$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.fetchEventsInBackground),
      withLatestFrom(this.store.select(EventsSelectors.eventsParams)),
      switchMap(([, eventsParams]) => {
        const { page, ...paramsWithoutPage } = eventsParams;

        return this.eventsService
          .fetchEvents({
            ...paramsWithoutPage,
            fetch_in_background: true
          })
          .pipe(
            map(({ data, meta }) => EventsActions.fetchEventsInBackgroundSuccess({ data, meta: { ...meta, fetch_in_background: true } })),
            catchError(() => EMPTY)
          );
      })
    )
  );

  fetchEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.fetchEvent),
      withLatestFrom(this.store.select(EventsSelectors.selectedId).pipe(filterNullish())),
      switchMap(([, id]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchEvent$' })),
          this.eventsService.fetchEvent(id).pipe(
            map(({ data }) => EventsActions.fetchEventSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchEvent$' }))
        )
      )
    )
  );

  screenEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.screenEvent),
      withLatestFrom(this.store.select(EventsSelectors.selectedId).pipe(filterNullish())),
      switchMap(([{ params }, id]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'screenEvent$' })),
          this.eventsService.screenEvent(id, params).pipe(
            map(() => EventsActions.screenEventSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'screenEvent$' }))
        )
      )
    )
  );

  editEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.editEvent),
      withLatestFrom(this.store.select(EventsSelectors.selectedId).pipe(filterNullish()), this.store.select(EventsSelectors.eventsParams)),
      switchMap(([{ body }, selectedId, eventsParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'editEvent$' })),
          this.eventsService.editEvent(selectedId, body).pipe(
            switchMap(eventResponse => forkJoin([of(eventResponse), this.eventsService.fetchEvents({ ...eventsParams })])),
            map(([eventResponse, eventsResponse]) => EventsActions.editEventSuccess({ eventData: eventResponse.data, eventsData: eventsResponse.data, eventsMeta: eventsResponse.meta })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'editEvent$' }))
        )
      )
    )
  );

  commentEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.commentEvent),
      withLatestFrom(this.store.select(EventsSelectors.selectedId).pipe(filterNullish())),
      switchMap(([{ body }, selectedId]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'commentEvent$' })),
          this.eventsService.commentEvent(selectedId, body).pipe(
            switchMap(() => this.eventsService.fetchEvent(selectedId)),
            map(({ data }) => EventsActions.commentEventSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'commentEvent$' }))
        )
      )
    )
  );

  fetchTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.fetchTrips),
      withLatestFrom(this.store.select(EventsSelectors.tripsParams), this.store.select(EventsSelectors.trips)),
      switchMap(([{ params }, tripsParams, trips]) =>
        concat(
          of(EventsActions.setTripsLoading({ loading: true })),
          of({ ...tripsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(EventsActions.setTripsParams({ params: newParams })),
                this.eventsService.fetchTrips(newParams).pipe(
                  map(({ data, meta }) =>
                    EventsActions.fetchTripsSuccess({
                      data: newParams.page === 1 ? data : [...trips, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(EventsActions.setTripsLoading({ loading: false }))
        )
      )
    )
  );

  fetchTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.fetchTrip),
      switchMap(({ id }) =>
        concat(
          of(EventsActions.setTripLoading({ loading: true })),
          this.eventsService.fetchTrip(id).pipe(
            map(({ data }) => EventsActions.fetchTripSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(EventsActions.setTripLoading({ loading: false }))
        )
      )
    )
  );

  downloadVideos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.downloadVideos),
      withLatestFrom(this.store.select(EventsSelectors.selectedId).pipe(filterNullish())),
      switchMap(([, selectedId]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'downloadVideos$' })),
          this.eventsService.downloadVideos(selectedId).pipe(
            map(() => EventsActions.downloadVideosSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'downloadVideos$' }))
        )
      )
    )
  );

  fetchVehicles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.fetchVehicles),
      withLatestFrom(this.store.select(EventsSelectors.vehiclesParams)),
      switchMap(([{ params }, fleetsTreeParams]) =>
        concat(
          of(EventsActions.setVehiclesLoading({ loading: true })),
          of({ ...fleetsTreeParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(EventsActions.setVehiclesParams({ params: newParams })),
                this.eventsService.fetchVehicles(newParams).pipe(
                  map(({ data }) => EventsActions.fetchVehiclesSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(EventsActions.setVehiclesLoading({ loading: false }))
        )
      )
    )
  );

  fetchTelemetry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.fetchTelemetry),
      switchMap(({ id }) =>
        concat(
          this.eventsService.fetchTelemetry(id).pipe(
            map(response => {
              const telemetryData = response.data.telemetry;
              return EventsActions.fetchTelemetrySuccess({ data: telemetryData });
            }),
            catchError(() => EMPTY)
          )
        )
      )
    )
  );

  toggleKudos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.toggleKudos),
      withLatestFrom(this.store.select(EventsSelectors.selectedId).pipe(filterNullish())),
      switchMap(([, selectedId]) =>
        concat(
          this.eventsService.toggleKudos(selectedId).pipe(
            switchMap(() => this.eventsService.fetchEvent(selectedId)),
            map(({ data }) => EventsActions.toggleKudosSuccess({ data })),
            catchError(() => EMPTY)
          )
        )
      )
    )
  );

  acceptDriverReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.acceptDriverReview),
      switchMap(({ reviewId }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'acceptDriverReview$' })),
          this.eventsService.acceptDriverReview(reviewId).pipe(
            map(({ data }) => EventsActions.acceptDriverReviewSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'acceptDriverReview$' }))
        )
      )
    )
  );

  rejectDriverReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.rejectDriverReview),
      switchMap(({ reviewId, reason }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'rejectDriverReview$' })),
          this.eventsService.rejectDriverReview(reviewId, reason).pipe(
            map(({ data }) => EventsActions.rejectDriverReviewSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'rejectDriverReview$' }))
        )
      )
    )
  );

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly eventsService: EventsService) {}
}
