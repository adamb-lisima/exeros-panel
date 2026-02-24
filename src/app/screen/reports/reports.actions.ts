import { createAction, props } from '@ngrx/store';
import { ExportType } from '../../model/export-type.model';
import { RangeFilter } from '../../model/range-filter.model';
import { Accident, AccidentsElement, AccidentsMeta, AccidentsParams } from '../../service/http/accidents/accidents.model';
import { VehicleCheck, VehicleChecksElement, VehicleChecksParams } from '../../service/http/vehicle-checks/vehicle-checks.model';
import { AlarmsElement, AlarmsMeta, AlarmsReportParamsRequest, DistanceDrivenElement, DistanceDrivenParamsRequest, DrivingTimeElement, DrivingTimeParams, EventsReportParamsRequest, MileageElement, MileageParams, TripsElement, TripsMeta, TripsParams, UserLogsElement, UserLogsParams, VehicleIssuesElement, VehicleIssuesMeta, VehicleIssuesParams, VehicleOnlineStatusElement, VehicleOnlineStatusParamsRequest } from './reports.model';
import { EventsElement, EventsMeta } from '../events/events.model';

export const ReportsActions = {
  clearGlobalFilters: createAction('[Reports] Clear Global Filters'),

  setRangeFilter: createAction('[Reports] SetRangeFilter', props<{ rangeFilter: RangeFilter }>()),
  setFleetId: createAction('[Reports] SetFleetId', props<{ fleetId: number }>()),

  setMileageLoading: createAction('[Reports] SetMileageLoading', props<{ loading: boolean }>()),
  setMileageParams: createAction('[Reports] SetMileageParams', props<{ params: MileageParams }>()),
  fetchMileage: createAction('[Reports] FetchMileage', props<{ params: Partial<MileageParams> }>()),
  fetchMileageSuccess: createAction('[Reports] FetchMileageSuccess', props<{ data: MileageElement[] }>()),

  exportMileage: createAction('[Reports] ExportMileage', props<{ exportType: ExportType }>()),
  exportMileageSuccess: createAction('[Reports] ExportMileageSuccess'),

  setDrivingTimeLoading: createAction('[Reports] SetDrivingTimeLoading', props<{ loading: boolean }>()),
  setDrivingTimeParams: createAction('[Reports] SetDrivingTimeParams', props<{ params: DrivingTimeParams }>()),
  fetchDrivingTime: createAction('[Reports] FetchDrivingTime', props<{ params: Partial<DrivingTimeParams> }>()),
  fetchDrivingTimeSuccess: createAction('[Reports] FetchDrivingTimeSuccess', props<{ data: DrivingTimeElement[] }>()),

  exportDrivingTime: createAction('[Reports] ExportDrivingTime', props<{ exportType: ExportType }>()),
  exportDrivingTimeSuccess: createAction('[Reports] ExportDrivingTimeSuccess'),

  setVehicleIssuesLoading: createAction('[Reports] SetVehicleIssuesLoading', props<{ loading: boolean }>()),
  setVehicleIssuesParams: createAction('[Reports] SetVehicleIssuesParams', props<{ params: VehicleIssuesParams }>()),
  fetchVehicleIssues: createAction('[Reports] FetchVehicleIssues', props<{ params: Partial<VehicleIssuesParams> }>()),
  fetchVehicleIssuesSuccess: createAction('[Reports] FetchVehicleIssuesSuccess', props<{ data: VehicleIssuesElement[]; meta: VehicleIssuesMeta }>()),

  setVehicleChecksLoading: createAction('[Reports] SetVehicleChecksLoading', props<{ loading: boolean }>()),
  setVehicleChecksParams: createAction('[Reports] SetVehicleChecksParams', props<{ params: VehicleChecksParams }>()),
  fetchVehicleChecks: createAction('[Reports] FetchVehicleChecks', props<{ params: Partial<VehicleChecksParams> }>()),
  fetchVehicleChecksSuccess: createAction('[Reports] FetchVehicleChecksSuccess', props<{ data: VehicleChecksElement[] }>()),

  exportVehicleChecks: createAction('[Reports] ExportVehicleChecks', props<{ exportType: ExportType }>()),
  exportVehicleChecksSuccess: createAction('[Reports] ExportVehicleChecksSuccess'),

  fetchVehicleCheck: createAction('[Reports] FetchVehicleCheck', props<{ id: number }>()),
  fetchVehicleCheckSuccess: createAction('[Reports] FetchVehicleCheckSuccess', props<{ data: VehicleCheck }>()),

  exportVehicleCheck: createAction('[Reports] ExportVehicleCheck', props<{ id: number }>()),
  exportVehicleCheckSuccess: createAction('[Reports] ExportVehicleCheckSuccess'),

  setAlarmsLoading: createAction('[Reports] SetAlarmsLoading', props<{ loading: boolean }>()),
  setAlarmsParams: createAction('[Reports] SetAlarmsParams', props<{ params: AlarmsReportParamsRequest }>()),
  fetchAlarms: createAction('[Reports] FetchAlarms', props<{ params: Partial<AlarmsReportParamsRequest> }>()),
  fetchAlarmsSuccess: createAction('[Reports] FetchAlarmsSuccess', props<{ data: AlarmsElement[]; meta: AlarmsMeta }>()),

  exportAlarms: createAction('[Reports] ExportAlarms', props<{ exportType: ExportType }>()),
  exportAlarmsSuccess: createAction('[Reports] ExportAlarmsSuccess'),

  setEventsParams: createAction('[Reports] SetEventsParams', props<{ params: EventsReportParamsRequest }>()),
  setEventsLoading: createAction('[Reports] SetEventsLoading', props<{ loading: boolean }>()),

  fetchEvents: createAction('[Reports] FetchEvents', props<{ params: Partial<EventsReportParamsRequest> }>()),
  fetchEventsSuccess: createAction('[Reports] FetchEvents Success', props<{ data: EventsElement[]; meta: EventsMeta }>()),

  fetchEventsInBackground: createAction('[Reports] FetchEventsInBackground'),
  fetchEventsInBackgroundSuccess: createAction('[Reports] FetchEventsInBackground Success', props<{ data: EventsElement[]; meta: EventsMeta }>()),

  exportEvents: createAction('[Reports] ExportEvents', props<{ exportType: ExportType }>()),
  exportEventsSuccess: createAction('[Reports] ExportEventsSuccess'),

  exportUserLogs: createAction('[Reports] ExportUserLogs'),
  exportUserLogsSuccess: createAction('[Reports] ExportUserLogsSuccess'),

  setDistanceDrivenParams: createAction('[Reports] SetDistanceDrivenParams', props<{ params: DistanceDrivenParamsRequest }>()),
  setDistanceDrivenLoading: createAction('[Reports] SetDistanceDrivenLoading', props<{ loading: boolean }>()),
  fetchDistanceDriven: createAction('[Reports] FetchDistanceDriven', props<{ params: Partial<DistanceDrivenParamsRequest> }>()),
  fetchDistanceDrivenSuccess: createAction('[Reports] FetchDistanceDrivenSuccess', props<{ data: DistanceDrivenElement[] }>()),

  exportDistanceDriven: createAction('[Reports] ExportDistanceDriven', props<{ exportType: ExportType }>()),
  exportDistanceDrivenSuccess: createAction('[Reports] ExportDistanceDrivenSuccess'),

  setVehicleOnlineStatusParams: createAction('[Reports] SetVehicleOnlineStatusParams', props<{ params: VehicleOnlineStatusParamsRequest }>()),
  setVehicleOnlineStatusLoading: createAction('[Reports] SetVehicleOnlineStatusLoading', props<{ loading: boolean }>()),
  fetchVehicleOnlineStatus: createAction('[Reports] FetchVehicleOnlineStatus', props<{ params: Partial<VehicleOnlineStatusParamsRequest> }>()),
  fetchVehicleOnlineStatusSuccess: createAction('[Reports] FetchVehicleOnlineStatusSuccess', props<{ data: VehicleOnlineStatusElement[] }>()),

  setUserLogsParams: createAction('[Reports] SetUserLogsParams'),
  setUserLogsLoading: createAction('[Reports] SetUserLogsLoading', props<{ loading: boolean }>()),
  fetchUserLogs: createAction('[Reports] FetchUserLogs', props<{ params: UserLogsParams }>()),
  fetchUserLogsSuccess: createAction('[Reports] FetchUserLogsSuccess', props<{ data: UserLogsElement[] }>()),

  exportVehicleOnlineStatus: createAction('[Reports] ExportVehicleOnlineStatus', props<{ exportType: ExportType }>()),
  exportVehicleOnlineStatusSuccess: createAction('[Reports] ExportVehicleOnlineStatusSuccess'),

  setAccidentsLoading: createAction('[Reports] SetAccidentsLoading', props<{ loading: boolean }>()),
  setAccidentsParams: createAction('[Reports] SetAccidentsParams', props<{ params: AccidentsParams }>()),
  fetchAccidents: createAction('[Reports] FetchAccidents', props<{ params: Partial<AccidentsParams> }>()),
  fetchAccidentsSuccess: createAction('[Reports] FetchAccidents Success', props<{ data: AccidentsElement[]; meta: AccidentsMeta }>()),

  fetchAccident: createAction('[Reports] FetchAccident', props<{ id: string }>()),
  fetchAccidentSuccess: createAction('[Reports] FetchAccidentSuccess', props<{ data: Accident }>()),

  exportAccident: createAction('[Reports] ExportAccident', props<{ id: string }>()),
  exportAccidentSuccess: createAction('[Reports] ExportAccidentSuccess'),

  setTripsLoading: createAction('[Reports] SetTripsLoading', props<{ loading: boolean }>()),
  setTripsParams: createAction('[Reports] SetTripsParams', props<{ params: TripsParams }>()),
  fetchTrips: createAction('[Reports] FetchTrips', props<{ params: Partial<TripsParams> }>()),
  fetchTripsSuccess: createAction('[Reports] FetchTripsSuccess', props<{ data: TripsElement[]; meta: TripsMeta }>()),

  exportTrips: createAction('[Reports] ExportTrips', props<{ exportType: ExportType }>()),
  exportTripsSuccess: createAction('[Reports] ExportTripsSuccess'),

  resetVehicleCheck: createAction('[Reports] ResetVehicleCheck'),
  resetAccident: createAction('[Reports] ResetAccident'),
  reset: createAction('[Reports] Reset')
};
