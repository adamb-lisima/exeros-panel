import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EVENTS_FEATURE_KEY, EventsState } from './events.reducer';

const getState = createFeatureSelector<EventsState>(EVENTS_FEATURE_KEY);

export const EventsSelectors = {
  selectedId: createSelector(getState, state => state.selectedId),
  mode: createSelector(getState, state => state.mode),

  eventsLoading: createSelector(getState, state => state.eventsLoading),
  eventsParams: createSelector(getState, state => state.eventsParams),
  events: createSelector(getState, state => state.events),
  eventsMeta: createSelector(getState, state => state.eventsMeta),

  event: createSelector(getState, state => state.event),
  deletedEvent: createSelector(getState, state => state.events),

  tripsLoading: createSelector(getState, state => state.tripsLoading),
  tripsParams: createSelector(getState, state => state.tripsParams),
  trips: createSelector(getState, state => state.trips),
  tripsMeta: createSelector(getState, state => state.tripsMeta),

  tripLoading: createSelector(getState, state => state.tripLoading),
  trip: createSelector(getState, state => state.trip),

  videoCurrentTime: createSelector(getState, state => state.videoCurrentTime),

  vehiclesLoading: createSelector(getState, state => state.vehiclesLoading),
  vehiclesParams: createSelector(getState, state => state.vehiclesParams),
  vehicles: createSelector(getState, state => state.vehicles),

  telemetry: createSelector(getState, (state: EventsState) => state.telemetry),

  driverRequestedStatusChange: createSelector(getState, state => state.event?.driver_requested_status_change),
  driverReview: createSelector(getState, state => state.event?.driver_review)
};
