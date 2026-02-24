import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DASHBOARD_FEATURE_KEY, DashboardState } from 'src/app/screen/dashboard/dashboard.reducer';

const getState = createFeatureSelector<DashboardState>(DASHBOARD_FEATURE_KEY);

export const DashboardSelectors = {
  rangeFilter: createSelector(getState, state => state.rangeFilter),

  dashboardLoading: createSelector(getState, state => state.dashboardLoading),
  dashboardParams: createSelector(getState, state => state.dashboardParams),
  dashboard: createSelector(getState, state => state.dashboard),

  accidentsLoading: createSelector(getState, state => state.accidentsLoading),
  accidentsParams: createSelector(getState, state => state.accidentsParams),
  accidentsMeta: createSelector(getState, state => state.accidentsMeta),
  accidents: createSelector(getState, state => state.accidents),

  accident: createSelector(getState, state => state.accident),

  vehicleChecksLoading: createSelector(getState, state => state.vehicleChecksLoading),
  vehicleChecksParams: createSelector(getState, state => state.vehicleChecksParams),
  vehicleChecks: createSelector(getState, state => state.vehicleChecks),

  vehicleCheck: createSelector(getState, state => state.vehicleCheck),

  fleetId: createSelector(getState, state => state.dashboardParams.fleet_id)
};
