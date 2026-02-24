import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ChildrenOutletContexts, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subject, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RouteData, RouteQueryParams } from 'src/app/model/route.models';
import { AppState } from 'src/app/store/app-store.model';
import { ConfigActions } from 'src/app/store/config/config.actions';
import { waitOnceForAction, waitOnceForActions } from 'src/app/util/operators';
import RoutingUtil from 'src/app/util/routing.util';
import { IframeService } from '../../service/iframe/iframe.service';
import { AuthActions } from '../../store/auth/auth.actions';
import { AuthSelectors } from '../../store/auth/auth.selectors';
import { CommonObjectsActions } from '../../store/common-objects/common-objects.actions';
import { IframeState } from '../../store/iframe/iframe.reducer';
import { IframeSelectors } from '../../store/iframe/iframe.selectors';

@Component({
  selector: 'app-authenticated-container',
  templateUrl: './authenticated-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('routeFadeIn', [
      transition('* <=> *', [
        style({ opacity: 0 }),
        animate('200ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AuthenticatedContainerComponent implements OnInit, OnDestroy {
  isReady$?: Observable<boolean>;
  routeData$: Observable<RouteData>;
  routeQueryParams$: Observable<RouteQueryParams>;
  fullApp: boolean = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    public iframeService: IframeService,
    private readonly store: Store<AppState>,
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly contexts: ChildrenOutletContexts
  ) {
    this.routeData$ = RoutingUtil.getData<RouteData>(this.router);
    this.routeQueryParams$ = RoutingUtil.mergeQueryParams<RouteQueryParams>(this.router);
  }

  ngOnInit(): void {
    this.store
      .select(IframeSelectors.iframeState)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: IframeState) => {
        if (state.full_app_mode !== undefined && state.full_app_mode !== null) {
          this.fullApp = state.full_app_mode;
        }
      });

    this.store.dispatch(AuthActions.fetchUser());
    this.store.dispatch(ConfigActions.fetchAllData());
    this.store.dispatch(CommonObjectsActions.fetchVehiclesTree());
    this.store.dispatch(CommonObjectsActions.fetchDriversTree());
    this.store.dispatch(CommonObjectsActions.fetchFleetsTree());

    this.isReady$ = this.actions$.pipe(
      waitOnceForActions([AuthActions.fetchUserSuccess, ConfigActions.fetchAllDataSuccess, CommonObjectsActions.fetchVehiclesTreeSuccess, CommonObjectsActions.fetchDriversTreeSuccess, CommonObjectsActions.fetchFleetsTreeSuccess]),
      switchMap(() => this.store.pipe(select(AuthSelectors.isSuperAdminOrAdmin))),
      switchMap(isSuperAdminOrAdmin => {
        if (isSuperAdminOrAdmin) {
          this.store.dispatch(CommonObjectsActions.fetchUsersTreeForAdmins());
          return this.actions$.pipe(waitOnceForAction([CommonObjectsActions.fetchUsersTreeForAdminsSuccess]));
        }
        return of(true);
      })
    );
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    Promise.resolve().then(() => {
      this.store.dispatch(CommonObjectsActions.reset());
      this.store.dispatch(ConfigActions.reset());
    });
  }
}
