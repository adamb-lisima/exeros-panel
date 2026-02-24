import { createReducer, on } from '@ngrx/store';
import { DashboardActions } from 'src/app/screen/dashboard/dashboard.actions';
import { MAPPED_RANGES } from '../../const/ranges';
import { RangeFilter } from '../../model/range-filter.model';
import { Accident, AccidentsElement, AccidentsMeta, AccidentsParams } from '../../service/http/accidents/accidents.model';
import { Dashboard, DashboardParams } from '../../service/http/dashboard/dashboard.model';
import { VehicleCheck, VehicleChecksElement, VehicleChecksParams } from '../../service/http/vehicle-checks/vehicle-checks.model';
import { DEFAULT_FLEET_ID } from '../../store/common-objects/common-objects.service';

export const DASHBOARD_FEATURE_KEY = 'dashboard';

export interface DashboardState {
  rangeFilter: RangeFilter;

  dashboardLoading: boolean;
  dashboardParams: DashboardParams;
  dashboard: Dashboard | undefined;

  accidentsLoading: boolean;
  accidentsParams: AccidentsParams;
  accidents: AccidentsElement[];
  accidentsMeta: AccidentsMeta | undefined;

  accident: Accident | undefined;

  vehicleChecksLoading: boolean;
  vehicleChecksParams: VehicleChecksParams;
  vehicleChecks: VehicleChecksElement[];

  vehicleCheck: VehicleCheck | undefined;
}

export const dashboardInitialState: DashboardState = {
  rangeFilter: {
    from: MAPPED_RANGES.LAST_7_DAYS.getFrom(),
    to: MAPPED_RANGES.LAST_7_DAYS.getTo()
  },

  dashboardLoading: false,
  dashboardParams: { fleet_id: DEFAULT_FLEET_ID },
  dashboard: undefined,

  accidentsLoading: false,
  accidentsParams: { page: 1, per_page: 30 },
  accidentsMeta: undefined,
  accidents: [],

  accident: undefined,

  vehicleChecksLoading: false,
  vehicleChecksParams: { status: 'All' },
  vehicleChecks: [],

  vehicleCheck: undefined
};

export const dashboardReducer = createReducer(
  dashboardInitialState,

  on(DashboardActions.setRangeFilter, (state, { rangeFilter }): DashboardState => ({ ...state, rangeFilter: { ...state.rangeFilter, ...rangeFilter } })),

  on(DashboardActions.setDashboardParams, (state, { params }): DashboardState => ({ ...state, dashboardParams: params })),
  on(DashboardActions.fetchDashboardSuccess, (state, { data }): DashboardState => ({ ...state, dashboard: data })),

  on(DashboardActions.setAccidentsLoading, (state, { loading }): DashboardState => ({ ...state, accidentsLoading: loading })),
  on(DashboardActions.setAccidentsParams, (state, { params }): DashboardState => ({ ...state, accidentsParams: params })),
  on(DashboardActions.fetchAccidentsSuccess, (state, { data, meta }): DashboardState => ({ ...state, accidents: data, accidentsMeta: meta })),

  on(DashboardActions.fetchAccidentSuccess, (state, { data }): DashboardState => ({ ...state, accident: data })),

  on(DashboardActions.setVehicleChecksLoading, (state, { loading }): DashboardState => ({ ...state, vehicleChecksLoading: loading })),
  on(DashboardActions.setVehicleChecksParams, (state, { params }): DashboardState => ({ ...state, vehicleChecksParams: params })),
  on(DashboardActions.fetchVehicleChecksSuccess, (state, { data }): DashboardState => ({ ...state, vehicleChecks: data })),

  on(DashboardActions.fetchVehicleCheckSuccess, (state, { data }): DashboardState => ({ ...state, vehicleCheck: data })),

  on(DashboardActions.resetAccident, (state): DashboardState => ({ ...state, accident: undefined })),
  on(DashboardActions.resetVehicleCheck, (state): DashboardState => ({ ...state, vehicleCheck: undefined })),
  on(DashboardActions.reset, (): DashboardState => ({ ...dashboardInitialState }))
);
