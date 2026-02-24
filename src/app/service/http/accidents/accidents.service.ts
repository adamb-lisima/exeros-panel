import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { RangeFilter } from '../../../model/range-filter.model';
import { AccidentResponse, AccidentsParams, AccidentsResponse } from './accidents.model';

@Injectable({ providedIn: 'root' })
export class AccidentsService {
  constructor(private readonly httpService: HttpService) {}

  fetchAccidents(params: AccidentsParams, rangeFilter: RangeFilter): Observable<AccidentsResponse> {
    return this.httpService.get$<AccidentsResponse>(`v2/accidents`, { ...params, ...rangeFilter });
  }

  fetchAccident(id: string): Observable<AccidentResponse> {
    return this.httpService.get$(`v2/accidents/${id}`);
  }

  exportAccident(id: string): Observable<void> {
    return this.httpService.getFile$(`v2/accidents/${id}/export`);
  }
}
