import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { RangeFilter } from '../../model/range-filter.model';
import { EventsResponse } from '../events/events.model';
import { EventsParams } from '../vehicles/vehicles.model';
import { EventsStatsElementResponse, EventsStatsParams, EventsStatsResponse, EventsTrendsChartResponse, EventTrendsChartParams } from './fleets.model';

@Injectable({
  providedIn: 'root'
})
export class FleetsService {
  constructor(private readonly httpService: HttpService) {}

  fetchEventTrends(params: EventTrendsChartParams): Observable<EventsTrendsChartResponse> {
    return this.httpService.post$(`v2/events/trends`, { ...params });
  }

  fetchEventsStats(params: EventsStatsParams): Observable<EventsStatsResponse> {
    return this.httpService.get$(`v2/events/stats`, { ...params });
  }

  fetchEventsStatsElement(id: number): Observable<EventsStatsElementResponse> {
    return this.httpService.get$(`v2/events/stats/${id}`);
  }

  fetchEvents(params: EventsParams, rangeFilter: RangeFilter): Observable<EventsResponse> {
    return this.httpService.post$(`events`, { ...params, ...rangeFilter });
  }
}
