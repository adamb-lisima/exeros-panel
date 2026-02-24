import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommentEventBody, EditEventBody, EventResponse, EventsElement, EventsParamsRequest, EventsResponse, ScreenEventParams, TelemetryResponse, TripResponse, TripsElement, TripsParams, TripsResponse, VehiclesParams, VehiclesResponse } from 'src/app/screen/events/events.model';
import { HttpService } from 'src/app/service/http/http.service';

@Injectable({ providedIn: 'root' })
export class EventsService {
  constructor(private readonly httpService: HttpService) {}

  fetchEvents(params: EventsParamsRequest): Observable<EventsResponse> {
    return this.httpService.post$<EventsResponse>(`events`, { ...params });
  }

  fetchEvent(id: EventsElement['id']): Observable<EventResponse> {
    return this.httpService.get$<EventResponse>(`events/${id}`);
  }

  screenEvent(id: EventsElement['id'], params: ScreenEventParams): Observable<any> {
    return this.httpService.getFile$(`v2/events/${id}/export`, params);
  }

  editEvent(id: EventsElement['id'], body: EditEventBody): Observable<EventResponse> {
    return this.httpService.put$<EventResponse>(`events/${id}/edit`, body);
  }

  commentEvent(id: string, body: CommentEventBody): Observable<any> {
    return this.httpService.post$(`events/${id}/comments`, body);
  }

  fetchTrips(params: TripsParams): Observable<TripsResponse> {
    return this.httpService.get$('trips', params);
  }

  fetchTrip(id: TripsElement['id']): Observable<TripResponse> {
    return this.httpService.get$(`v2/trips/${id}`);
  }

  downloadVideos(id: string): Observable<any> {
    return this.httpService.getFile$(`events/export-videos/${id}`);
  }

  fetchVehicles(params: VehiclesParams): Observable<VehiclesResponse> {
    return this.httpService.get$<VehiclesResponse>(`vehicles`, params);
  }

  fetchTelemetry(id: EventsElement['id']): Observable<TelemetryResponse> {
    return this.httpService.get$<TelemetryResponse>(`events/${id}/telemetry`);
  }

  toggleKudos(id: EventsElement['id']): Observable<any> {
    return this.httpService.put$(`v2/events/${id}/kudos`, {});
  }

  acceptDriverReview(reviewId: string): Observable<EventResponse> {
    return this.httpService.post$<EventResponse>(`v2/driver-reviews/${reviewId}/accept`, {});
  }

  rejectDriverReview(reviewId: string, reason: string): Observable<EventResponse> {
    return this.httpService.post$<EventResponse>(`v2/driver-reviews/${reviewId}/reject`, { reason });
  }
}
