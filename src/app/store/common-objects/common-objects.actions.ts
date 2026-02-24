import { createAction, props } from '@ngrx/store';
import { DriversTreeElement, FleetsTreeElement, MapVehiclesElement, MapVehiclesParams, UsersTreeElement, VehiclesTreeElement } from './common-objects.model';

export const CommonObjectsActions = {
  fetchVehiclesTree: createAction('[CommonObjects] FetchVehiclesTree'),
  fetchVehiclesTreeSuccess: createAction('[CommonObjects] FetchVehiclesTree Success', props<{ data: VehiclesTreeElement[] }>()),

  fetchVehiclesTreeWithDriver: createAction('[CommonObjects] FetchVehiclesTreeWithDriver', props<{ id: number }>()),
  fetchVehiclesTreeWithDriverSuccess: createAction('[CommonObjects] FetchVehiclesTreeWithDriver Success', props<{ data: VehiclesTreeElement[] }>()),

  fetchDriversTree: createAction('[CommonObjects] FetchDriversTree'),
  fetchDriversTreeSuccess: createAction('[CommonObjects] FetchDriversTree Success', props<{ data: DriversTreeElement[] }>()),

  fetchUsersTreeForAdmins: createAction('[CommonObjects] FetchUsersTreeForAdmins'),
  fetchUsersTreeForAdminsSuccess: createAction('[CommonObjects] FetchUsersTreeForAdmins Success', props<{ data: UsersTreeElement[] }>()),

  fetchFleetsTree: createAction('[CommonObjects] FetchFleetsTree'),
  fetchFleetsTreeSuccess: createAction('[CommonObjects] FetchFleetsTree Success', props<{ data: FleetsTreeElement[] }>()),

  fetchMapVehicles: createAction('[CommonObjects] FetchMapVehicles', props<{ params: MapVehiclesParams }>()),
  fetchMapVehiclesSuccess: createAction('[CommonObjects] FetchMapVehicles Success', props<{ data: MapVehiclesElement[] }>()),
  setUpdatedMapVehicles: createAction('[CommonObjects] SetUpdatedMapVehicles', props<{ data: MapVehiclesElement[] }>()),

  reset: createAction('[CommonObjects] Reset')
};
