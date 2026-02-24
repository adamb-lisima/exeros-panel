import { createAction, props } from '@ngrx/store';
import { RangeFilter } from '../../model/range-filter.model';
import { Accident, AccidentsElement, AccidentsMeta, AccidentsParams } from '../../service/http/accidents/accidents.model';
import { LiveFeed } from '../../service/http/live-feeds/live-feeds.model';
import { VehicleCheck, VehicleChecksElement, VehicleChecksParams } from '../../service/http/vehicle-checks/vehicle-checks.model';
import { AlarmsElement, AlarmsMeta, AlarmsParams, CreateMessageBody, Driver, DriversElement, DriversMeta, DriversParams, EventsElement, EventsMeta, EventsParams, SafetyScoreMeta, SafetyScoresElement, SafetyScoresParams, Trip, TripsElement, TripsMeta, TripsParams } from './drivers.model';

export const DriversActions = {
  setSelectedId: createAction('[Drivers] SetSelectedId', props<{ id?: number }>()),

  setRangeFilter: createAction('[Drivers] SetRangeFilter', props<{ rangeFilter: RangeFilter }>()),

  setDriversLoading: createAction('[Drivers] DriversLoading', props<{ loading: boolean }>()),
  setDriversParams: createAction('[Drivers] SetDriversParams', props<{ params: DriversParams }>()),
  fetchDrivers: createAction('[Drivers] FetchDrivers', props<{ params: Partial<DriversParams> }>()),
  fetchDriversSuccess: createAction('[Drivers] FetchDriversSuccess', props<{ data: DriversElement[]; meta: DriversMeta }>()),

  fetchDriver: createAction('[Drivers] FetchDriver'),
  fetchDriverSuccess: createAction('[Drivers] FetchDriverSuccess', props<{ data: Driver }>()),

  createMessage: createAction('[Drivers] CreateMessage', props<{ body: CreateMessageBody }>()),
  createMessageSuccess: createAction('[Drivers] CreateMessageSuccess'),

  setSafetyScoresParams: createAction('[Drivers] SetSafetyScoresParams', props<{ params: SafetyScoresParams }>()),
  fetchSafetyScores: createAction('[Drivers] FetchSafetyScores', props<{ params: Partial<SafetyScoresParams> }>()),
  fetchSafetyScoresSuccess: createAction('[Drivers] FetchSafetyScoresSuccess', props<{ data: SafetyScoresElement[]; meta: SafetyScoreMeta }>()),

  setTripsLoading: createAction('[Drivers] SetTripsLoading', props<{ loading: boolean }>()),
  setTripsParams: createAction('[Drivers] SetTripsParams', props<{ params: TripsParams }>()),
  fetchTrips: createAction('[Drivers] FetchTrips', props<{ params: Partial<TripsParams> }>()),
  fetchTripsSuccess: createAction('[Drivers] FetchTripsSuccess', props<{ data: TripsElement[]; meta: TripsMeta }>()),

  setTripLoading: createAction('[Drivers] SetTripLoading', props<{ loading: boolean }>()),
  fetchTrip: createAction('[Drivers] FetchTrip', props<{ id: TripsElement['id'] }>()),
  fetchTripSuccess: createAction('[Drivers] FetchTripSuccess', props<{ data: Trip }>()),
  resetTrip: createAction('[Drivers] ResetTrip'),

  setAlarmsLoading: createAction('[Drivers] SetAlarmsLoading', props<{ loading: boolean }>()),
  setAlarmsParams: createAction('[Drivers] SetAlarmsSuccess', props<{ params: AlarmsParams }>()),
  fetchAlarms: createAction('[Drivers] FetchAlarms', props<{ params: Partial<AlarmsParams> }>()),
  fetchAlarmsSuccess: createAction('[Drivers] FetchAlarmsSuccess', props<{ data: AlarmsElement[]; meta: AlarmsMeta }>()),

  setEventsLoading: createAction('[Drivers] SetEventsLoading', props<{ loading: boolean }>()),
  setEventsParams: createAction('[Drivers] SetEventsParams', props<{ params: EventsParams }>()),
  fetchEvents: createAction('[Drivers] FetchEvents', props<{ params: Partial<EventsParams> }>()),
  fetchEventsSuccess: createAction('[Drivers] FetchEventsSuccess', props<{ data: EventsElement[]; meta: EventsMeta }>()),

  setVehicleChecksLoading: createAction('[Drivers] SetVehicleChecksLoading', props<{ loading: boolean }>()),
  setVehicleChecksParams: createAction('[Drivers] SetVehicleChecksParams', props<{ params: VehicleChecksParams }>()),
  fetchVehicleChecks: createAction('[Drivers] FetchVehicleChecks', props<{ params: Partial<VehicleChecksParams> }>()),
  fetchVehicleChecksSuccess: createAction('[Drivers] FetchVehicleChecks Success', props<{ data: VehicleChecksElement[] }>()),

  fetchVehicleCheck: createAction('[Drivers] FetchVehicleCheck', props<{ id: number }>()),
  fetchVehicleCheckSuccess: createAction('[Drivers] FetchVehicleCheckSuccess', props<{ data: VehicleCheck }>()),

  exportVehicleCheck: createAction('[Drivers] ExportVehicleCheck', props<{ id: number }>()),
  exportVehicleCheckSuccess: createAction('[Drivers] ExportVehicleCheckSuccess'),

  setAccidentsLoading: createAction('[Drivers] SetAccidentsLoading', props<{ loading: boolean }>()),
  setAccidentsParams: createAction('[Drivers] SetAccidentsParams', props<{ params: AccidentsParams }>()),
  fetchAccidents: createAction('[Drivers] FetchAccidents', props<{ params: Partial<AccidentsParams> }>()),
  fetchAccidentsSuccess: createAction('[Drivers] FetchAccidents Success', props<{ data: AccidentsElement[]; meta: AccidentsMeta }>()),

  fetchAccident: createAction('[Drivers] FetchAccident', props<{ id: string }>()),
  fetchAccidentSuccess: createAction('[Drivers] FetchAccidentSuccess', props<{ data: Accident }>()),

  exportAccident: createAction('[Drivers] ExportAccident', props<{ id: string }>()),
  exportAccidentSuccess: createAction('[Drivers] ExportAccidentSuccess'),

  setLiveFeedLoading: createAction('[Drivers] SetLiveFeedLoading', props<{ loading: boolean }>()),
  fetchLiveFeed: createAction('[Drivers] FetchLiveFeed'),
  fetchLiveFeedSuccess: createAction('[Drivers] FetchLiveFeed Success', props<{ data: LiveFeed }>()),
  setUpdatedLiveFeed: createAction('[Drivers] SetUpdatedLiveFeed', props<{ data: LiveFeed }>()),

  setDialogDriversLoading: createAction('[Drivers] SetDialogDriversLoading', props<{ loading: boolean }>()),
  fetchDialogDrivers: createAction('[Drivers] FetchDialogDrivers', props<{ params: Partial<DriversParams> }>()),
  fetchDialogDriversSuccess: createAction('[Drivers] FetchDialogDriversSuccess', props<{ data: DriversElement[] }>()),
  setDialogDriversParams: createAction('[Drivers] SetDialogDriversParams', props<{ params: DriversParams }>()),

  resetEvents: createAction('[Drivers] Reset Events'),
  resetAlarms: createAction('[Drivers] Reset Alarms'),
  resetVehicleChecks: createAction('[Drivers] ResetVehicleChecks'),
  resetVehicleCheck: createAction('[Drivers] ResetVehicleCheck'),
  resetAccidents: createAction('[Drivers] ResetAccidents'),
  resetAccident: createAction('[Drivers] ResetAccident'),
  resetLiveFeed: createAction('[Drivers] ResetLiveFeed'),
  resetSafetyScores: createAction('[Drivers] Reset SafetyScores'),
  resetTrips: createAction('[Drivers] Reset Trips'),
  resetDriver: createAction('[Drivers] Reset Driver'),
  reset: createAction('[Drivers] Reset')
};
