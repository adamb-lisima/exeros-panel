import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { VersionService } from 'src/app/service/version/version.service';
import { ConfigResponse } from 'src/app/store/config/config.model';

let mapApiFetched = false;

@Injectable({ providedIn: 'root' })
export class ConfigService {
  constructor(private readonly httpService: HttpService, private readonly httpClient: HttpClient, private readonly versionService: VersionService) {}

  fetchAllData(): Observable<ConfigResponse> {
    return this.httpService.get$<ConfigResponse>('panel-config').pipe(
      tap(response => this.versionService.checkVersion(response.data.version)),
      switchMap(response =>
        (mapApiFetched ? of({}) : this.httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${response.data.google_maps_api_key}&libraries=drawing`, 'callback')).pipe(
          tap(() => (mapApiFetched = true)),
          map(() => response)
        )
      )
    );
  }
}
