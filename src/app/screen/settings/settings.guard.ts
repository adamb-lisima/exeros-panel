import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { finalize, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { applicationLoading } from '../../store/application/application.actions';
import { AuthSelectors } from '../../store/auth/auth.selectors';
import { firstNonNullish } from '../../util/operators';
import { SettingsActions } from './settings.actions';

@Injectable({ providedIn: 'root' })
export class SettingsGuard implements CanActivate, CanDeactivate<boolean> {
  private subscription?: Subscription;

  constructor(private readonly store: Store) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'SettingsGuard' }));
    this.store.dispatch(SettingsActions.reset());

    this.subscription = new Subscription();
    this.subscription.add(
      this.store
        .select(AuthSelectors.loggedInUser)
        .pipe(
          firstNonNullish(),
          tap(loggedInUser => {
            if (loggedInUser.role === 'SUPER_ADMIN') {
              this.store.dispatch(SettingsActions.fetchUsersTree({ params: {} }));
              this.store.dispatch(SettingsActions.fetchFleetsTree({ params: {} }));
              this.store.dispatch(SettingsActions.fetchSafetyScoreProfiles({ params: {} }));
              this.store.dispatch(SettingsActions.fetchNotifications({ params: {} }));
            }
          })
        )
        .subscribe()
    );

    return this.store.select(AuthSelectors.isSuperAdminOrAdmin).pipe(
      firstNonNullish(),
      switchMap(() => of(true)),
      finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'SettingsGuard' })))
    );
  }

  canDeactivate(): boolean {
    this.subscription?.unsubscribe();
    return true;
  }
}
