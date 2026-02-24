import { createReducer, on } from '@ngrx/store';
import { MAPPED_CALENDAR_RANGES } from '../../const/ranges';
import { RangeFilter } from '../../model/range-filter.model';
import { Accident, AccidentsElement, AccidentsMeta, AccidentsParams } from '../../service/http/accidents/accidents.model';
import { LiveFeed } from '../../service/http/live-feeds/live-feeds.model';
import { VehicleCheck, VehicleChecksElement, VehicleChecksParams } from '../../service/http/vehicle-checks/vehicle-checks.model';
import { DEFAULT_FLEET_ID } from '../../store/common-objects/common-objects.service';
import { DriversActions } from './drivers.actions';
import { AlarmsElement, AlarmsMeta, AlarmsParams, Driver, DriversElement, DriversMeta, DriversParams, EventsElement, EventsMeta, EventsParams, SafetyScoreMeta, SafetyScoresElement, SafetyScoresParams, Trip, TripsElement, TripsMeta, TripsParams } from './drivers.model';

export const DRIVERS_FEATURE_KEY = 'drivers';

export interface DriversState {
  selectedId?: number;

  rangeFilter: RangeFilter;

  driversLoading: boolean;
  driversParams: DriversParams;
  drivers: DriversElement[];
  driversMeta?: DriversMeta;

  driver?: Driver;

  safetyScoresParams: SafetyScoresParams;
  safetyScores: SafetyScoresElement[];
  safetyScoresMeta?: SafetyScoreMeta;

  tripsLoading: boolean;
  tripsParams: TripsParams;
  trips: TripsElement[];
  tripsMeta?: TripsMeta;

  tripLoading: boolean;
  trip: Trip | undefined;

  alarmsLoading: boolean;
  alarmsParams: AlarmsParams;
  alarms: AlarmsElement[];
  alarmsMeta?: AlarmsMeta;

  eventsLoading: boolean;
  eventsParams: EventsParams;
  events: EventsElement[];
  eventsMeta?: EventsMeta;

  vehicleChecksLoading: boolean;
  vehicleChecksParams: VehicleChecksParams;
  vehicleChecks: VehicleChecksElement[];

  vehicleCheck: VehicleCheck | undefined;

  accidentsLoading: boolean;
  accidentsParams: AccidentsParams;
  accidents: AccidentsElement[];
  accidentsMeta: AccidentsMeta | undefined;

  accident: Accident | undefined;

  liveFeedLoading: boolean;
  liveFeed: LiveFeed | undefined;
  updatedLiveFeed: LiveFeed | undefined;

  dialogDrivers: DriversElement[];
  dialogDriversLoading: boolean;
  dialogDriversParams: DriversParams;
}

export const driversInitialState: DriversState = {
  selectedId: undefined,

  rangeFilter: {
    from: MAPPED_CALENDAR_RANGES.THIS_WEEK.getFrom(),
    to: MAPPED_CALENDAR_RANGES.THIS_WEEK.getTo()
  },

  driversLoading: false,
  driversParams: {
    fleet_id: DEFAULT_FLEET_ID,
    vehicle_id: undefined,
    search: '',
    order: 'a-z',
    driver_id: undefined
  },
  drivers: [],
  driversMeta: undefined,

  driver: undefined,

  safetyScoresParams: {
    fleet_id: DEFAULT_FLEET_ID,
    driver_id: undefined
  },
  safetyScores: [],
  safetyScoresMeta: undefined,

  tripsLoading: false,
  tripsParams: {
    page: 1,
    per_page: 30,
    sort_order: 'DESC',
    driver_id: undefined
  },
  trips: [],
  tripsMeta: undefined,

  tripLoading: false,
  trip: undefined,

  alarmsLoading: false,
  alarmsParams: {
    page: 1,
    per_page: 30,
    driver_id: undefined
  },
  alarms: [],
  alarmsMeta: undefined,

  eventsLoading: false,
  eventsParams: {
    fleet_id: DEFAULT_FLEET_ID,
    driver_id: undefined
  },
  events: [],
  eventsMeta: undefined,

  vehicleChecksLoading: false,
  vehicleChecksParams: { status: 'Complete' },
  vehicleChecks: [],

  vehicleCheck: undefined,

  accidentsLoading: false,
  accidentsParams: { page: 1, per_page: 30 },
  accidentsMeta: undefined,
  accidents: [],

  accident: undefined,

  liveFeedLoading: false,
  liveFeed: undefined,
  updatedLiveFeed: undefined,

  dialogDrivers: [],
  dialogDriversLoading: false,
  dialogDriversParams: {
    fleet_id: 1,
    driver_id: undefined,
    search: '',
    order: 'a-z',
    vehicle_id: undefined
  }
};

