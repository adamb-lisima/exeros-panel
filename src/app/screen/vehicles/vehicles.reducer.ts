import { createReducer, on } from '@ngrx/store';
import { MAPPED_RANGES } from '../../const/ranges';
import { RangeFilter } from '../../model/range-filter.model';
import { Accident, AccidentsElement, AccidentsMeta, AccidentsParams } from '../../service/http/accidents/accidents.model';
import { LiveFeed } from '../../service/http/live-feeds/live-feeds.model';
import { VehicleCheck, VehicleChecksElement, VehicleChecksParams } from '../../service/http/vehicle-checks/vehicle-checks.model';
import { DEFAULT_FLEET_ID } from '../../store/common-objects/common-objects.service';
import { VehiclesActions } from './vehicles.actions';
import { AlarmsElement, AlarmsMeta, AlarmsParams, CameraChannelsElement, EventsElement, EventsMeta, EventsParams, Trip, TripsElement, TripsMeta, TripsParams, Vehicle, VehiclesElement, VehiclesMeta, VehiclesParams } from './vehicles.model';

export const VEHICLES_FEATURE_KEY = 'vehicles';

export interface VehiclesState {
  selectedId: number | undefined;

  rangeFilter: RangeFilter;

  vehiclesLoading: boolean;
  vehiclesParams: VehiclesParams;
  vehicles: VehiclesElement[];
  vehiclesMeta?: VehiclesMeta;

  vehicle: Vehicle | undefined;

  cameraChannels: CameraChannelsElement[];

  tripsLoading: boolean;
  tripsParams: TripsParams;
  trips: TripsElement[];
  tripsMeta: TripsMeta | undefined;

  tripLoading: boolean;
  trip: Trip | undefined;

  alarmsLoading: boolean;
  alarmsParams: AlarmsParams;
  alarms: AlarmsElement[];
  alarmsMeta: AlarmsMeta | undefined;

  eventsLoading: boolean;
  eventsParams: EventsParams;
  events: EventsElement[];
  eventsMeta: EventsMeta | undefined;

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
}

