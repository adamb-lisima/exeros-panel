import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { StreamActions } from 'src/app/screen/stream/stream.actions';
import { AppState } from 'src/app/store/app-store.model';
import { applicationLoading } from 'src/app/store/application/application.actions';

@Injectable({ providedIn: 'root' })
export class PlaybackGuard implements CanActivate, CanDeactivate<boolean> {
  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'PlaybackGuard' }));
    this.store.dispatch(StreamActions.reset());

    return of(true).pipe(finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'PlaybackGuard' }))));
  }

  canDeactivate(): boolean {
    return true;
  }
}
