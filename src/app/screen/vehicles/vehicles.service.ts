import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { RangeFilter } from '../../model/range-filter.model';
import { AlarmsParams, AlarmsResponse, CameraChannelsResponse, EventsParams, EventsResponse, TripResponse, TripsElement, TripsParams, TripsResponse, UpdateCameraChannelBody, VehicleResponse, VehiclesElement, VehiclesParams, VehiclesResponse } from './vehicles.model';

@Injectable({ providedIn: 'root' })
export class VehiclesService {
  constructor(private readonly httpService: HttpService) {}

  fetchVehicles(params: VehiclesParams): Observable<VehiclesResponse> {
    return this.httpService.post$(`vehicles`, { ...params });
  }

  fetchVehicle(id: VehiclesElement['id'], rangeFilter: RangeFilter): Observable<VehicleResponse> {
    return this.httpService.get$(`vehicles/${id}`, rangeFilter);
  }

  fetchCameraChannels(vehicleId: number): Observable<CameraChannelsResponse> {
    return this.httpService.get$(`vehicles/${vehicleId}/camera-channels`);
  }

  updateCameraChannels(bodies: UpdateCameraChannelBody[]): Observable<any> {
    return forkJoin(bodies.map(body => this.httpService.put$(`vehicles/camera-channels/${body.id}/edit`, body)));
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
    return this.httpService.post$(`events`, { ...params, ...rangeFilter });
  }
}
