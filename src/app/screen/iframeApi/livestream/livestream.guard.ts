import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { StreamActions } from 'src/app/screen/stream/stream.actions';
import { AppState } from 'src/app/store/app-store.model';
import { applicationLoading } from 'src/app/store/application/application.actions';

@Injectable({ providedIn: 'root' })
export class LivestreamGuard implements CanActivate, CanDeactivate<boolean> {
  constructor(private readonly store: Store<AppState>) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'LivestreamGuard' }));
    this.store.dispatch(StreamActions.reset());

    return of(true).pipe(finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'LivestreamGuard' }))));
  }

  canDeactivate(): boolean {
    return true;
  }
}
