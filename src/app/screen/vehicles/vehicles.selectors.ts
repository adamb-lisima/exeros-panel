import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VEHICLES_FEATURE_KEY, VehiclesState } from './vehicles.reducer';

const getState = createFeatureSelector<VehiclesState>(VEHICLES_FEATURE_KEY);

export const VehiclesSelectors = {
  selectedId: createSelector(getState, state => state.selectedId),

  rangeFilter: createSelector(getState, state => state.rangeFilter),

  vehiclesLoading: createSelector(getState, state => state.vehiclesLoading),
  vehiclesParams: createSelector(getState, state => state.vehiclesParams),
  vehicles: createSelector(getState, state => state.vehicles),
  vehiclesMeta: createSelector(getState, state => state.vehiclesMeta),

  vehicle: createSelector(getState, state => state.vehicle),

  cameraChannels: createSelector(getState, state => state.cameraChannels),

  tripsLoading: createSelector(getState, state => state.tripsLoading),
  tripsParams: createSelector(getState, state => state.tripsParams),
  trips: createSelector(getState, state => state.trips),
  tripsMeta: createSelector(getState, state => state.tripsMeta),

  tripLoading: createSelector(getState, state => state.tripLoading),
  trip: createSelector(getState, state => state.trip),

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
  updatedLiveFeed: createSelector(getState, state => state.updatedLiveFeed)
};
