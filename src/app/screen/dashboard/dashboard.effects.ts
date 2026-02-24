import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concat, EMPTY, map, of, switchMap, withLatestFrom } from 'rxjs';
import { DashboardActions } from 'src/app/screen/dashboard/dashboard.actions';
import { DashboardSelectors } from 'src/app/screen/dashboard/dashboard.selectors';
import { AppState } from 'src/app/store/app-store.model';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { AccidentsService } from '../../service/http/accidents/accidents.service';
import { DashboardService } from '../../service/http/dashboard/dashboard.service';
import { VehicleChecksService } from '../../service/http/vehicle-checks/vehicle-checks.service';

@Injectable()
export class DashboardEffects {
  fetchDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.fetchDashboard),
      withLatestFrom(this.store.select(DashboardSelectors.rangeFilter), this.store.select(DashboardSelectors.dashboardParams)),
      switchMap(([{ params }, rangeFilter, dashboardParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchDashboard$' })),
          of({ ...dashboardParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DashboardActions.setDashboardParams({ params: newParams })),
                this.dashboardService.fetchDashboard(newParams, rangeFilter).pipe(
                  map(({ data }) => DashboardActions.fetchDashboardSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchDashboard$' }))
        )
      )
    )
  );

  fetchAccidents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.fetchAccidents),
      withLatestFrom(this.store.select(DashboardSelectors.rangeFilter), this.store.select(DashboardSelectors.accidentsParams), this.store.select(DashboardSelectors.accidents)),
      switchMap(([{ params }, rangeFilter, accidentsParams, accidents]) =>
        concat(
          of(DashboardActions.setAccidentsLoading({ loading: true })),
          of({ ...accidentsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DashboardActions.setAccidentsParams({ params: newParams })),
                this.accidentsService.fetchAccidents(newParams, rangeFilter).pipe(
                  map(({ data, meta }) =>
                    DashboardActions.fetchAccidentsSuccess({
                      data: newParams.page === 1 ? data : [...accidents, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(DashboardActions.setAccidentsLoading({ loading: false }))
        )
      )
    )
  );

  fetchAccident$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.fetchAccident),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchAccident$' })),
          this.accidentsService.fetchAccident(id).pipe(
            map(({ data }) => DashboardActions.fetchAccidentSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchAccident$' }))
        )
      )
    )
  );

  exportAccident$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.exportAccident),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportAccident$' })),
          this.accidentsService.exportAccident(id).pipe(
            map(() => DashboardActions.exportAccidentSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportAccident$' }))
        )
      )
    )
  );

  fetchVehicleChecks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.fetchVehicleChecks),
      withLatestFrom(this.store.select(DashboardSelectors.rangeFilter), this.store.select(DashboardSelectors.vehicleChecksParams)),
      switchMap(([{ params }, rangeFilter, vehicleChecksParams]) =>
        concat(
          of(DashboardActions.setVehicleChecksLoading({ loading: true })),
          of({ ...vehicleChecksParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(DashboardActions.setVehicleChecksParams({ params: newParams })),
                this.vehicleChecksService.fetchVehicleChecks({ ...newParams, with_offlines: newParams.status !== 'Incomplete' }, rangeFilter).pipe(
                  map(({ data }) => DashboardActions.fetchVehicleChecksSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(DashboardActions.setVehicleChecksLoading({ loading: false }))
        )
      )
    )
  );

  fetchVehicleCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.fetchVehicleCheck),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehicleCheck$' })),
          this.vehicleChecksService.fetchVehicleCheck(id).pipe(
            map(({ data }) => DashboardActions.fetchVehicleCheckSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehicleCheck$' }))
        )
      )
    )
  );

  exportVehicleCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.exportVehicleCheck),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportVehicleCheck$' })),
          this.vehicleChecksService.exportVehicleCheck(id).pipe(
            map(() => DashboardActions.exportVehicleCheckSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportVehicleCheck$' }))
        )
      )
    )
  );

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly dashboardService: DashboardService, private readonly vehicleChecksService: VehicleChecksService, private readonly accidentsService: AccidentsService) {}
}
