import { createAction, props } from '@ngrx/store';
import { RangeFilter } from '../../model/range-filter.model';
import { ChartData, ChartDataEventByHour, EventLocation, EventsElement, EventsMeta, EventsParams, EventsStatsElement, EventsStatsParams, EventTrendsChart, EventTrendsChartParams } from './fleets.model';

export const FleetsActions = {
  setRangeFilter: createAction('[FleetsEvents] SetRangeFilter', props<{ rangeFilter: RangeFilter }>()),

  setEventsStatsLoading: createAction('[FleetsEvents] setEventsStatsLoading', props<{ loading: boolean }>()),
  setEventsStatsParams: createAction('[FleetsEvents] setEventsStatsParams', props<{ params: EventsStatsParams }>()),

  setEventsStatsElementLoading: createAction('[FleetsEvents] setEventsStatsElementLoading', props<{ loading: boolean }>()),

  fetchEventsStats: createAction('[FleetsEvents] FetchEventsStats', props<{ params: Partial<EventsStatsParams> }>()),
  fetchEventsStatsSuccess: createAction('[FleetsEvents] FetchEventsStatsSuccess', props<{ data: EventsStatsElement[]; meta: any }>()),

  fetchEventStatsElement: createAction('[FleetsEvents] fetchEventStatsElement', props<{ id: number }>()),
  fetchEventStatsElementSuccess: createAction('[FleetsEvents] fetchFleet', props<{ data: EventsStatsElement }>()),

  setEventsLoading: createAction('[FleetsEvents] SetEventsLoading', props<{ loading: boolean }>()),
  setEventsParams: createAction('[FleetsEvents] SetEventsParams', props<{ params: EventsParams }>()),
  fetchEvents: createAction('[FleetsEvents] FetchEvents', props<{ params: Partial<EventsParams> }>()),
  fetchEventsSuccess: createAction('[FleetsEvents] FetchEventsSuccess', props<{ data: EventsElement[]; meta: EventsMeta }>()),

  reset: createAction('[FleetsEvents] Reset'),
  resetEvents: createAction('[FleetsEvents] Reset Events'),

  fetchEventsTrendsByHour: createAction('[FleetsEvents] FetchEventsTrendsByHour', props<{ from: string; to: string }>()),
  fetchEventsTrendsByHourSuccess: createAction('[FleetsEvents] FetchEventsTrendsByHourSuccess', props<{ data: ChartDataEventByHour[] }>()),

  fetchEventTrends: createAction('[FleetsEvents] FetchEventTrends', props<{ from: string; to: string }>()),
  fetchEventTrendsSuccess: createAction('[FleetsEvents] FetchEventTrendsSuccess', props<{ data: ChartData[] }>()),

  setSelectedFleetId: createAction('[FleetsEvents] SelectFleetId', props<{ fleet_id: number }>()),

  fetchEventLocations: createAction('[FleetsEvents] FetchEventLocations', props<{ params: EventsStatsParams }>()),
  fetchEventLocationsSuccess: createAction('[FleetsEvents] FetchEventLocationsSuccess', props<{ data: EventLocation[] }>()),

  setEventsTrendsChartsParams: createAction('[FleetsEvents] setEventsTrendsChartsParams', props<{ params: EventTrendsChartParams }>()),
  fetchEventChartTrends: createAction('[Fleets] FetchEventChartTrends', props<{ params: EventTrendsChartParams }>()),
  fetchEventChartTrendsSuccess: createAction('[Fleets] FetchEventChartTrendsSuccess', props<{ data: EventTrendsChart }>()),

  setEventChartTrendsLoading: createAction('[FleetsEvents] setEventChartTrendsLoading', props<{ loading: boolean }>()),

  setFilters: createAction('[FleetsEvents] SetFilters', props<{ event_types: string[]; statuses: string[] }>())
};
