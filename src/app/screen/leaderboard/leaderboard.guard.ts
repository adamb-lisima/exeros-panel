import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReportsActions } from '../reports/reports.actions';

@Injectable({ providedIn: 'root' })
export class LeaderboardGuard implements CanActivate, CanDeactivate<unknown> {
  constructor(private readonly store: Store) {}

  canActivate(): boolean {
    return true;
  }

  canDeactivate(): boolean {
    this.store.dispatch(ReportsActions.reset());
    return true;
  }
}
