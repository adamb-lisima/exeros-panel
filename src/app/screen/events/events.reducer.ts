import { createReducer, on } from '@ngrx/store';
import { DateTime } from 'luxon';
import DateConst from 'src/app/const/date';
import { EventsActions } from 'src/app/screen/events/events.actions';
import { Event, EventsElement, EventsMeta, EventsParamsRequest, TelemetryEvent, Trip, TripsElement, TripsMeta, TripsParams, VehiclesElement, VehiclesParams } from 'src/app/screen/events/events.model';
import { RouteQueryParams } from '../../model/route.models';
import { DEFAULT_FLEET_ID } from '../../store/common-objects/common-objects.service';

export const EVENTS_FEATURE_KEY = 'events';

export interface EventsState {
  selectedId?: EventsElement['id'];
  mode: RouteQueryParams['mode'] | undefined;

  eventsLoading: boolean;
  eventsParams: EventsParamsRequest;
  events: EventsElement[];
  eventsMeta: EventsMeta | undefined;

  event: Event | undefined;

  tripsLoading: boolean;
  tripsParams: TripsParams;
  trips: TripsElement[];
  tripsMeta?: TripsMeta;

  tripLoading: boolean;
  trip: Trip | undefined;

  videoCurrentTime: DateTime | undefined;

  vehiclesLoading: boolean;
  vehiclesParams: VehiclesParams;
  vehicles: VehiclesElement[];

  telemetry: TelemetryEvent | undefined;
}

export const eventsInitialState: EventsState = {
  selectedId: undefined,
  mode: undefined,

  eventsLoading: false,
  eventsParams: {
    from: DateTime.now().setZone('Europe/London').minus({ day: 1 }).startOf('day').toFormat(DateConst.serverDateTimeFormat),
    to: DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat),
    fleet_id: DEFAULT_FLEET_ID,
    event_type: undefined,
    driver_id: undefined,
    vehicle_id: undefined,
    status: 'NEW',
    fetch_in_background: false,
    speed_from: undefined,
    speed_to: undefined,
    score_from: undefined,
    score_to: undefined,
    phase: undefined,
    provider_names: undefined,
    include_review_optional: 'true',
    page: 1,
    per_page: 500
  },
  events: [],
  eventsMeta: undefined,

  event: undefined,

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

  videoCurrentTime: undefined,

  vehiclesLoading: false,
  vehiclesParams: { fleet_id: DEFAULT_FLEET_ID, order: 'a-z' },
  vehicles: [],

  telemetry: undefined
};

export const eventsReducer = createReducer(
  eventsInitialState,

  on(EventsActions.setSelectedId, (state, { id }): EventsState => ({ ...state, selectedId: id })),
  on(EventsActions.setMode, (state, { mode }): EventsState => ({ ...state, mode })),
  on(EventsActions.setVideoCurrentTime, (state, { videoCurrentTime }): EventsState => ({ ...state, videoCurrentTime })),

  on(EventsActions.setEventsLoading, (state, { loading }): EventsState => ({ ...state, eventsLoading: loading })),
  on(EventsActions.setEventsParams, (state, { params }): EventsState => ({ ...state, eventsParams: params })),
  on(EventsActions.fetchEventsSuccess, (state, { data, meta }): EventsState => ({ ...state, events: data, eventsMeta: meta })),
  on(EventsActions.fetchEventsInBackgroundSuccess, (state, { data, meta }): EventsState => ({ ...state, events: data, eventsMeta: meta })),

  on(EventsActions.fetchEventSuccess, (state, { data }): EventsState => ({ ...state, event: data })),

  on(EventsActions.screenEventSuccess, (state): EventsState => ({ ...state })),

  on(EventsActions.editEventSuccess, (state, { eventData, eventsData, eventsMeta }): EventsState => ({ ...state, event: eventData, events: eventsData, eventsMeta })),

  on(EventsActions.commentEventSuccess, (state, { data }): EventsState => ({ ...state, event: data })),

  on(EventsActions.setTripsLoading, (state, { loading }): EventsState => ({ ...state, tripsLoading: loading })),
  on(EventsActions.setTripsParams, (state, { params }): EventsState => ({ ...state, tripsParams: params })),
  on(EventsActions.fetchTripsSuccess, (state, { data, meta }): EventsState => ({ ...state, trips: data, tripsMeta: meta })),

  on(EventsActions.setTripLoading, (state, { loading }): EventsState => ({ ...state, tripLoading: loading })),
  on(EventsActions.fetchTripSuccess, (state, { data }): EventsState => ({ ...state, trip: data })),

  on(EventsActions.setVehiclesLoading, (state, { loading }): EventsState => ({ ...state, vehiclesLoading: loading })),
  on(EventsActions.setVehiclesParams, (state, { params }): EventsState => ({ ...state, vehiclesParams: params })),
  on(EventsActions.fetchVehiclesSuccess, (state, { data }): EventsState => ({ ...state, vehicles: data })),

  on(EventsActions.resetEvent, (state): EventsState => ({ ...state, event: undefined })),
  on(EventsActions.resetTrips, (state): EventsState => ({ ...state, tripsParams: { ...eventsInitialState.tripsParams }, trips: [], tripsMeta: undefined, trip: undefined })),
  on(EventsActions.reset, (): EventsState => ({ ...eventsInitialState })),

  on(EventsActions.fetchTelemetrySuccess, (state, { data }): EventsState => ({ ...state, telemetry: data })),

  on(EventsActions.acceptDriverReviewSuccess, (state, { data }): EventsState => ({ ...state, event: data })),
  on(EventsActions.rejectDriverReviewSuccess, (state, { data }): EventsState => ({ ...state, event: data }))
);
