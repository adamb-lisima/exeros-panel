import { createReducer, on } from '@ngrx/store';
import { CommonObjectsActions } from './common-objects.actions';
import { DriversTreeElement, FleetsTreeElement, MapVehiclesElement, UsersTreeElement, VehicleDevicesElement, VehiclesTreeElement } from './common-objects.model';

export const COMMON_OBJECTS_FEATURE_KEY = 'common-objects';

export interface CommonObjectsState {
  vehiclesTree: VehiclesTreeElement[];
  vehiclesTreeWithDriver: VehiclesTreeElement[];

  vehicleDevices: VehicleDevicesElement[];

  driversTree: DriversTreeElement[];

  adminUsersTree: UsersTreeElement[];

  fleetsTree: FleetsTreeElement[];

  mapVehicles: MapVehiclesElement[];
  updatedMapVehicles: MapVehiclesElement[];
}

export const commonObjectsInitialState: CommonObjectsState = {
  vehiclesTree: [],
  vehiclesTreeWithDriver: [],

  vehicleDevices: [],

  driversTree: [],

  adminUsersTree: [],

  fleetsTree: [],

  mapVehicles: [],
  updatedMapVehicles: []
};

export const commonObjectsReducer = createReducer(
  commonObjectsInitialState,

  on(CommonObjectsActions.fetchVehiclesTreeSuccess, (state, { data }): CommonObjectsState => ({ ...state, vehiclesTree: data })),
  on(CommonObjectsActions.fetchVehiclesTreeWithDriverSuccess, (state, { data }): CommonObjectsState => ({ ...state, vehiclesTreeWithDriver: data })),

  on(CommonObjectsActions.fetchDriversTreeSuccess, (state, { data }): CommonObjectsState => ({ ...state, driversTree: data })),

  on(CommonObjectsActions.fetchUsersTreeForAdminsSuccess, (state, { data }): CommonObjectsState => ({ ...state, adminUsersTree: data })),

  on(CommonObjectsActions.fetchFleetsTreeSuccess, (state, props): CommonObjectsState => ({ ...state, fleetsTree: props.data })),

  on(CommonObjectsActions.fetchMapVehiclesSuccess, (state, props): CommonObjectsState => ({ ...state, mapVehicles: props.data, updatedMapVehicles: props.data })),
  on(CommonObjectsActions.setUpdatedMapVehicles, (state, props): CommonObjectsState => ({ ...state, updatedMapVehicles: props.data })),

  on(CommonObjectsActions.reset, (): CommonObjectsState => ({ ...commonObjectsInitialState }))
);
