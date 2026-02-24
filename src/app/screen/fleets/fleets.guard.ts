import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { finalize, map, Observable, Subscription, tap } from 'rxjs';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { firstNonNullish, waitOnceForActions } from 'src/app/util/operators';
import { WebSocketService } from '../../service/web-socket/web-socket.service';
import { AppState } from '../../store/app-store.model';
import { CommonObjectsSelectors } from '../../store/common-objects/common-objects.selectors';
import { DEFAULT_FLEET_ID } from '../../store/common-objects/common-objects.service';
import RoutingUtil from '../../util/routing.util';
import { FleetsActions } from './fleets.actions';
import { FleetsRouteParams } from './fleets.model';

@Injectable({ providedIn: 'root' })
export class FleetsGuard implements CanActivate, CanDeactivate<boolean> {
  private sub?: Subscription;

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly router: Router, private readonly webSocket: WebSocketService) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'FleetsGuard' }));
    this.store.dispatch(FleetsActions.reset());

    this.sub = new Subscription();
    this.sub.add(
      this.store
        .select(CommonObjectsSelectors.fleetsTree)
        .pipe(
          map(fleetsTree => {
            const savedFleetId = localStorage.getItem('exeros-fleet-id');
            if (savedFleetId) {
              const fleetId = parseInt(savedFleetId, 10);
              if (!isNaN(fleetId)) {
                return fleetId;
              }
            }
            return fleetsTree[0]?.id ?? DEFAULT_FLEET_ID;
          }),
          firstNonNullish(),
          tap(fleetId => this.store.dispatch(FleetsActions.fetchEventsStats({ params: { fleet_id: fleetId } })))
        )
        .subscribe()
    );
    this.sub.add(
      RoutingUtil.mergeParams<FleetsRouteParams>(this.router)
        .pipe(
          map(params => (params.id ? Number(params.id) : undefined)),
          tap(id => this.store.dispatch(id ? FleetsActions.fetchEventsStats({ params: { fleet_id: id } }) : FleetsActions.reset())),
          tap(id => this.store.dispatch(id ? FleetsActions.fetchEvents({ params: { vehicle_id: id } }) : FleetsActions.resetEvents()))
        )
        .subscribe()
    );

    return this.actions$.pipe(
      waitOnceForActions([FleetsActions.fetchEventsStatsSuccess]),
      finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'FleetsGuard' })))
    );
  }

  canDeactivate(): boolean {
    this.sub?.unsubscribe();
    this.webSocket.disconnect();
    return true;
  }
}