export const driversReducer = createReducer(
  driversInitialState,

  on(DriversActions.setSelectedId, (state, { id }): DriversState => ({ ...state, selectedId: id })),

  on(DriversActions.setRangeFilter, (state, { rangeFilter }): DriversState => ({ ...state, rangeFilter: { ...state.rangeFilter, ...rangeFilter } })),

  on(DriversActions.setDriversLoading, (state, { loading }): DriversState => ({ ...state, driversLoading: loading })),
  on(DriversActions.setDriversParams, (state, { params }): DriversState => ({ ...state, driversParams: params })),
  on(DriversActions.fetchDriversSuccess, (state, { data, meta }): DriversState => ({ ...state, drivers: data, driversMeta: meta })),

  on(DriversActions.fetchDriverSuccess, (state, { data }): DriversState => ({ ...state, driver: data })),

  on(DriversActions.setTripsLoading, (state, { loading }): DriversState => ({ ...state, tripsLoading: loading })),
  on(DriversActions.setTripsParams, (state, { params }): DriversState => ({ ...state, tripsParams: params })),
  on(DriversActions.fetchTripsSuccess, (state, { data, meta }): DriversState => ({ ...state, trips: data, tripsMeta: meta })),

  on(DriversActions.setTripLoading, (state, { loading }): DriversState => ({ ...state, tripLoading: loading })),
  on(DriversActions.fetchTripSuccess, (state, { data }): DriversState => ({ ...state, trip: data })),

  on(DriversActions.setSafetyScoresParams, (state, { params }): DriversState => ({ ...state, safetyScoresParams: params })),
  on(DriversActions.fetchSafetyScoresSuccess, (state, { data, meta }): DriversState => ({ ...state, safetyScores: data, safetyScoresMeta: meta })),

  on(DriversActions.setAlarmsLoading, (state, { loading }): DriversState => ({ ...state, alarmsLoading: loading })),
  on(DriversActions.setAlarmsParams, (state, { params }): DriversState => ({ ...state, alarmsParams: params })),
  on(DriversActions.fetchAlarmsSuccess, (state, { data, meta }): DriversState => ({ ...state, alarms: data, alarmsMeta: meta })),

  on(DriversActions.setEventsLoading, (state, { loading }): DriversState => ({ ...state, eventsLoading: loading })),
  on(DriversActions.setEventsParams, (state, { params }): DriversState => ({ ...state, eventsParams: params })),
  on(DriversActions.fetchEventsSuccess, (state, { data, meta }): DriversState => ({ ...state, events: data, eventsMeta: meta })),

  on(DriversActions.setVehicleChecksLoading, (state, { loading }): DriversState => ({ ...state, vehicleChecksLoading: loading })),
  on(DriversActions.setVehicleChecksParams, (state, { params }): DriversState => ({ ...state, vehicleChecksParams: params })),
  on(DriversActions.fetchVehicleChecksSuccess, (state, { data }): DriversState => ({ ...state, vehicleChecks: data })),

  on(DriversActions.fetchVehicleCheckSuccess, (state, { data }): DriversState => ({ ...state, vehicleCheck: data })),

  on(DriversActions.setAccidentsLoading, (state, { loading }): DriversState => ({ ...state, accidentsLoading: loading })),
  on(DriversActions.setAccidentsParams, (state, { params }): DriversState => ({ ...state, accidentsParams: params })),
  on(DriversActions.fetchAccidentsSuccess, (state, { data, meta }): DriversState => ({ ...state, accidents: data, accidentsMeta: meta })),

  on(DriversActions.fetchAccidentSuccess, (state, { data }): DriversState => ({ ...state, accident: data })),

  on(DriversActions.setLiveFeedLoading, (state, { loading }): DriversState => ({ ...state, liveFeedLoading: loading })),
  on(DriversActions.fetchLiveFeedSuccess, (state, { data }): DriversState => ({ ...state, liveFeed: data, updatedLiveFeed: data })),
  on(DriversActions.setUpdatedLiveFeed, (state, { data }): DriversState => ({ ...state, updatedLiveFeed: data })),

  on(DriversActions.resetEvents, (state): DriversState => ({ ...state, eventsParams: { ...driversInitialState.eventsParams }, events: [], eventsMeta: undefined })),
  on(DriversActions.resetAlarms, (state): DriversState => ({ ...state, alarmsParams: { ...driversInitialState.alarmsParams }, alarms: [], alarmsMeta: undefined })),
  on(DriversActions.resetVehicleChecks, (state): DriversState => ({ ...state, vehicleChecksParams: { ...driversInitialState.vehicleChecksParams }, vehicleChecks: [] })),
  on(DriversActions.resetVehicleCheck, (state): DriversState => ({ ...state, vehicleCheck: undefined })),
  on(DriversActions.resetAccidents, (state): DriversState => ({ ...state, accidentsParams: { ...driversInitialState.accidentsParams }, accidents: [] })),
  on(DriversActions.resetAccident, (state): DriversState => ({ ...state, accident: undefined })),
  on(DriversActions.resetLiveFeed, (state): DriversState => ({ ...state, liveFeed: undefined, updatedLiveFeed: undefined })),
  on(DriversActions.resetSafetyScores, (state): DriversState => ({ ...state, safetyScoresParams: { ...driversInitialState.safetyScoresParams }, safetyScores: [], safetyScoresMeta: undefined })),
  on(DriversActions.resetTrips, (state): DriversState => ({ ...state, tripsParams: { ...driversInitialState.tripsParams }, trips: [], tripsMeta: undefined, trip: undefined })),
  on(DriversActions.resetDriver, (state): DriversState => ({ ...state, driver: undefined })),
  on(DriversActions.reset, (): DriversState => ({ ...driversInitialState })),
  on(DriversActions.resetTrip, state => ({ ...state, trip: undefined })),

  on(DriversActions.setDialogDriversLoading, (state, { loading }) => ({ ...state, dialogDriversLoading: loading })),
  on(DriversActions.fetchDialogDriversSuccess, (state, { data }) => ({ ...state, dialogDrivers: data, dialogDriversLoading: false })),
  on(DriversActions.setDialogDriversParams, (state, { params }) => ({ ...state, dialogDriversParams: params }))
);
