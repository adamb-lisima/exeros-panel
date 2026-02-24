import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { finalize, Observable, of, Subscription, tap } from 'rxjs';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { WebSocketService } from '../../service/web-socket/web-socket.service';
import { AppState } from '../../store/app-store.model';
import { ConfigSelectors } from '../../store/config/config.selectors';
import { filterNullish } from '../../util/operators';
import { ReportsActions } from './reports.actions';

@Injectable({ providedIn: 'root' })
export class ReportsGuard implements CanActivate, CanDeactivate<boolean> {
  private sub?: Subscription;

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly webSocket: WebSocketService) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'ReportsGuard' }));
    this.store.dispatch(ReportsActions.reset());

    this.sub = new Subscription();

    this.sub.add(
      this.store
        .select(ConfigSelectors.data)
        .pipe(
          filterNullish(),
          tap(config => this.webSocket.connect(config.device_ids, ['sub_alarm']))
        )
        .subscribe()
    );

    return of(true).pipe(finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'ReportsGuard' }))));
  }

  canDeactivate(): boolean {
    this.webSocket.disconnect();
    this.sub?.unsubscribe();
    return true;
  }
}
