import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { RangeFilter } from '../../model/range-filter.model';
import { AlarmsParams, AlarmsResponse, CreateMessageBody, CreateMessageResponse, DriverResponse, DriversElement, DriversParams, DriversResponse, EventsParams, EventsResponse, SafetyScoreResponse, SafetyScoresParams, TripResponse, TripsElement, TripsParams, TripsResponse } from './drivers.model';

@Injectable({ providedIn: 'root' })
export class DriversService {
  constructor(private readonly httpService: HttpService) {}

  fetchDrivers(params: DriversParams): Observable<DriversResponse> {
    return this.httpService.post$(`drivers`, { ...params });
  }

  fetchDriver(id: DriversElement['id'], rangeFilter: RangeFilter): Observable<DriverResponse> {
    return this.httpService.get$(`drivers/${id}`, rangeFilter);
  }

  createMessage(body: CreateMessageBody): Observable<CreateMessageResponse> {
    return this.httpService.post$<CreateMessageResponse>(`updates/create`, body);
  }

  fetchSafetyScores(params: SafetyScoresParams, rangeFilter: RangeFilter): Observable<SafetyScoreResponse> {
    return this.httpService.get$('safety-scores', { ...params, ...rangeFilter });
  }

  fetchTrips(params: TripsParams): Observable<TripsResponse> {
    return this.httpService.get$('trips', params);
  }

  fetchTrip(id: TripsElement['id']): Observable<TripResponse> {
    return this.httpService.get$(`v2/trips/${id}`);
  }

  fetchAlarms(params: AlarmsParams, rangeFilter: RangeFilter): Observable<AlarmsResponse> {
    return this.httpService.get$(`alarms`, { ...params, ...rangeFilter });
  }

  fetchEvents(params: EventsParams, rangeFilter: RangeFilter): Observable<EventsResponse> {
    return this.httpService.get$(`events`, { ...params, ...rangeFilter });
  }

  exportDriverPdf(driverId: number, rangeFilter: RangeFilter): Observable<void> {
    const queryParams = {
      from: rangeFilter.from,
      to: rangeFilter.to
    };
    return this.httpService.getFile$(`v2/leaderboard/drivers/${driverId}/export`, queryParams);
  }
}
