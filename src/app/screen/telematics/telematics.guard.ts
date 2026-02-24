import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { TelematicsActions } from './telematics.actions';

@Injectable({ providedIn: 'root' })
export class TelematicsGuard implements CanActivate, CanDeactivate<boolean> {
  constructor(private readonly store: Store) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'TelematicsGuard' }));
    this.store.dispatch(TelematicsActions.reset());
    this.store.dispatch(applicationLoading({ loading: false, key: 'TelematicsGuard' }));
    return of(true);
  }

  canDeactivate(): boolean {
    return true;
  }
}
