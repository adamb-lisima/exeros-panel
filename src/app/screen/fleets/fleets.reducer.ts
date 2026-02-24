import { createReducer, on } from '@ngrx/store';
import { MAPPED_RANGES } from '../../const/ranges';
import { RangeFilter } from '../../model/range-filter.model';
import { DEFAULT_FLEET_ID } from '../../store/common-objects/common-objects.service';
import { EventsElement, EventsMeta, EventsParams } from '../vehicles/vehicles.model';
import { FleetsActions } from './fleets.actions';
import { ChartData, ChartDataEventByHour, EventLocation, EventsStatsElement, EventsStatsMeta, EventsStatsParams, EventTrendsChart, EventTrendsChartParams } from './fleets.model';

export const FLEETS_EVENTS_KEY = 'fleetsEvents';

export interface FleetsState {
  rangeFilter: RangeFilter;

  eventsStatsParams: EventsStatsParams;
  eventsStats: EventsStatsElement[];
  eventsStatsElement: EventsStatsElement | undefined;
  eventsStatsLoading: boolean;

  eventsStatsMeta?: EventsStatsMeta;

  eventsLoading: boolean;
  eventsStatsElementLoading: boolean;
  eventTrendsLoading: boolean;

  eventsParams: EventsParams;
  events: EventsElement[];
  eventsMeta: EventsMeta | undefined;

  eventsTrendsChartParams: EventTrendsChartParams;
  eventsTrendsChart: EventTrendsChart | undefined;
  eventsTrendsByHour: ChartDataEventByHour[];
  eventTrends: ChartData[];

  selectedFleetId: number | undefined;

  eventsLocations: EventLocation[];

  eventFilters: { event_types: string[]; statuses: string[] };
}

export const fleetsInitialState: FleetsState = {
  rangeFilter: {
    from: MAPPED_RANGES.LAST_7_DAYS.getFrom(),
    to: MAPPED_RANGES.LAST_7_DAYS.getTo()
  },

  eventsStatsParams: { fleet_id: DEFAULT_FLEET_ID, from: MAPPED_RANGES.LAST_7_DAYS.getFrom(), to: MAPPED_RANGES.LAST_7_DAYS.getTo() },
  eventsStatsElement: undefined,
  eventsStats: [],
  eventsStatsLoading: false,

  eventsStatsMeta: undefined,

  eventsLoading: false,
  eventsStatsElementLoading: false,
  eventTrendsLoading: false,

  eventsParams: {
    fleet_id: DEFAULT_FLEET_ID,
    vehicle_id: undefined
  },
  events: [],
  eventsMeta: undefined,

  eventsTrendsChart: undefined,
  eventsTrendsByHour: [],
  eventTrends: [],

  eventsTrendsChartParams: {
    fleet_id: DEFAULT_FLEET_ID,
    from: MAPPED_RANGES.LAST_7_DAYS.getFrom(),
    to: MAPPED_RANGES.LAST_7_DAYS.getTo(),
    event_types: [],
    statuses: ['NEW']
  },

  selectedFleetId: undefined,

  eventsLocations: [],

  eventFilters: { event_types: [], statuses: [] }
};

export const fleetsReducer = createReducer(
  fleetsInitialState,

  on(FleetsActions.setRangeFilter, (state, { rangeFilter }): FleetsState => ({ ...state, rangeFilter: { ...state.rangeFilter, ...rangeFilter } })),

  on(FleetsActions.setEventsStatsLoading, (state, { loading }) => ({ ...state, eventsStatsLoading: loading })),
  on(FleetsActions.setEventsStatsParams, (state, { params }) => ({ ...state, eventsStatsParams: { ...state.eventsStatsParams, ...params } })),

  on(FleetsActions.setEventsStatsElementLoading, (state, { loading }) => ({ ...state, eventsStatsElementLoading: loading })),
  on(FleetsActions.setEventChartTrendsLoading, (state, { loading }) => ({ ...state, eventTrendsLoading: loading })),

  on(FleetsActions.fetchEventsStatsSuccess, (state, { data }): FleetsState => ({ ...state, eventsStatsElement: data[0] ?? null, eventsStatsLoading: false })),

  on(FleetsActions.fetchEventsStats, state => ({ ...state, loading: true })),

  on(FleetsActions.fetchEventsTrendsByHourSuccess, (state, { data }) => ({ ...state, eventsTrendsByHour: data })),
  on(FleetsActions.fetchEventTrends, state => ({ ...state, loading: true })),

  on(FleetsActions.setEventsTrendsChartsParams, (state, { params }) => ({ ...state, eventsTrendsChartParams: { ...state.eventsTrendsChartParams, ...params } })),
  on(FleetsActions.fetchEventChartTrends, state => ({ ...state, loading: true })),
  on(FleetsActions.fetchEventChartTrendsSuccess, (state, { data }): FleetsState => ({ ...state, eventsTrendsChart: data, eventsStatsLoading: false })),

  on(FleetsActions.setSelectedFleetId, (state, { fleet_id }) => ({ ...state, selectedFleetId: fleet_id })),

  on(FleetsActions.fetchEventLocationsSuccess, (state, { data }) => ({ ...state, eventsLocations: data })),

  on(FleetsActions.setFilters, (state, { event_types, statuses }): FleetsState => ({ ...state, eventFilters: { event_types: event_types ?? [], statuses: statuses ?? [] } }))
);
