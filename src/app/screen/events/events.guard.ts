import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { finalize, map, Observable, Subscription, tap } from 'rxjs';
import { EventsActions } from 'src/app/screen/events/events.actions';
import { EventsRouteParams } from 'src/app/screen/events/events.model';
import { AppState } from 'src/app/store/app-store.model';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { firstNonNullish, waitOnceForActions } from 'src/app/util/operators';
import RoutingUtil from 'src/app/util/routing.util';
import { RouteQueryParams } from '../../model/route.models';
import { CommonObjectsSelectors } from '../../store/common-objects/common-objects.selectors';

@Injectable({ providedIn: 'root' })
export class EventsGuard implements CanActivate, CanDeactivate<boolean> {
  private subscription?: Subscription;

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly router: Router) {}

  canActivate(): Observable<boolean> {
    this.store.dispatch(applicationLoading({ loading: true, key: 'EventsGuard' }));
    this.store.dispatch(EventsActions.reset());

    this.subscription = new Subscription();
    this.subscription.add(
      RoutingUtil.mergeParams<EventsRouteParams>(this.router)
        .pipe(
          map(params => params.id),
          tap(id => this.store.dispatch(EventsActions.setSelectedId({ id }))),
          tap(id => this.store.dispatch(id ? EventsActions.fetchEvent() : EventsActions.resetEvent())),
          tap(() => this.store.dispatch(EventsActions.resetVideoCurrentTime()))
        )
        .subscribe()
    );
    this.subscription.add(
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
            return fleetsTree[0]?.id;
          }),
          firstNonNullish(),
          tap(fleetId =>
            this.store.dispatch(
              EventsActions.fetchEvents({
                params: {
                  fleet_id: fleetId,
                  include_review_optional: 'true'
                }
              })
            )
          ),
          tap(fleetId => this.store.dispatch(EventsActions.fetchVehicles({ params: { fleet_id: fleetId } })))
        )
        .subscribe()
    );
    this.subscription.add(
      RoutingUtil.mergeQueryParams<RouteQueryParams>(this.router)
        .pipe(tap(params => this.store.dispatch(EventsActions.setMode({ mode: params.mode }))))
        .subscribe()
    );

    return this.actions$.pipe(
      waitOnceForActions([EventsActions.fetchEventsSuccess]),
      finalize(() => this.store.dispatch(applicationLoading({ loading: false, key: 'EventsGuard' })))
    );
  }

  canDeactivate(): boolean {
    this.subscription?.unsubscribe();
    return true;
  }
}
