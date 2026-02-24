import { createFeatureSelector, createSelector } from '@ngrx/store';
import { COMMON_OBJECTS_FEATURE_KEY, CommonObjectsState } from './common-objects.reducer';

const getState = createFeatureSelector<CommonObjectsState>(COMMON_OBJECTS_FEATURE_KEY);

export const CommonObjectsSelectors = {
  vehiclesTree: createSelector(getState, state => state.vehiclesTree),
  vehiclesTreeWithDriver: createSelector(getState, state => state.vehiclesTreeWithDriver),

  vehicleDevices: createSelector(getState, state => state.vehicleDevices),

  driversTree: createSelector(getState, state => state.driversTree),

  fleetAdminUsersTree: createSelector(getState, state => state.adminUsersTree),

  fleetsTree: createSelector(getState, state => state.fleetsTree),

  mapVehicles: createSelector(getState, state => state.mapVehicles),
  updatedMapVehicles: createSelector(getState, state => state.updatedMapVehicles)
};
