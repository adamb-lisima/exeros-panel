import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable, of, Subscription, tap } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppState } from 'src/app/store/app-store.model';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { IframeState } from '../../../store/iframe/iframe.reducer';
import { IframeSelectors } from '../../../store/iframe/iframe.selectors';
import { EventsActions } from '../../events/events.actions';

@Injectable({ providedIn: 'root' })
export class EventsGuard implements CanActivate, CanDeactivate<boolean> {
  private subscription?: Subscription;

  constructor(private readonly store: Store<AppState>) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'EventsGuard' }));
    this.store.dispatch(EventsActions.reset());

    this.subscription = new Subscription();
    this.subscription.add(
      this.store
        .select(IframeSelectors.iframeState)
        .pipe(
          map((state: IframeState) => state.event_id),
          tap(eventId => {
            this.store.dispatch(EventsActions.setSelectedId({ id: eventId }));
            if (eventId) {
              this.store.dispatch(EventsActions.fetchEvent());
            } else {
              this.store.dispatch(EventsActions.resetEvent());
            }
            this.store.dispatch(EventsActions.resetVideoCurrentTime());
          })
        )
        .subscribe()
    );

    return of(true).pipe(finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'EventsGuard' }))));
  }

  canDeactivate(): boolean {
    return true;
  }
}
