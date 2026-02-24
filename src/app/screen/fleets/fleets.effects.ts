import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concat, EMPTY, map, of, switchMap, withLatestFrom } from 'rxjs';
import { applicationLoading } from '../../store/application/application.actions';
import { EventsActions } from '../events/events.actions';
import { EventsSelectors } from '../events/events.selectors';
import { EventsService } from '../events/events.service';
import { FleetsActions } from './fleets.actions';
import { EventsStatsParams, EventTrendsChartParams } from './fleets.model';
import { FleetsSelectors } from './fleets.selectors';
import { FleetsService } from './fleets.service';

@Injectable()
export class FleetsEffects {
  fetchEventsStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FleetsActions.fetchEventsStats),
      withLatestFrom(this.store.select(FleetsSelectors.eventsStatsParams), this.store.select(FleetsSelectors.eventsStats)),
      switchMap(([{ params }, eventsStatsParams]) => {
        const newParams: EventsStatsParams = {
          ...eventsStatsParams,
          ...params,
          fleet_id: params.fleet_id ?? eventsStatsParams.fleet_id
        };
        return concat(
          of(applicationLoading({ loading: true, key: 'fetchEventsStats$' })),
          this.fleetService.fetchEventsStats(newParams).pipe(
            map(({ data, meta }) => FleetsActions.fetchEventsStatsSuccess({ data: [{ ...data, fleet_id: newParams.fleet_id }], meta })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchEventsStats$' }))
        );
      })
    )
  );

  fetchEventsStatsElement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FleetsActions.fetchEventStatsElement),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchEventsStatsElement$' })),
          this.fleetService.fetchEventsStatsElement(id).pipe(
            map(({ data }) => FleetsActions.fetchEventStatsElementSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchEventsStatsElement$' }))
        )
      )
    )
  );

  fetchEventChartsTrends$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FleetsActions.fetchEventChartTrends),
      withLatestFrom(this.store.select(FleetsSelectors.eventsTrendsChartParams), this.store.select(FleetsSelectors.eventTrendsChart)),
      switchMap(([{ params }, eventsTrendsChartParams]) => {
        const newParams: EventTrendsChartParams = {
          ...eventsTrendsChartParams,
          ...params,
          fleet_id: params.fleet_id ?? eventsTrendsChartParams.fleet_id,
          event_types: Array.isArray(params.event_types) ? params.event_types : [],
          statuses: Array.isArray(params.statuses) ? params.statuses : []
        };
        return concat(
          of(FleetsActions.setEventChartTrendsLoading({ loading: true })),
          this.fleetService.fetchEventTrends(newParams).pipe(
            map(({ data }) => {
              return FleetsActions.fetchEventChartTrendsSuccess({ data });
            }),
            catchError(() => EMPTY)
          ),
          of(FleetsActions.setEventChartTrendsLoading({ loading: false }))
        );
      })
    )
  );

  fetchEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.fetchEvents),
      withLatestFrom(this.store.select(EventsSelectors.eventsParams)),
      switchMap(([{ params }, eventsParams]) =>
        concat(
          of(EventsActions.setEventsLoading({ loading: true })),
          of({ ...eventsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(EventsActions.setEventsParams({ params: newParams })),
                this.eventsService.fetchEvents(newParams).pipe(
                  map(({ data, meta }) => EventsActions.fetchEventsSuccess({ data, meta })),
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

  constructor(private readonly store: Store, private readonly actions$: Actions, private readonly fleetService: FleetsService, private readonly eventsService: EventsService) {}
}
