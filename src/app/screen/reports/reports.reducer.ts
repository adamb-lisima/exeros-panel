import { createReducer, on } from '@ngrx/store';
import { MAPPED_RANGES } from '../../const/ranges';
import { RangeFilter } from '../../model/range-filter.model';
import { Accident, AccidentsElement, AccidentsMeta, AccidentsParams } from '../../service/http/accidents/accidents.model';
import { VehicleCheck, VehicleChecksElement, VehicleChecksParams } from '../../service/http/vehicle-checks/vehicle-checks.model';
import { ReportsActions } from './reports.actions';
import { AlarmsElement, AlarmsMeta, AlarmsReportParamsRequest, DistanceDrivenElement, DistanceDrivenParamsRequest, DrivingTimeElement, DrivingTimeParams, EventsReportParamsRequest, GlobalFiltersParams, MileageElement, MileageParams, TripsElement, TripsMeta, TripsParams, UserLogsElement, VehicleIssuesElement, VehicleIssuesMeta, VehicleIssuesParams, VehicleOnlineStatusElement, VehicleOnlineStatusParamsRequest } from './reports.model';
import { EventsElement, EventsMeta } from '../events/events.model';
import { DEFAULT_FLEET_ID } from '../../store/common-objects/common-objects.service';

export const REPORTS_FEATURE_KEY = 'reports';

export interface ReportsState {
  globalFilters: GlobalFiltersParams;
  rangeFilter: RangeFilter;
  fleetId: number;

  mileageLoading: boolean;
  mileageParams: MileageParams;
  mileage: MileageElement[];

  drivingTimeLoading: boolean;
  drivingTimeParams: DrivingTimeParams;
  drivingTime: DrivingTimeElement[];

  vehicleIssuesLoading: boolean;
  vehicleIssuesParams: VehicleIssuesParams;
  vehicleIssues: VehicleIssuesElement[];
  vehicleIssuesMeta: VehicleIssuesMeta | undefined;

  vehicleChecksLoading: boolean;
  vehicleChecksParams: VehicleChecksParams;
  vehicleChecks: VehicleChecksElement[];

  vehicleCheck: VehicleCheck | undefined;

  alarmsLoading: boolean;
  alarmsParams: AlarmsReportParamsRequest;
  alarms: AlarmsElement[];
  alarmsMeta: AlarmsMeta | undefined;

  accidentsLoading: boolean;
  accidentsParams: AccidentsParams;
  accidents: AccidentsElement[];
  accidentsMeta: AccidentsMeta | undefined;

  accident: Accident | undefined;

  tripsLoading: boolean;
  tripsParams: TripsParams;
  trips: TripsElement[];
  tripsMeta?: TripsMeta;

  eventsLoading: boolean;
  events: EventsElement[];
  eventsMeta?: EventsMeta;
  eventsParams: EventsReportParamsRequest;

  distanceDrivenLoading: boolean;
  distanceDrivenParams: DistanceDrivenParamsRequest;
  distanceDriven: DistanceDrivenElement[];

  vehicleOnlineStatusLoading: boolean;
  vehicleOnlineStatusParams: VehicleOnlineStatusParamsRequest;
  vehicleOnlineStatus: VehicleOnlineStatusElement[];

  userLogsLoading: boolean;
  userLogs: UserLogsElement[];
}

export const reportsInitialState: ReportsState = {
  globalFilters: {},
  rangeFilter: {
    from: MAPPED_RANGES.LAST_7_DAYS.getFrom(),
    to: MAPPED_RANGES.LAST_7_DAYS.getTo()
  },
  fleetId: DEFAULT_FLEET_ID,

  mileageLoading: false,
  mileageParams: { vehicle_id: undefined, driver_id: undefined },
  mileage: [],

  drivingTimeLoading: false,
  drivingTimeParams: { vehicle_id: undefined, driver_id: undefined },
  drivingTime: [],

  vehicleIssuesLoading: false,
  vehicleIssuesParams: { page: 1, per_page: 30 },
  vehicleIssues: [],
  vehicleIssuesMeta: undefined,

  vehicleChecksLoading: false,
  vehicleChecksParams: { vehicle_id: undefined, driver_id: undefined, status: 'Complete' },
  vehicleChecks: [],

  vehicleCheck: undefined,

  alarmsLoading: false,
  alarmsParams: { driver_id: undefined, vehicle_id: undefined },

  alarms: [],
  alarmsMeta: undefined,

  accidentsLoading: false,
  accidentsParams: { page: 1, per_page: 30 },
  accidentsMeta: undefined,
  accidents: [],

  accident: undefined,

  tripsLoading: false,
  tripsParams: {
    page: 1,
    per_page: 30,
    vehicle_id: undefined,
    driver_id: undefined
  },
  trips: [],
  tripsMeta: undefined,

  eventsLoading: false,
  eventsParams: { fleet_id: DEFAULT_FLEET_ID, event_type: undefined, driver_id: undefined, vehicle_id: undefined, stacked: undefined, page: 1, per_page: 30, fetch_in_background: false },

  events: [],

  distanceDrivenLoading: false,
  distanceDrivenParams: { fleet_id: DEFAULT_FLEET_ID, vehicle_id: undefined },
  distanceDriven: [],

  vehicleOnlineStatusLoading: false,
  vehicleOnlineStatusParams: { stacked: 'true' },
  vehicleOnlineStatus: [],

  userLogsLoading: false,
  userLogs: []
};