export const vehiclesInitialState: VehiclesState = {
  selectedId: undefined,

  rangeFilter: {
    from: MAPPED_RANGES.LAST_7_DAYS.getFrom(),
    to: MAPPED_RANGES.LAST_7_DAYS.getTo()
  },

  vehiclesLoading: false,
  vehiclesParams: {
    fleet_id: DEFAULT_FLEET_ID,
    order: 'a-z',
    search: ''
  },
  vehicles: [],
  vehiclesMeta: undefined,

  vehicle: undefined,

  cameraChannels: [],

  tripsLoading: false,
  tripsParams: {
    page: 1,
    per_page: 30,
    sort_order: 'DESC',
    vehicle_id: undefined
  },
  trips: [],
  tripsMeta: undefined,

  tripLoading: false,
  trip: undefined,

  alarmsLoading: false,
  alarmsParams: {
    page: 1,
    per_page: 30,
    vehicle_id: undefined
  },
  alarms: [],
  alarmsMeta: undefined,

  eventsLoading: false,
  eventsParams: {
    fleet_id: DEFAULT_FLEET_ID,
    vehicle_id: undefined
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
  updatedLiveFeed: undefined
};

export const vehiclesReducer = createReducer(
  vehiclesInitialState,

  on(VehiclesActions.setSelectedId, (state, { id }): VehiclesState => ({ ...state, selectedId: id })),

  on(VehiclesActions.setRangeFilter, (state, { rangeFilter }): VehiclesState => ({ ...state, rangeFilter: { ...state.rangeFilter, ...rangeFilter } })),

  on(VehiclesActions.setVehiclesLoading, (state, { loading }): VehiclesState => ({ ...state, vehiclesLoading: loading })),
  on(VehiclesActions.setVehiclesParams, (state, { params }): VehiclesState => ({ ...state, vehiclesParams: params })),
  on(VehiclesActions.fetchVehiclesSuccess, (state, { data, meta }): VehiclesState => ({ ...state, vehicles: data, vehiclesMeta: meta })),

  on(VehiclesActions.fetchVehicleSuccess, (state, { data }): VehiclesState => ({ ...state, vehicle: data })),

  on(VehiclesActions.fetchCameraChannelsSuccess, (state, { data }): VehiclesState => ({ ...state, cameraChannels: data })),

  on(VehiclesActions.setTripsLoading, (state, { loading }): VehiclesState => ({ ...state, tripsLoading: loading })),
  on(VehiclesActions.setTripsParams, (state, { params }): VehiclesState => ({ ...state, tripsParams: params })),
  on(VehiclesActions.fetchTripsSuccess, (state, { data, meta }): VehiclesState => ({ ...state, trips: data, tripsMeta: meta })),

  on(VehiclesActions.setTripLoading, (state, { loading }): VehiclesState => ({ ...state, tripLoading: loading })),
  on(VehiclesActions.fetchTripSuccess, (state, { data }): VehiclesState => ({ ...state, trip: data })),

  on(VehiclesActions.setAlarmsLoading, (state, { loading }): VehiclesState => ({ ...state, alarmsLoading: loading })),
  on(VehiclesActions.setAlarmsParams, (state, { params }): VehiclesState => ({ ...state, alarmsParams: params })),
  on(VehiclesActions.fetchAlarmsSuccess, (state, { data, meta }): VehiclesState => ({ ...state, alarms: data, alarmsMeta: meta })),

  on(VehiclesActions.setEventsLoading, (state, { loading }): VehiclesState => ({ ...state, eventsLoading: loading })),
  on(VehiclesActions.setEventsParams, (state, { params }): VehiclesState => ({ ...state, eventsParams: params })),
  on(VehiclesActions.fetchEventsSuccess, (state, { data, meta }): VehiclesState => ({ ...state, events: data, eventsMeta: meta })),

  on(VehiclesActions.setVehicleChecksLoading, (state, { loading }): VehiclesState => ({ ...state, vehicleChecksLoading: loading })),
  on(VehiclesActions.setVehicleChecksParams, (state, { params }): VehiclesState => ({ ...state, vehicleChecksParams: params })),
  on(VehiclesActions.fetchVehicleChecksSuccess, (state, { data }): VehiclesState => ({ ...state, vehicleChecks: data })),

  on(VehiclesActions.fetchVehicleCheckSuccess, (state, { data }): VehiclesState => ({ ...state, vehicleCheck: data })),

  on(VehiclesActions.setAccidentsLoading, (state, { loading }): VehiclesState => ({ ...state, accidentsLoading: loading })),
  on(VehiclesActions.setAccidentsParams, (state, { params }): VehiclesState => ({ ...state, accidentsParams: params })),
  on(VehiclesActions.fetchAccidentsSuccess, (state, { data, meta }): VehiclesState => ({ ...state, accidents: data, accidentsMeta: meta })),

  on(VehiclesActions.fetchAccidentSuccess, (state, { data }): VehiclesState => ({ ...state, accident: data })),

  on(VehiclesActions.setLiveFeedLoading, (state, { loading }): VehiclesState => ({ ...state, liveFeedLoading: loading })),
  on(VehiclesActions.fetchLiveFeedSuccess, (state, { data }): VehiclesState => ({ ...state, liveFeed: data, updatedLiveFeed: data })),
  on(VehiclesActions.setUpdatedLiveFeed, (state, { data }): VehiclesState => ({ ...state, updatedLiveFeed: data })),

  on(VehiclesActions.resetEvents, (state): VehiclesState => ({ ...state, eventsParams: { ...vehiclesInitialState.eventsParams }, events: [], eventsMeta: undefined })),
  on(VehiclesActions.resetAlarms, (state): VehiclesState => ({ ...state, alarmsParams: { ...vehiclesInitialState.alarmsParams }, alarms: [], alarmsMeta: undefined })),
  on(VehiclesActions.resetVehicleChecks, (state): VehiclesState => ({ ...state, vehicleChecksParams: { ...vehiclesInitialState.vehicleChecksParams }, vehicleChecks: [] })),
  on(VehiclesActions.resetVehicleCheck, (state): VehiclesState => ({ ...state, vehicleCheck: undefined })),
  on(VehiclesActions.resetAccidents, (state): VehiclesState => ({ ...state, accidentsParams: { ...vehiclesInitialState.accidentsParams }, accidents: [] })),
  on(VehiclesActions.resetAccident, (state): VehiclesState => ({ ...state, accident: undefined })),
  on(VehiclesActions.resetLiveFeed, (state): VehiclesState => ({ ...state, liveFeed: undefined, updatedLiveFeed: undefined })),
  on(VehiclesActions.resetTrips, (state): VehiclesState => ({ ...state, tripsParams: { ...vehiclesInitialState.tripsParams }, trips: [], tripsMeta: undefined, trip: undefined })),
  on(VehiclesActions.resetVehicle, (state): VehiclesState => ({ ...state, vehicle: undefined })),
  on(VehiclesActions.resetCameraChannels, (state): VehiclesState => ({ ...state, cameraChannels: [] })),
  on(VehiclesActions.reset, (): VehiclesState => ({ ...vehiclesInitialState })),
  on(VehiclesActions.resetTrip, state => ({ ...state, trip: undefined }))
);
