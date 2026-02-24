import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { catchError, concat, concatMap, EMPTY, map, of, switchMap, withLatestFrom } from 'rxjs';
import { StreamActions } from 'src/app/screen/stream/stream.actions';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { StreamService } from 'src/app/screen/stream/stream.service';
import { AppState } from 'src/app/store/app-store.model';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { filterNullish } from 'src/app/util/operators';
import DateConst from '../../const/date';
import { LiveFeedsService } from '../../service/http/live-feeds/live-feeds.service';
import { AlertActions } from '../../store/alert/alert.actions';

@Injectable()
export class StreamEffects {
  fetchVehicles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.fetchVehicles),
      withLatestFrom(this.store.select(StreamSelectors.vehiclesParams), this.store.select(StreamSelectors.vehicles)),
      switchMap(([{ params }, vehiclesParams, vehicles]) =>
        concat(
          of(StreamActions.setVehiclesLoading({ loading: true })),
          of({ ...vehiclesParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(StreamActions.setVehiclesParams({ params: newParams })),
                this.streamService.fetchVehicles(newParams).pipe(
                  map(({ data, meta }) => StreamActions.fetchVehiclesSuccess({ data, meta })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(StreamActions.setVehiclesLoading({ loading: false }))
        )
      )
    )
  );

  fetchLiveFeed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.fetchLiveFeed),
      withLatestFrom(this.store.select(StreamSelectors.selectedId).pipe(filterNullish())),
      switchMap(([, id]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchLiveFeed$' })),
          this.liveFeedsService.fetchLiveFeed(id).pipe(
            map(({ data }) => StreamActions.fetchLiveFeedSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchLiveFeed$' }))
        )
      )
    )
  );

  fetchAlarms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.fetchAlarms),
      withLatestFrom(this.store.select(StreamSelectors.alarmsParams), this.store.select(StreamSelectors.alarms)),
      switchMap(([{ params }, alarmsParams, alarms]) =>
        concat(
          of(StreamActions.setAlarmsLoading({ loading: true })),
          of({ ...alarmsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(StreamActions.setAlarmsParams({ params: newParams })),
                this.streamService.fetchAlarms(newParams).pipe(
                  map(({ data, meta }) =>
                    StreamActions.fetchAlarmsSuccess({
                      data: newParams.page === 1 ? data : [...alarms, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(StreamActions.setAlarmsLoading({ loading: false }))
        )
      )
    )
  );

  createMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.createMessage),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createMessage$' })),
          this.streamService.createMessage(body).pipe(
            concatMap(({ message }) => [StreamActions.createMessageSuccess(), AlertActions.display({ alert: { type: 'success', message } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createMessage$' }))
        )
      )
    )
  );

  fetchPlayback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.fetchPlayback),
      withLatestFrom(this.store.select(StreamSelectors.selectedId).pipe(filterNullish()), this.store.select(StreamSelectors.playbackParams)),
      switchMap(([{ params }, id, playbackParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchPlayback$' })),
          of({ ...playbackParams, ...params }).pipe(
            switchMap(newParams => {
              if (newParams.date) {
                const selectedMonth = DateTime.fromFormat(newParams.date, DateConst.serverDateFormat);
                if (selectedMonth.isValid) {
                  localStorage.setItem('calendar-mini-selected-month', selectedMonth.toISO());
                }
              }

              return concat(
                of(StreamActions.setPlaybackParams({ params: newParams })),
                this.streamService.fetchPlayback(id, newParams).pipe(
                  map(({ data }) => StreamActions.fetchPlaybackSuccess({ data })),
                  catchError(() => EMPTY)
                )
              );
            })
          ),
          of(applicationLoading({ loading: false, key: 'fetchPlayback$' }))
        )
      )
    )
  );

  fetchPlaybackTimeline$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.fetchPlaybackTimeline),
      withLatestFrom(this.store.select(StreamSelectors.selectedId).pipe(filterNullish()), this.store.select(StreamSelectors.playbackTimelineParams)),
      switchMap(([{ params }, selectedId, playbackTimelineParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchPlaybackTimeline$' })),
          of({ ...playbackTimelineParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(StreamActions.setPlaybackTimelineParams({ params: newParams })),
                this.streamService.fetchPlaybackTimeline(selectedId, params).pipe(
                  map(({ data }) => StreamActions.fetchPlaybackTimelineSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchPlaybackTimeline$' }))
        )
      )
    )
  );

  fetchPlaybackScope$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.fetchPlaybackScope),
      withLatestFrom(this.store.select(StreamSelectors.selectedId).pipe(filterNullish()), this.store.select(StreamSelectors.playbackScopeParams), this.store.select(StreamSelectors.playbackScope), this.store.select(StreamSelectors.initializedStreams), this.store.select(StreamSelectors.playbackSelectedSources)),
      switchMap(([{ params }, selectedId, playbackScopeParams, existingScope, initializedStreams, selectedSources]) => {
        if (existingScope?.cameras?.[0]?.provider === 'FT_CLOUD') {
          return EMPTY;
        }

        const newParams = { ...playbackScopeParams, ...params };
        const deviceStream = initializedStreams[selectedId];
        const isInitialized = deviceStream?.initialized;
        const hasSelectedSources = selectedSources && selectedSources.length > 0;

        this.store.dispatch(
          StreamActions.setPreviousPlaybackSelectedSources({
            previousPlaybackSelectedSources: [...selectedSources]
          })
        );

        const isTimeoutOrServerError = params.isTimeoutOrServerError === true;

        if (isInitialized && existingScope && existingScope.sn && hasSelectedSources && !isTimeoutOrServerError) {
          return concat(
            of(applicationLoading({ loading: true, key: 'fetchPlaybackSeek$' })),
            of(StreamActions.setPlaybackScopeParams({ params: newParams })),
            this.streamService
              .fetchPlaybackSeek(selectedId, {
                from: newParams.start_time,
                sn: existingScope.sn
              })
              .pipe(
                map(() => StreamActions.fetchPlaybackScopeSuccess({ data: existingScope })),
                catchError(() => {
                  return concat(
                    of(applicationLoading({ loading: true, key: 'fetchPlaybackScope$' })),
                    of(StreamActions.setPlaybackScopeParams({ params: newParams })),
                    this.streamService.fetchPlaybackScope(selectedId, newParams).pipe(
                      map(({ data }) => StreamActions.fetchPlaybackScopeSuccess({ data })),
                      catchError(() => EMPTY)
                    ),
                    of(applicationLoading({ loading: false, key: 'fetchPlaybackScope$' }))
                  );
                })
              ),
            of(applicationLoading({ loading: false, key: 'fetchPlaybackSeek$' }))
          );
        } else {
          return concat(
            of(applicationLoading({ loading: true, key: 'fetchPlaybackScope$' })),
            of(StreamActions.setPlaybackScopeParams({ params: newParams })),
            this.streamService.fetchPlaybackScope(selectedId, newParams).pipe(
              map(({ data }) => StreamActions.fetchPlaybackScopeSuccess({ data })),
              catchError(() => EMPTY)
            ),
            of(applicationLoading({ loading: false, key: 'fetchPlaybackScope$' }))
          );
        }
      })
    )
  );

  exportTelemetry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.exportTelemetry),
      withLatestFrom(this.store.select(StreamSelectors.selectedId).pipe(filterNullish()), this.store.select(StreamSelectors.playbackScopeParams)),
      switchMap(([action, selectedId, playbackScopeParams]) => {
        const newParams = { start_time: playbackScopeParams?.start_time!, end_time: playbackScopeParams?.end_time! };

        return concat(
          of(applicationLoading({ loading: true, key: 'exportTelemetry$' })),
          this.streamService.exportTelemetry(selectedId, newParams).pipe(
            map(() => StreamActions.exportTelemetrySuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportTelemetry$' }))
        );
      })
    )
  );

  fetchMapVehicles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.fetchMapVehicles),
      switchMap(({ params }) =>
        this.streamService.fetchMapVehicles(params).pipe(
          map(({ data }) => StreamActions.fetchMapVehiclesSuccess({ data })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  fetchTelemetryUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.fetchTelemetryUpdate),
      switchMap(({ vehicleId }) =>
        this.liveFeedsService.fetchTelemetryUpdate(vehicleId).pipe(
          map(({ data }) => StreamActions.fetchTelemetryUpdateSuccess({ data })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  checkAndSelectTripForPosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.checkAndSelectTripForPosition),
      withLatestFrom(this.store.select(StreamSelectors.playbackTimeline)),
      map(([action, timeline]) => {
        if (timeline?.trips?.length) {
          const matchingTrip = timeline.trips.find(trip => {
            const tripStart = DateTime.fromFormat(trip.time_from, DateConst.serverDateTimeFormat);
            const tripEnd = DateTime.fromFormat(trip.time_to, DateConst.serverDateTimeFormat);
            return action.position >= tripStart && action.position <= tripEnd;
          });

          if (matchingTrip) {
            return StreamActions.setSelectedTrip({ tripIndex: matchingTrip.index });
          } else {
          }
        }
        return { type: '[Stream] No Matching Trip Found' };
      })
    )
  );

  sharedClip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.sharedClip),
      switchMap(({ vehicleId, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'sharedClip$' })),
          this.streamService.addSharedClip(vehicleId, body).pipe(
            map(response => StreamActions.sharedClipSuccess({ response })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'sharedClip$' }))
        )
      )
    )
  );

  watchClip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.watchClip),
      switchMap(({ slug, params }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'watchClip$' })),
          this.streamService.watchClip(slug, params).pipe(
            map(response => StreamActions.watchClipSuccess({ response })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'watchClip$' }))
        )
      )
    )
  );

  clipToEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.clipToEvent),
      switchMap(({ vehicleId, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'clipToEvent$' })),
          this.streamService.clipToEvent(vehicleId, body).pipe(
            map(() => {
              return StreamActions.clipToEventSuccess();
            }),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'clipToEvent$' }))
        )
      )
    )
  );

  extendEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.extendEvent),
      switchMap(({ eventId, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'extendEvent$' })),
          this.streamService.extendEvent(eventId, body).pipe(
            map(() => {
              return StreamActions.extendEventSuccess();
            }),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'extendEvent$' }))
        )
      )
    )
  );

  fetchVehiclesInBackground$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StreamActions.fetchVehiclesInBackground),
      withLatestFrom(this.store.select(StreamSelectors.vehiclesParams)),
      switchMap(([, params]) =>
        this.streamService.fetchVehicles(params).pipe(
          map(({ data, meta }) => StreamActions.fetchVehiclesSuccess({ data, meta })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly streamService: StreamService, private readonly liveFeedsService: LiveFeedsService) {}
}
