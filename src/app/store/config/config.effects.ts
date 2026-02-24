import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, EMPTY, map, switchMap, tap } from 'rxjs';
import { WebSocketService } from 'src/app/service/web-socket/web-socket.service';
import { ConfigActions } from 'src/app/store/config/config.actions';
import { ConfigService } from 'src/app/store/config/config.service';

@Injectable()
export class ConfigEffects {
  fetchAllData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.fetchAllData),
      switchMap(() =>
        this.configService.fetchAllData().pipe(
          tap(({ data }) => (this.webSocketService.data = { url: data.socket_url, key: data.api_key })),
          map(({ data }) => ConfigActions.fetchAllDataSuccess({ data })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly configService: ConfigService, private readonly webSocketService: WebSocketService) {}
}
