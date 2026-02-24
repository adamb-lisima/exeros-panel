import { createAction, props } from '@ngrx/store';
import { DateTime } from 'luxon';
import { RouteQueryParams } from '../../model/route.models';
import { CommentEventBody, EditEventBody, Event, EventsElement, EventsMeta, EventsParamsRequest, ScreenEventParams, TelemetryEvent, Trip, TripsElement, TripsMeta, TripsParams, VehiclesElement, VehiclesParams } from './events.model';

export const EventsActions = {
  setSelectedId: createAction('[Events] SetSelectedId', props<{ id?: EventsElement['id'] }>()),
  setMode: createAction('[Events] SetMode', props<{ mode?: RouteQueryParams['mode'] }>()),
  setVideoCurrentTime: createAction('[Events] SetVideoCurrentTime', props<{ videoCurrentTime: DateTime }>()),

  setEventsLoading: createAction('[Events] SetEventsLoading', props<{ loading: boolean }>()),
  setEventsParams: createAction('[Events] SetEventsParams', props<{ params: EventsParamsRequest }>()),
  fetchEvents: createAction('[Events] FetchEvents', props<{ params: Partial<EventsParamsRequest> }>()),
  fetchEventsSuccess: createAction('[Events] FetchEvents Success', props<{ data: EventsElement[]; meta: EventsMeta }>()),
  fetchEventsInBackground: createAction('[Events] FetchEventsInBackground'),
  fetchEventsInBackgroundSuccess: createAction('[Events] FetchEventsInBackground Success', props<{ data: EventsElement[]; meta: EventsMeta }>()),

  fetchEvent: createAction('[Events] FetchEvent'),
  fetchEventSuccess: createAction('[Events] FetchEvent Success', props<{ data: Event }>()),
  setUpdatedEvent: createAction('[Events] SetUpdatedEvent', props<{ data: Event }>()),

  screenEvent: createAction('[Events] ScreenEvent', props<{ params: ScreenEventParams }>()),
  screenEventSuccess: createAction('[Events] ScreenEvent Success'),

  editEvent: createAction('[Events] EditEvent', props<{ body: EditEventBody }>()),
  editEventSuccess: createAction('[Events] EditEvent Success', props<{ eventData: Event; eventsData: EventsElement[]; eventsMeta: EventsMeta }>()),

  commentEvent: createAction('[Events] CommentEvent', props<{ body: CommentEventBody }>()),
  commentEventSuccess: createAction('[Events] CommentEvent Success', props<{ data: Event }>()),

  setTripsLoading: createAction('[Events] SetTripsLoading', props<{ loading: boolean }>()),
  setTripsParams: createAction('[Events] SetTripsParams', props<{ params: TripsParams }>()),
  fetchTrips: createAction('[Events] FetchTrips', props<{ params: Partial<TripsParams> }>()),
  fetchTripsSuccess: createAction('[Events] FetchTripsSuccess', props<{ data: TripsElement[]; meta: TripsMeta }>()),

  setTripLoading: createAction('[Events] SetTripLoading', props<{ loading: boolean }>()),
  fetchTrip: createAction('[Events] FetchTrip', props<{ id: TripsElement['id'] }>()),
  fetchTripSuccess: createAction('[Events] FetchTripSuccess', props<{ data: Trip }>()),

  downloadVideos: createAction('[Events] DownloadVideos'),
  downloadVideosSuccess: createAction('[Events] DownloadVideos Success'),

  setVehiclesLoading: createAction('[Events] SetVehiclesLoading', props<{ loading: boolean }>()),
  setVehiclesParams: createAction('[Events] SetVehiclesParams', props<{ params: VehiclesParams }>()),
  fetchVehicles: createAction('[Events] FetchVehicles', props<{ params: Partial<VehiclesParams> }>()),
  fetchVehiclesSuccess: createAction('[Events] FetchVehicles Success', props<{ data: VehiclesElement[] }>()),

  resetEvent: createAction('[Events] ResetEvent'),
  resetTrips: createAction('[Events] ResetTrips'),
  resetVideoCurrentTime: createAction('[Events] ResetVideoCurrentTime'),
  reset: createAction('[Events] Reset'),

  fetchTelemetry: createAction('[Events] FetchTelemetry', props<{ id: string }>()),
  fetchTelemetrySuccess: createAction('[Events] FetchTelemetrySuccess', props<{ data: TelemetryEvent }>()),

  toggleKudos: createAction('[Events] Toggle Kudos'),
  toggleKudosSuccess: createAction('[Events] Toggle Kudos Success', props<{ data: Event }>()),

  acceptDriverReview: createAction('[Events] Accept Driver Review', props<{ reviewId: string }>()),
  acceptDriverReviewSuccess: createAction('[Events] Accept Driver Review Success', props<{ data: Event }>()),

  rejectDriverReview: createAction('[Events] Reject Driver Review', props<{ reviewId: string; reason: string }>()),
  rejectDriverReviewSuccess: createAction('[Events] Reject Driver Review Success', props<{ data: Event }>())
};
