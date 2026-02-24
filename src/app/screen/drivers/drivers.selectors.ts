import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DRIVERS_FEATURE_KEY, DriversState } from './drivers.reducer';

const getState = createFeatureSelector<DriversState>(DRIVERS_FEATURE_KEY);

export const DriversSelectors = {
  selectedId: createSelector(getState, state => state.selectedId),

  rangeFilter: createSelector(getState, state => state.rangeFilter),

  driversLoading: createSelector(getState, state => state.driversLoading),
  driversParams: createSelector(getState, state => state.driversParams),
  drivers: createSelector(getState, state => state.drivers),
  driversMeta: createSelector(getState, state => state.driversMeta),

  driver: createSelector(getState, state => state.driver),

  tripsLoading: createSelector(getState, state => state.tripsLoading),
  tripsParams: createSelector(getState, state => state.tripsParams),
  trips: createSelector(getState, state => state.trips),
  tripsMeta: createSelector(getState, state => state.tripsMeta),

  tripLoading: createSelector(getState, state => state.tripLoading),
  trip: createSelector(getState, state => state.trip),

  safetyScoresParams: createSelector(getState, state => state.safetyScoresParams),
  safetyScores: createSelector(getState, state => state.safetyScores),
  safetyScoresMeta: createSelector(getState, state => state.safetyScoresMeta),

  alarmsLoading: createSelector(getState, state => state.alarmsLoading),
  alarmsParams: createSelector(getState, state => state.alarmsParams),
  alarms: createSelector(getState, state => state.alarms),
  alarmsMeta: createSelector(getState, state => state.alarmsMeta),

  eventsLoading: createSelector(getState, state => state.eventsLoading),
  eventsParams: createSelector(getState, state => state.eventsParams),
  events: createSelector(getState, state => state.events),
  eventsMeta: createSelector(getState, state => state.eventsMeta),

  vehicleChecksLoading: createSelector(getState, state => state.vehicleChecksLoading),
  vehicleChecksParams: createSelector(getState, state => state.vehicleChecksParams),
  vehicleChecks: createSelector(getState, state => state.vehicleChecks),

  vehicleCheck: createSelector(getState, state => state.vehicleCheck),

  accidentsLoading: createSelector(getState, state => state.accidentsLoading),
  accidentsParams: createSelector(getState, state => state.accidentsParams),
  accidentsMeta: createSelector(getState, state => state.accidentsMeta),
  accidents: createSelector(getState, state => state.accidents),

  accident: createSelector(getState, state => state.accident),

  liveFeedLoading: createSelector(getState, state => state.liveFeedLoading),
  liveFeed: createSelector(getState, state => state.liveFeed),
  updatedLiveFeed: createSelector(getState, state => state.updatedLiveFeed),

  dialogDriversLoading: createSelector(getState, state => state.dialogDriversLoading),
  dialogDrivers: createSelector(getState, state => state.dialogDrivers),
  dialogDriversParams: createSelector(getState, state => state.dialogDriversParams)
};
