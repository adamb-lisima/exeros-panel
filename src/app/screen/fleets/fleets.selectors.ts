import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FLEETS_EVENTS_KEY, FleetsState } from './fleets.reducer';

const getState = createFeatureSelector<FleetsState>(FLEETS_EVENTS_KEY);

export const FleetsSelectors = {
  rangeFilter: createSelector(getState, state => state.rangeFilter),

  selectEventsStats: createSelector(getState, state => state.eventsStats),
  eventsStatsParams: createSelector(getState, state => state.eventsStatsParams),
  eventsStats: createSelector(getState, state => state.eventsStats),
  eventsStatsElement: createSelector(getState, state => state.eventsStatsElement),
  eventsStatsLoading: createSelector(getState, state => state.eventsStatsLoading),

  eventsLoading: createSelector(getState, state => state.eventsLoading),
  eventsParams: createSelector(getState, state => state.eventsParams),
  events: createSelector(getState, state => state.events),
  eventsMeta: createSelector(getState, state => state.eventsMeta),

  selectEventsTrendsByHour: createSelector(getState, state => state.eventsTrendsByHour),
  selectEventTrends: createSelector(getState, state => state.eventTrends),

  selectSelectedFleetId: createSelector(getState, state => state.selectedFleetId),

  eventLocations: createSelector(getState, state => state.eventsLocations),

  eventsTrendsChartParams: createSelector(getState, state => state.eventsTrendsChartParams),
  eventTrendsChart: createSelector(getState, state => state.eventsTrendsChart),

  eventTypes: createSelector(getState, state => state.eventFilters.event_types),
  statuses: createSelector(getState, state => state.eventFilters.statuses),

  eventsTrendsLoading: createSelector(getState, state => state.eventTrendsLoading)
};
