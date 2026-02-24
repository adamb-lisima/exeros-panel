import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { ExportType } from '../../model/export-type.model';
import { RangeFilter } from '../../model/range-filter.model';
import { EventsResponse } from '../events/events.model';
import { AlarmsReportParamsRequest, AlarmsResponse, DistanceDrivenParamsRequest, DistanceDrivenResponse, DrivingTimeParams, DrivingTimeResponse, EventsReportParamsRequest, MileageParams, MileageResponse, TripsParams, TripsResponse, UserLogsParams, UserLogsResponse, VehicleIssuesParams, VehicleIssuesResponse, VehicleOnlineStatusParamsRequest, VehicleOnlineStatusResponse } from './reports.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private readonly httpService: HttpService) {}

  fetchMileage(params: MileageParams, rangeFilter: RangeFilter): Observable<MileageResponse> {
    return this.httpService.post$(`v2/reports/mileage`, { ...params, ...rangeFilter });
  }

  exportMileage(exportType: ExportType, params: MileageParams, rangeFilter: RangeFilter): Observable<void> {
    return this.httpService.postFile$(`v2/reports/mileage/export/${exportType}`, { ...params, ...rangeFilter });
  }

  fetchDrivingTime(params: DrivingTimeParams, rangeFilter: RangeFilter): Observable<DrivingTimeResponse> {
    return this.httpService.post$(`v2/reports/driving-time`, { ...params, ...rangeFilter });
  }

  exportDrivingTime(exportType: ExportType, params: DrivingTimeParams, rangeFilter: RangeFilter): Observable<void> {
    return this.httpService.postFile$(`v2/reports/driving-time/export/${exportType}`, { ...params, ...rangeFilter });
  }

  fetchVehicleIssues(params: VehicleIssuesParams, rangeFilter: RangeFilter): Observable<VehicleIssuesResponse> {
    return this.httpService.get$(`v2/vehicles/issues`, { ...params, ...rangeFilter });
  }

  fetchAlarms(params: AlarmsReportParamsRequest, rangeFilter: RangeFilter): Observable<AlarmsResponse> {
    return this.httpService.get$(`alarms`, { ...params, ...rangeFilter });
  }

  exportAlarms(exportType: ExportType, params: AlarmsReportParamsRequest, rangeFilter: RangeFilter): Observable<void> {
    return this.httpService.getFile$(`v2/alarms/export/${exportType}`, { ...params, ...rangeFilter });
  }

  fetchEvents(params: EventsReportParamsRequest, rangeFilter: RangeFilter): Observable<EventsResponse> {
    return this.httpService.post$(`events`, { ...params, ...rangeFilter });
  }

  exportEvents(exportType: ExportType, params: EventsReportParamsRequest, rangeFilter: RangeFilter): Observable<void> {
    return this.httpService.getFile$(`v2/events/export/${exportType}`, { ...params, ...rangeFilter });
  }

  exportUserLogs(params: EventsReportParamsRequest, rangeFilter: RangeFilter): Observable<void> {
    return this.httpService.getFile$(`v2/user-logs/export`, { ...params, ...rangeFilter });
  }

  fetchDistanceDriven(params: DistanceDrivenParamsRequest, rangeFilter: RangeFilter): Observable<DistanceDrivenResponse> {
    return this.httpService.post$(`v2/reports/distance-driven`, { ...params, ...rangeFilter });
  }

  exportDistanceDriven(params: DistanceDrivenParamsRequest, rangeFilter: RangeFilter): Observable<void> {
    return this.httpService.getFile$(`v2/reports/distance-driven/export`, { ...params, ...rangeFilter });
  }

  fetchVehicleOnlineStatus(params: VehicleOnlineStatusParamsRequest, rangeFilter: RangeFilter): Observable<VehicleOnlineStatusResponse> {
    return this.httpService.get$(`v2/vehicle-online-statuses`, { ...params, ...rangeFilter });
  }

  fetchUserLogs(params: UserLogsParams, rangeFilter: RangeFilter): Observable<UserLogsResponse> {
    return this.httpService.get$(`v2/user-logs`, { ...params, ...rangeFilter });
  }

  exportVehicleOnlineStatus(params: VehicleOnlineStatusParamsRequest, rangeFilter: RangeFilter): Observable<void> {
    return this.httpService.getFile$(`v2/vehicle-online-statuses/export`, { ...params, ...rangeFilter });
  }

  fetchTrips(params: TripsParams): Observable<TripsResponse> {
    return this.httpService.post$('trips', { ...params });
  }

  exportTrips(exportType: ExportType, params: TripsParams, rangeFilter: RangeFilter): Observable<void> {
    return this.httpService.postFile$(`v2/trips/export/${exportType}`, { ...params, ...rangeFilter });
  }
}
