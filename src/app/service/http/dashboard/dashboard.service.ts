import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { RangeFilter } from '../../../model/range-filter.model';
import { DashboardParams, DashboardResponse } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly httpService: HttpService) {}

  fetchDashboard(params: DashboardParams, rangeFilter: RangeFilter): Observable<DashboardResponse> {
    return this.httpService.get$<DashboardResponse>(`v2/dashboard`, { ...params, ...rangeFilter });
  }
}
