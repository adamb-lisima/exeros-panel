import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { ExportType } from '../../../model/export-type.model';
import { RangeFilter } from '../../../model/range-filter.model';
import { VehicleCheckResponse, VehicleChecksParams, VehicleChecksResponse } from './vehicle-checks.model';

@Injectable({ providedIn: 'root' })
export class VehicleChecksService {
  constructor(private readonly httpService: HttpService) {}

  fetchVehicleChecks(params: VehicleChecksParams, rangeFilter: RangeFilter): Observable<VehicleChecksResponse> {
    return this.httpService.post$<VehicleChecksResponse>(`v2/vehicle-checks/online`, { ...params, ...rangeFilter });
  }

  exportVehicleChecks(exportType: ExportType, params: VehicleChecksParams, rangeFilter: RangeFilter): Observable<void> {
    return this.httpService.getFile$(`v2/reports/vehicle-checks/export/${exportType}`, { ...params, ...rangeFilter });
  }

  fetchVehicleCheck(id: number): Observable<VehicleCheckResponse> {
    return this.httpService.get$(`v2/reports/vehicle-checks/${id}`);
  }

  exportVehicleCheck(id: number): Observable<void> {
    return this.httpService.getFile$(`v2/vehicle-checks/${id}/export`);
  }
}
