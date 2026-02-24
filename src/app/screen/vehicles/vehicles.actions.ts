import { createAction, props } from '@ngrx/store';
import { RangeFilter } from '../../model/range-filter.model';
import { Accident, AccidentsElement, AccidentsMeta, AccidentsParams } from '../../service/http/accidents/accidents.model';
import { LiveFeed } from '../../service/http/live-feeds/live-feeds.model';
import { VehicleCheck, VehicleChecksElement, VehicleChecksParams } from '../../service/http/vehicle-checks/vehicle-checks.model';
import { AlarmsElement, AlarmsMeta, AlarmsParams, CameraChannelsElement, EventsElement, EventsMeta, EventsParams, Trip, TripsElement, TripsMeta, TripsParams, UpdateCameraChannelBody, Vehicle, VehiclesElement, VehiclesMeta, VehiclesParams } from './vehicles.model';

export const VehiclesActions = {
  setSelectedId: createAction('[Vehicles] SetSelectedId', props<{ id?: number }>()),

  setRangeFilter: createAction('[Vehicles] SetRangeFilter', props<{ rangeFilter: RangeFilter }>()),

  setVehiclesLoading: createAction('[Vehicles] VehiclesLoading', props<{ loading: boolean }>()),
  setVehiclesParams: createAction('[Vehicles] SetVehiclesParams', props<{ params: VehiclesParams }>()),
  fetchVehicles: createAction('[Vehicles] FetchVehicles', props<{ params: Partial<VehiclesParams> }>()),
  fetchVehiclesSuccess: createAction('[Vehicles] FetchVehiclesSuccess', props<{ data: VehiclesElement[]; meta: VehiclesMeta }>()),

  fetchVehicle: createAction('[Vehicles] FetchVehicle'),
  fetchVehicleSuccess: createAction('[Vehicles] FetchVehicleSuccess', props<{ data: Vehicle }>()),

  fetchCameraChannels: createAction('[Vehicles] FetchCameraChannels', props<{ vehicleId: number }>()),
  fetchCameraChannelsSuccess: createAction('[Vehicles] FetchCameraChannelsSuccess', props<{ data: CameraChannelsElement[] }>()),

  updateCameraChannels: createAction('[Vehicles] UpdateCameraChannels', props<{ bodies: UpdateCameraChannelBody[] }>()),
  updateCameraChannelsSuccess: createAction('[Vehicles] UpdateCameraChannels Success'),

  setTripsLoading: createAction('[Vehicles] SetTripsLoading', props<{ loading: boolean }>()),
  setTripsParams: createAction('[Vehicles] SetTripsParams', props<{ params: TripsParams }>()),
  fetchTrips: createAction('[Vehicles] FetchTrips', props<{ params: Partial<TripsParams> }>()),
  fetchTripsSuccess: createAction('[Vehicles] FetchTripsSuccess', props<{ data: TripsElement[]; meta: TripsMeta }>()),

  setTripLoading: createAction('[Vehicles] SetTripLoading', props<{ loading: boolean }>()),
  fetchTrip: createAction('[Vehicles] FetchTrip', props<{ id: TripsElement['id'] }>()),
  fetchTripSuccess: createAction('[Vehicles] FetchTripSuccess', props<{ data: Trip }>()),
  resetTrip: createAction('[Vehicles] ResetTrip'),

  setAlarmsLoading: createAction('[Vehicles] SetAlarmsLoading', props<{ loading: boolean }>()),
  setAlarmsParams: createAction('[Vehicles] SetAlarmsSuccess', props<{ params: AlarmsParams }>()),
  fetchAlarms: createAction('[Vehicles] FetchAlarms', props<{ params: Partial<AlarmsParams> }>()),
  fetchAlarmsSuccess: createAction('[Vehicles] FetchAlarmsSuccess', props<{ data: AlarmsElement[]; meta: AlarmsMeta }>()),

  setEventsLoading: createAction('[Vehicles] SetEventsLoading', props<{ loading: boolean }>()),
  setEventsParams: createAction('[Vehicles] SetEventsParams', props<{ params: EventsParams }>()),
  fetchEvents: createAction('[Vehicles] FetchEvents', props<{ params: Partial<EventsParams> }>()),
  fetchEventsSuccess: createAction('[Vehicles] FetchEventsSuccess', props<{ data: EventsElement[]; meta: EventsMeta }>()),

  setVehicleChecksLoading: createAction('[Vehicles] SetVehicleChecksLoading', props<{ loading: boolean }>()),
  setVehicleChecksParams: createAction('[Vehicles] SetVehicleChecksParams', props<{ params: VehicleChecksParams }>()),
  fetchVehicleChecks: createAction('[Vehicles] FetchVehicleChecks', props<{ params: Partial<VehicleChecksParams> }>()),
  fetchVehicleChecksSuccess: createAction('[Vehicles] FetchVehicleChecks Success', props<{ data: VehicleChecksElement[] }>()),

  fetchVehicleCheck: createAction('[Vehicles] FetchVehicleCheck', props<{ id: number }>()),
  fetchVehicleCheckSuccess: createAction('[Vehicles] FetchVehicleCheckSuccess', props<{ data: VehicleCheck }>()),

  exportVehicleCheck: createAction('[Vehicles] ExportVehicleCheck', props<{ id: number }>()),
  exportVehicleCheckSuccess: createAction('[Vehicles] ExportVehicleCheckSuccess'),

  setAccidentsLoading: createAction('[Vehicles] SetAccidentsLoading', props<{ loading: boolean }>()),
  setAccidentsParams: createAction('[Vehicles] SetAccidentsParams', props<{ params: AccidentsParams }>()),
  fetchAccidents: createAction('[Vehicles] FetchAccidents', props<{ params: Partial<AccidentsParams> }>()),
  fetchAccidentsSuccess: createAction('[Vehicles] FetchAccidents Success', props<{ data: AccidentsElement[]; meta: AccidentsMeta }>()),

  fetchAccident: createAction('[Vehicles] FetchAccident', props<{ id: string }>()),
  fetchAccidentSuccess: createAction('[Vehicles] FetchAccidentSuccess', props<{ data: Accident }>()),

  exportAccident: createAction('[Vehicles] ExportAccident', props<{ id: string }>()),
  exportAccidentSuccess: createAction('[Vehicles] ExportAccidentSuccess'),

  setLiveFeedLoading: createAction('[Vehicles] SetLiveFeedLoading', props<{ loading: boolean }>()),
  fetchLiveFeed: createAction('[Vehicles] FetchLiveFeed'),
  fetchLiveFeedSuccess: createAction('[Vehicles] FetchLiveFeed Success', props<{ data: LiveFeed }>()),
  setUpdatedLiveFeed: createAction('[Vehicles] SetUpdatedLiveFeed', props<{ data: LiveFeed }>()),

  resetEvents: createAction('[Vehicles] Reset Events'),
  resetAlarms: createAction('[Vehicles] Reset Alarms'),
  resetVehicleChecks: createAction('[Vehicles] ResetVehicleChecks'),
  resetVehicleCheck: createAction('[Vehicles] ResetVehicleCheck'),
  resetAccidents: createAction('[Vehicles] ResetAccidents'),
  resetAccident: createAction('[Vehicles] ResetAccident'),
  resetLiveFeed: createAction('[Vehicles] ResetLiveFeed'),
  resetSafetyScores: createAction('[Vehicles] Reset SafetyScores'),
  resetTrips: createAction('[Vehicles] Reset Trips'),
  resetVehicle: createAction('[Vehicles] Reset Vehicle'),
  resetCameraChannels: createAction('[Vehicles] Reset CameraChannels'),
  reset: createAction('[Vehicles] Reset')
};
