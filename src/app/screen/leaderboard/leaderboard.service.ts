import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { RangeFilter } from '../../model/range-filter.model';
import { TopDriversParams, TopDriversResponse } from '../reports/reports.model';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  constructor(private readonly httpService: HttpService) {}

  fetchTopDrivers(params: TopDriversParams, rangeFilter: RangeFilter): Observable<TopDriversResponse> {
    const queryParams = {
      ...params,
      from: rangeFilter.from + ' 00:00:00',
      to: rangeFilter.to + ' 23:59:59',
      with_ranks: true,
      driver_id: params.driver_id?.join(',')
    };
    return this.httpService.get$(`v2/drivers/top-drivers`, queryParams);
  }

  fetchSafetyScores(params: any, rangeFilter: RangeFilter): Observable<any> {
    const queryParams = {
      ...params,
      from: rangeFilter.from + ' 00:00:00',
      to: rangeFilter.to + ' 23:59:59'
    };

    return this.httpService.get$('safety-scores', queryParams);
  }

  exportLeaderboardPdf(fleetId: number, rangeFilter: RangeFilter): Observable<void> {
    const queryParams = {
      from: rangeFilter.from + ' 00:00:00',
      to: rangeFilter.to + ' 23:59:59'
    };
    return this.httpService.getFile$(`v2/leaderboard/fleets/${fleetId}/export`, queryParams);
  }
}
