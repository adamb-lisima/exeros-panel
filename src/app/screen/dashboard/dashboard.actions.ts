import { createAction, props } from '@ngrx/store';
import { RangeFilter } from '../../model/range-filter.model';
import { Accident, AccidentsElement, AccidentsMeta, AccidentsParams } from '../../service/http/accidents/accidents.model';
import { Dashboard, DashboardParams } from '../../service/http/dashboard/dashboard.model';
import { VehicleCheck, VehicleChecksElement, VehicleChecksParams } from '../../service/http/vehicle-checks/vehicle-checks.model';

export const DashboardActions = {
  setRangeFilter: createAction('[Dashboard] SetRangeFilter', props<{ rangeFilter: RangeFilter }>()),

  setDashboardParams: createAction('[Dashboard] SetDashboardParams', props<{ params: DashboardParams }>()),
  fetchDashboard: createAction('[Dashboard] FetchDashboard', props<{ params: Partial<DashboardParams> }>()),
  fetchDashboardSuccess: createAction('[Dashboard] FetchDashboard Success', props<{ data: Dashboard }>()),

  setAccidentsLoading: createAction('[Dashboard] SetAccidentsLoading', props<{ loading: boolean }>()),
  setAccidentsParams: createAction('[Dashboard] SetAccidentsParams', props<{ params: AccidentsParams }>()),
  fetchAccidents: createAction('[Dashboard] FetchAccidents', props<{ params: Partial<AccidentsParams> }>()),
  fetchAccidentsSuccess: createAction('[Dashboard] FetchAccidents Success', props<{ data: AccidentsElement[]; meta: AccidentsMeta }>()),

  fetchAccident: createAction('[Dashboard] FetchAccident', props<{ id: string }>()),
  fetchAccidentSuccess: createAction('[Dashboard] FetchAccidentSuccess', props<{ data: Accident }>()),

  exportAccident: createAction('[Dashboard] ExportAccident', props<{ id: string }>()),
  exportAccidentSuccess: createAction('[Dashboard] ExportAccidentSuccess'),

  setVehicleChecksLoading: createAction('[Dashboard] SetVehicleChecksLoading', props<{ loading: boolean }>()),
  setVehicleChecksParams: createAction('[Dashboard] SetVehicleChecksParams', props<{ params: VehicleChecksParams }>()),
  fetchVehicleChecks: createAction('[Dashboard] FetchVehicleChecks', props<{ params: Partial<VehicleChecksParams> }>()),
  fetchVehicleChecksSuccess: createAction('[Dashboard] FetchVehicleChecks Success', props<{ data: VehicleChecksElement[] }>()),

  fetchVehicleCheck: createAction('[Dashboard] FetchVehicleCheck', props<{ id: number }>()),
  fetchVehicleCheckSuccess: createAction('[Dashboard] FetchVehicleCheckSuccess', props<{ data: VehicleCheck }>()),

  exportVehicleCheck: createAction('[Dashboard] ExportVehicleCheck', props<{ id: number }>()),
  exportVehicleCheckSuccess: createAction('[Dashboard] ExportVehicleCheckSuccess'),

  resetAccident: createAction('[Dashboard] ResetAccident'),
  resetVehicleCheck: createAction('[Dashboard] ResetVehicleCheck'),
  reset: createAction('[Dashboard] Reset')
};