export const reportsReducer = createReducer(
  reportsInitialState,

  on(ReportsActions.setRangeFilter, (state, { rangeFilter }): ReportsState => ({ ...state, rangeFilter: { ...state.rangeFilter, ...rangeFilter } })),
  on(ReportsActions.setFleetId, (state, { fleetId }): ReportsState => ({ ...state, fleetId })),

  on(ReportsActions.setEventsLoading, (state, { loading }): ReportsState => ({ ...state, eventsLoading: loading })),
  on(ReportsActions.fetchEventsSuccess, (state, { data, meta }): ReportsState => ({ ...state, events: data, eventsMeta: meta })),
  on(ReportsActions.setEventsParams, (state, { params }): ReportsState => ({ ...state, eventsParams: params })),

  on(ReportsActions.setDistanceDrivenLoading, (state, { loading }): ReportsState => ({ ...state, distanceDrivenLoading: loading })),
  on(ReportsActions.fetchDistanceDrivenSuccess, (state, { data }): ReportsState => ({ ...state, distanceDriven: data })),
  on(ReportsActions.setDistanceDrivenParams, (state, { params }): ReportsState => ({ ...state, distanceDrivenParams: params })),

  on(ReportsActions.setVehicleOnlineStatusLoading, (state, { loading }): ReportsState => ({ ...state, vehicleOnlineStatusLoading: loading })),
  on(ReportsActions.fetchVehicleOnlineStatusSuccess, (state, { data }): ReportsState => ({ ...state, vehicleOnlineStatus: data })),
  on(ReportsActions.setVehicleOnlineStatusParams, (state, { params }): ReportsState => ({ ...state, vehicleOnlineStatusParams: params })),

  on(ReportsActions.setUserLogsLoading, (state, { loading }): ReportsState => ({ ...state, userLogsLoading: loading })),
  on(ReportsActions.fetchUserLogsSuccess, (state, { data }): ReportsState => ({ ...state, userLogs: data })),
  on(ReportsActions.setUserLogsParams, (state): ReportsState => ({ ...state })),

  on(ReportsActions.setMileageLoading, (state, { loading }): ReportsState => ({ ...state, mileageLoading: loading })),
  on(ReportsActions.setMileageParams, (state, { params }): ReportsState => ({ ...state, mileageParams: params })),
  on(ReportsActions.fetchMileageSuccess, (state, { data }): ReportsState => ({ ...state, mileage: data })),

  on(ReportsActions.setDrivingTimeLoading, (state, { loading }): ReportsState => ({ ...state, drivingTimeLoading: loading })),
  on(ReportsActions.setDrivingTimeParams, (state, { params }): ReportsState => ({ ...state, drivingTimeParams: params })),
  on(ReportsActions.fetchDrivingTimeSuccess, (state, { data }): ReportsState => ({ ...state, drivingTime: data })),

  on(ReportsActions.setVehicleIssuesLoading, (state, { loading }): ReportsState => ({ ...state, vehicleIssuesLoading: loading })),
  on(ReportsActions.setVehicleIssuesParams, (state, { params }): ReportsState => ({ ...state, vehicleIssuesParams: params })),
  on(ReportsActions.fetchVehicleIssuesSuccess, (state, { data, meta }): ReportsState => ({ ...state, vehicleIssues: data, vehicleIssuesMeta: meta })),

  on(ReportsActions.setVehicleChecksLoading, (state, { loading }): ReportsState => ({ ...state, vehicleChecksLoading: loading })),
  on(ReportsActions.setVehicleChecksParams, (state, { params }): ReportsState => ({ ...state, vehicleChecksParams: params })),
  on(ReportsActions.fetchVehicleChecksSuccess, (state, { data }): ReportsState => ({ ...state, vehicleChecks: data })),

  on(ReportsActions.fetchVehicleCheckSuccess, (state, { data }): ReportsState => ({ ...state, vehicleCheck: data })),

  on(ReportsActions.setAlarmsLoading, (state, { loading }): ReportsState => ({ ...state, alarmsLoading: loading })),
  on(ReportsActions.setAlarmsParams, (state, { params }): ReportsState => ({ ...state, alarmsParams: params })),
  on(ReportsActions.fetchAlarmsSuccess, (state, { data, meta }): ReportsState => ({ ...state, alarms: data, alarmsMeta: meta })),

  on(ReportsActions.setAccidentsLoading, (state, { loading }): ReportsState => ({ ...state, accidentsLoading: loading })),
  on(ReportsActions.setAccidentsParams, (state, { params }): ReportsState => ({ ...state, accidentsParams: params })),
  on(ReportsActions.fetchAccidentsSuccess, (state, { data, meta }): ReportsState => ({ ...state, accidents: data, accidentsMeta: meta })),

  on(ReportsActions.fetchAccidentSuccess, (state, { data }): ReportsState => ({ ...state, accident: data })),

  on(ReportsActions.setTripsLoading, (state, { loading }): ReportsState => ({ ...state, tripsLoading: loading })),
  on(ReportsActions.setTripsParams, (state, { params }): ReportsState => ({ ...state, tripsParams: params })),
  on(ReportsActions.fetchTripsSuccess, (state, { data, meta }): ReportsState => ({ ...state, trips: data, tripsMeta: meta })),

  on(ReportsActions.resetVehicleCheck, (state): ReportsState => ({ ...state, vehicleCheck: undefined })),
  on(ReportsActions.resetAccident, (state): ReportsState => ({ ...state, accident: undefined })),
  on(ReportsActions.reset, (): ReportsState => ({ ...reportsInitialState })),

  on(ReportsActions.fetchEventsInBackgroundSuccess, (state, { data, meta }): ReportsState => ({ ...state, events: data, eventsMeta: meta }))
);
