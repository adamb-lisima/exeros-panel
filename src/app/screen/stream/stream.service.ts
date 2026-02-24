import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlarmsParams, AlarmsResponse, CreateMessageBody, CreateMessageResponse, ExportTelemetryParams, MapVehiclesParams, MapVehiclesResponse, Playback, PlaybackParams, PlaybackResponse, PlaybackScopeParams, PlaybackScopeResponse, PlaybackSeekParams, PlaybackTimelineParams, PlaybackTimelineResponse, VehiclesElement, VehiclesParams, VehiclesResponse } from 'src/app/screen/stream/stream.model';
import { HttpService } from 'src/app/service/http/http.service';
import { ClipToEvent, ExtendEvent, SharedClipCreateBody, SharedClipResponse } from '../../store/download-task/download-task.model';

@Injectable({ providedIn: 'root' })
export class StreamService {
  private vehiclesCache = new Map<string, Observable<VehiclesResponse>>();

  constructor(private readonly httpService: HttpService) {}

  fetchVehicles(params: VehiclesParams): Observable<VehiclesResponse> {
    return this.httpService.post$<VehiclesResponse>('vehicles', params);
  }

  fetchAlarms(params: AlarmsParams): Observable<AlarmsResponse> {
    return this.httpService.get$<AlarmsResponse>(`alarms`, params);
  }

  searchLocation(search: string): Observable<{ data: { display_name: string; latitude: string; longitude: string }[] }> {
    return this.httpService.get$<{ data: { display_name: string; latitude: string; longitude: string }[] }>(`v2/search-location?search=${search}`);
  }

  createMessage(body: CreateMessageBody): Observable<CreateMessageResponse> {
    return this.httpService.post$(`updates/create`, body);
  }

  fetchPlayback(id: Playback['id'], params: PlaybackParams): Observable<PlaybackResponse> {
    return this.httpService.get$<PlaybackResponse>(`vehicles/playbacks/${id}`, params);
  }

  fetchPlaybackTimeline(id: Playback['id'], params: PlaybackTimelineParams): Observable<PlaybackTimelineResponse> {
    return this.httpService.get$<PlaybackTimelineResponse>(`vehicles/playbacks/${id}/timeline`, params);
  }

  fetchPlaybackScope(id: Playback['id'], params: PlaybackScopeParams): Observable<PlaybackScopeResponse> {
    return this.httpService.get$<PlaybackScopeResponse>(`vehicles/playbacks/${id}/scope-data`, params);
  }

  exportTelemetry(id: Playback['id'], params: ExportTelemetryParams): Observable<void> {
    return this.httpService.getFile$(`v2/vehicles/playbacks/${id}/export-telemetry`, params);
  }

  fetchPlaybackSeek(id: Playback['id'], params: PlaybackSeekParams): Observable<PlaybackSeekParams> {
    return this.httpService.get$<PlaybackSeekParams>(`vehicles/playbacks/${id}/seek`, params);
  }

  fetchMapVehicles(params: MapVehiclesParams): Observable<MapVehiclesResponse> {
    return this.httpService.get$('vehicles-on-map', params);
  }

  logPlaybackRequest(params: { vehicle_id: number; channels: string; status: number; time: number; type: 'playback' | 'live' | 'Iframe-playback' | 'Iframe-live' }): Observable<any> {
    return this.httpService.get$<any>('v2/playbacks/logs', params);
  }

  addSharedClip(id: Playback['id'], body: SharedClipCreateBody): Observable<any> {
    return this.httpService.post$<any>(`v2/vehicles/playbacks/${id}/add-shared-clip`, body);
  }

  watchClip(slug: string, params: { password?: string }): Observable<SharedClipResponse> {
    return this.httpService.post$<SharedClipResponse>(`v2/watch-clip/${slug}`, params);
  }

  clipToEvent(id: VehiclesElement['id'], body: ClipToEvent): Observable<any> {
    return this.httpService.post$<any>(`v2/vehicles/playbacks/${id}/event-from-clip`, body);
  }

  extendEvent(id: string, body: ExtendEvent): Observable<any> {
    return this.httpService.post$<any>(`v2/events/${id}/extend`, body);
  }
}
