import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concat, EMPTY, map, of, switchMap } from 'rxjs';
import { applicationLoading } from '../application/application.actions';
import { CommonObjectsActions } from './common-objects.actions';
import { CommonObjectsService } from './common-objects.service';

@Injectable()
export class CommonObjectsEffects {
  fetchVehiclesTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommonObjectsActions.fetchVehiclesTree),
      switchMap(() =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehiclesTree$' })),
          this.commonObjectsService.fetchVehiclesTree().pipe(
            map(({ data }) => CommonObjectsActions.fetchVehiclesTreeSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehiclesTree$' }))
        )
      )
    )
  );

  fetchVehiclesTreeWithDriver$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommonObjectsActions.fetchVehiclesTreeWithDriver),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehiclesTreeWithDriver$' })),
          this.commonObjectsService.fetchVehiclesTreeWithDriver(id).pipe(
            map(({ data }) => CommonObjectsActions.fetchVehiclesTreeWithDriverSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehiclesTreeWithDriver$' }))
        )
      )
    )
  );

  fetchDriversTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommonObjectsActions.fetchDriversTree),
      switchMap(() =>
        this.commonObjectsService.fetchDriversTree({ company_id: '' }).pipe(
          map(({ data }) => CommonObjectsActions.fetchDriversTreeSuccess({ data })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  fetchUsersTreeForAdmins$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommonObjectsActions.fetchUsersTreeForAdmins),
      switchMap(() =>
        this.commonObjectsService.fetchUsersTree({}).pipe(
          map(({ data }) => CommonObjectsActions.fetchUsersTreeForAdminsSuccess({ data })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  fetchFleetsTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommonObjectsActions.fetchFleetsTree),
      switchMap(() =>
        this.commonObjectsService.fetchFleetsTree({}).pipe(
          map(({ data }) => CommonObjectsActions.fetchFleetsTreeSuccess({ data: data.fleet_dtos })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  fetchMapVehicles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommonObjectsActions.fetchMapVehicles),
      switchMap(({ params }) =>
        this.commonObjectsService.fetchMapVehicles(params).pipe(
          map(({ data }) => CommonObjectsActions.fetchMapVehiclesSuccess({ data })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly commonObjectsService: CommonObjectsService) {}
}
