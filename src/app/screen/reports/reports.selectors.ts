import { createFeatureSelector, createSelector } from '@ngrx/store';
import { REPORTS_FEATURE_KEY, ReportsState } from './reports.reducer';

const getState = createFeatureSelector<ReportsState>(REPORTS_FEATURE_KEY);

export const ReportsSelectors = {
  rangeFilter: createSelector(getState, state => state.rangeFilter),
  fleetId: createSelector(getState, state => state.fleetId),

  mileageLoading: createSelector(getState, state => state.mileageLoading),
  mileageParams: createSelector(getState, state => state.mileageParams),
  mileage: createSelector(getState, state => state.mileage),

  drivingTimeLoading: createSelector(getState, state => state.drivingTimeLoading),
  drivingTimeParams: createSelector(getState, state => state.drivingTimeParams),
  drivingTime: createSelector(getState, state => state.drivingTime),

  vehicleIssuesLoading: createSelector(getState, state => state.vehicleIssuesLoading),
  vehicleIssuesParams: createSelector(getState, state => state.vehicleIssuesParams),
  vehicleIssues: createSelector(getState, state => state.vehicleIssues),
  vehicleIssuesMeta: createSelector(getState, state => state.vehicleIssuesMeta),

  vehicleChecksLoading: createSelector(getState, state => state.vehicleChecksLoading),
  vehicleChecksParams: createSelector(getState, state => state.vehicleChecksParams),
  vehicleChecks: createSelector(getState, state => state.vehicleChecks),

  vehicleCheck: createSelector(getState, state => state.vehicleCheck),

  alarmsLoading: createSelector(getState, state => state.alarmsLoading),
  alarmsParams: createSelector(getState, state => state.alarmsParams),
  alarms: createSelector(getState, state => state.alarms),
  alarmsMeta: createSelector(getState, state => state.alarmsMeta),

  accidentsLoading: createSelector(getState, state => state.accidentsLoading),
  accidentsParams: createSelector(getState, state => state.accidentsParams),
  accidents: createSelector(getState, state => state.accidents),
  accidentsMeta: createSelector(getState, state => state.accidentsMeta),

  accident: createSelector(getState, state => state.accident),

  tripsLoading: createSelector(getState, state => state.tripsLoading),
  tripsParams: createSelector(getState, state => state.tripsParams),
  trips: createSelector(getState, state => state.trips),
  tripsMeta: createSelector(getState, state => state.tripsMeta),

  eventsLoading: createSelector(getState, state => state.eventsLoading),
  eventsParams: createSelector(getState, state => state.eventsParams),
  events: createSelector(getState, state => state.events),
  eventsMeta: createSelector(getState, state => state.eventsMeta),

  distanceDrivenLoading: createSelector(getState, state => state.distanceDrivenLoading),
  distanceDrivenParams: createSelector(getState, state => state.distanceDrivenParams),
  distanceDriven: createSelector(getState, state => state.distanceDriven),

  vehicleOnlineStatusLoading: createSelector(getState, state => state.vehicleOnlineStatusLoading),
  vehicleOnlineStatusParams: createSelector(getState, state => state.vehicleOnlineStatusParams),
  vehicleOnlineStatus: createSelector(getState, state => state.vehicleOnlineStatus),

  userLogsLoading: createSelector(getState, state => state.userLogsLoading),
  userLogs: createSelector(getState, state => state.userLogs)
};
