import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { LiveFeed, LiveFeedResponse, TelemetryUpdateResponse } from './live-feeds.model';

@Injectable({ providedIn: 'root' })
export class LiveFeedsService {
  constructor(private readonly httpService: HttpService) {}

  fetchLiveFeed(id: LiveFeed['id']): Observable<LiveFeedResponse> {
    return this.httpService.get$<LiveFeedResponse>(`vehicles/live-feeds/${id}`);
  }

  fetchTelemetryUpdate(vehicleId: number): Observable<TelemetryUpdateResponse> {
    return this.httpService.get$(`v2/vehicles/${vehicleId}/get-signal-value`);
  }
}
