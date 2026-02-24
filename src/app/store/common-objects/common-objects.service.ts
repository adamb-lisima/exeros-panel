import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { DriversTreeParams, DriversTreeResponse, FleetsTreeElement, FleetsTreeParams, FleetsTreeResponse, MapVehiclesParams, MapVehiclesResponse, UsersTreeParams, UsersTreeResponse, VehicleDevicesResponse, VehiclesTreeResponse } from './common-objects.model';

export const DEFAULT_FLEET_ID: FleetsTreeElement['id'] = 1;

@Injectable({ providedIn: 'root' })
export class CommonObjectsService {
  constructor(private readonly httpService: HttpService) {}

  fetchVehiclesTree(): Observable<VehiclesTreeResponse> {
    return this.httpService.get$('v2/vehicles/tree');
  }

  fetchVehiclesTreeWithDriver(driver_id: number): Observable<VehiclesTreeResponse> {
    return this.httpService.get$('v2/vehicles/tree', { driver_id });
  }

  fetchVehicleDevices(provider_id: number): Observable<VehicleDevicesResponse> {
    const params = { provider_id };
    return this.httpService.get$(`vehicle-devices`, params);
  }

  fetchDriversTree(params: DriversTreeParams): Observable<DriversTreeResponse> {
    return this.httpService.get$('v2/drivers/tree', params);
  }

  fetchUsersTree(params: UsersTreeParams): Observable<UsersTreeResponse> {
    return this.httpService.get$('v2/users/tree', params);
  }

  fetchFleetsTree(params: FleetsTreeParams): Observable<FleetsTreeResponse> {
    return this.httpService.get$('fleets-tree', params);
  }

  fetchMapVehicles(params: MapVehiclesParams): Observable<MapVehiclesResponse> {
    return this.httpService.post$('vehicles-on-map', params);
  }
}
