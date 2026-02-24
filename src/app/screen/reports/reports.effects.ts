import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concat, EMPTY, map, of, switchMap, withLatestFrom } from 'rxjs';
import { AccidentsService } from '../../service/http/accidents/accidents.service';
import { VehicleChecksService } from '../../service/http/vehicle-checks/vehicle-checks.service';
import { applicationLoading } from '../../store/application/application.actions';
import { ReportsActions } from './reports.actions';
import { ReportsSelectors } from './reports.selectors';
import { ReportsService } from './reports.service';

@Injectable()
export class ReportsEffects {
  fetchMileage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchMileage),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.mileageParams)),
      switchMap(([{ params }, rangeFilter, mileageParams]) =>
        concat(
          of(ReportsActions.setMileageLoading({ loading: true })),
          of({ ...mileageParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setMileageParams({ params: newParams })),
                this.reportsService.fetchMileage(newParams, rangeFilter).pipe(
                  map(({ data }) => ReportsActions.fetchMileageSuccess({ data: data.mileage_chart })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setMileageLoading({ loading: false }))
        )
      )
    )
  );

  exportMileage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportMileage),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.mileageParams)),
      switchMap(([{ exportType }, rangeFilter, mileageParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportMileage$' })),
          this.reportsService.exportMileage(exportType, mileageParams, rangeFilter).pipe(
            map(() => ReportsActions.exportMileageSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportMileage$' }))
        )
      )
    )
  );

  fetchDrivingTime$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchDrivingTime),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.drivingTimeParams)),
      switchMap(([{ params }, rangeFilter, drivingTimeParams]) =>
        concat(
          of(ReportsActions.setDrivingTimeLoading({ loading: true })),
          of({ ...drivingTimeParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setDrivingTimeParams({ params: newParams })),
                this.reportsService.fetchDrivingTime(newParams, rangeFilter).pipe(
                  map(({ data }) => ReportsActions.fetchDrivingTimeSuccess({ data: data.driving_time_chart })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setDrivingTimeLoading({ loading: false }))
        )
      )
    )
  );

  exportDrivingTime$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportDrivingTime),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.drivingTimeParams)),
      switchMap(([{ exportType }, rangeFilter, drivingTimeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportDrivingTime$' })),
          this.reportsService.exportDrivingTime(exportType, drivingTimeParams, rangeFilter).pipe(
            map(() => ReportsActions.exportDrivingTimeSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportDrivingTime$' }))
        )
      )
    )
  );

  fetchVehicleIssues$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchVehicleIssues),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.vehicleIssuesParams), this.store.select(ReportsSelectors.vehicleIssues)),
      switchMap(([{ params }, rangeFilter, vehicleIssuesParams, vehicleIssues]) =>
        concat(
          of(ReportsActions.setVehicleIssuesLoading({ loading: true })),
          of({ ...vehicleIssuesParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setVehicleIssuesParams({ params: newParams })),
                this.reportsService.fetchVehicleIssues(newParams, rangeFilter).pipe(
                  map(({ data, meta }) =>
                    ReportsActions.fetchVehicleIssuesSuccess({
                      data: newParams.page === 1 ? data : [...vehicleIssues, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setVehicleIssuesLoading({ loading: false }))
        )
      )
    )
  );

  fetchVehicleChecks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchVehicleChecks),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.vehicleChecksParams)),
      switchMap(([{ params }, rangeFilter, vehicleChecksParams]) =>
        concat(
          of(ReportsActions.setVehicleChecksLoading({ loading: true })),
          of({ ...vehicleChecksParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setVehicleChecksParams({ params: newParams })),
                this.vehicleChecksService.fetchVehicleChecks(newParams, rangeFilter).pipe(
                  map(({ data }) => ReportsActions.fetchVehicleChecksSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setVehicleChecksLoading({ loading: false }))
        )
      )
    )
  );

  exportVehicleChecks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportVehicleChecks),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.vehicleChecksParams)),
      switchMap(([{ exportType }, rangeFilter, vehicleChecksParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportVehicleChecks$' })),
          this.vehicleChecksService.exportVehicleChecks(exportType, vehicleChecksParams, rangeFilter).pipe(
            map(() => ReportsActions.exportVehicleChecksSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportVehicleChecks$' }))
        )
      )
    )
  );

  fetchVehicleCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchVehicleCheck),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehicleCheck$' })),
          this.vehicleChecksService.fetchVehicleCheck(id).pipe(
            map(({ data }) => ReportsActions.fetchVehicleCheckSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehicleCheck$' }))
        )
      )
    )
  );

  exportVehicleCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportVehicleCheck),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportVehicleCheck$' })),
          this.vehicleChecksService.exportVehicleCheck(id).pipe(
            map(() => ReportsActions.exportVehicleCheckSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportVehicleCheck$' }))
        )
      )
    )
  );

  fetchAlarms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchAlarms),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.alarmsParams)),
      switchMap(([{ params }, rangeFilter, alarmsParams]) =>
        concat(
          of(ReportsActions.setAlarmsLoading({ loading: true })),
          of({ ...alarmsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setAlarmsParams({ params: newParams })),
                this.reportsService.fetchAlarms(newParams, rangeFilter).pipe(
                  map(({ data, meta }) => ReportsActions.fetchAlarmsSuccess({ data, meta })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setAlarmsLoading({ loading: false }))
        )
      )
    )
  );

  exportAlarms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportAlarms),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.alarmsParams)),
      switchMap(([{ exportType }, rangeFilter, alarmsParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportAlarms$' })),
          this.reportsService.exportAlarms(exportType, alarmsParams, rangeFilter).pipe(
            map(() => ReportsActions.exportAlarmsSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportAlarms$' }))
        )
      )
    )
  );

  fetchEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchEvents),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.eventsParams)),
      switchMap(([{ params }, rangeFilter, eventsParams]) =>
        concat(
          of(ReportsActions.setEventsLoading({ loading: true })),
          of({ ...eventsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setEventsParams({ params: newParams })),
                this.reportsService.fetchEvents(newParams, rangeFilter).pipe(
                  map(({ data, meta }) => ReportsActions.fetchEventsSuccess({ data, meta })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setEventsLoading({ loading: false }))
        )
      )
    )
  );

  fetchEventsInBackground$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchEventsInBackground),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.eventsParams)),
      switchMap(([, rangeFilter, eventsParams]) =>
        this.reportsService
          .fetchEvents(
            {
              ...eventsParams,
              fetch_in_background: true
            },
            rangeFilter
          )
          .pipe(
            map(({ data, meta }) => ReportsActions.fetchEventsInBackgroundSuccess({ data, meta })),
            catchError(() => EMPTY)
          )
      )
    )
  );

  exportEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportEvents),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.eventsParams)),
      switchMap(([{ exportType }, rangeFilter, eventsParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportEvents$' })),
          this.reportsService.exportEvents(exportType, eventsParams, rangeFilter).pipe(
            map(() => ReportsActions.exportEventsSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportEvents$' }))
        )
      )
    )
  );

  exportUserLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportUserLogs),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.eventsParams)),
      switchMap(([_, rangeFilter, eventParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportUserLogs$' })),
          this.reportsService.exportUserLogs(eventParams, rangeFilter).pipe(
            map(() => ReportsActions.exportUserLogsSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportUserLogs$' }))
        )
      )
    )
  );

  fetchDistanceDriven$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchDistanceDriven),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.distanceDrivenParams)),
      switchMap(([{ params }, rangeFilter, distanceDrivenParams]) =>
        concat(
          of(ReportsActions.setDistanceDrivenLoading({ loading: true })),
          of({ ...distanceDrivenParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setDistanceDrivenParams({ params: newParams })),
                this.reportsService.fetchDistanceDriven(newParams, rangeFilter).pipe(
                  map(({ data }) => ReportsActions.fetchDistanceDrivenSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setDistanceDrivenLoading({ loading: false }))
        )
      )
    )
  );

  exportDistanceDriven$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportDistanceDriven),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.distanceDrivenParams)),
      switchMap(([_, rangeFilter, distanceDrivenParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportDistanceDriven$' })),
          this.reportsService.exportDistanceDriven(distanceDrivenParams, rangeFilter).pipe(
            map(() => ReportsActions.exportDistanceDrivenSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportDistanceDriven$' }))
        )
      )
    )
  );

  fetchUserLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchUserLogs),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter)),
      switchMap(([{ params }, rangeFilter]) =>
        concat(
          of(ReportsActions.setUserLogsLoading({ loading: true })),
          this.reportsService.fetchUserLogs(params, rangeFilter).pipe(
            map(({ data }) => ReportsActions.fetchUserLogsSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(ReportsActions.setUserLogsLoading({ loading: false }))
        )
      )
    )
  );

  fetchVehicleOnlineStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchVehicleOnlineStatus),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.vehicleOnlineStatusParams)),
      switchMap(([{ params }, rangeFilter, vehicleOnlineStatusParams]) =>
        concat(
          of(ReportsActions.setVehicleOnlineStatusLoading({ loading: true })),
          of({ ...vehicleOnlineStatusParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setVehicleOnlineStatusParams({ params: newParams })),
                this.reportsService.fetchVehicleOnlineStatus(newParams, rangeFilter).pipe(
                  map(({ data }) => ReportsActions.fetchVehicleOnlineStatusSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setVehicleOnlineStatusLoading({ loading: false }))
        )
      )
    )
  );

  exportVehicleOnlineStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportVehicleOnlineStatus),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.vehicleOnlineStatusParams)),
      switchMap(([_, rangeFilter, vehicleOnlineStatusParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportVehicleOnlineStatus$' })),
          this.reportsService.exportVehicleOnlineStatus(vehicleOnlineStatusParams, rangeFilter).pipe(
            map(() => ReportsActions.exportVehicleOnlineStatusSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportVehicleOnlineStatus$' }))
        )
      )
    )
  );

  fetchAccidents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchAccidents),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.accidentsParams), this.store.select(ReportsSelectors.accidents)),
      switchMap(([{ params }, rangeFilter, accidentsParams, accidents]) =>
        concat(
          of(ReportsActions.setAccidentsLoading({ loading: true })),
          of({ ...accidentsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setAccidentsParams({ params: newParams })),
                this.accidentsService.fetchAccidents(newParams, rangeFilter).pipe(
                  map(({ data, meta }) =>
                    ReportsActions.fetchAccidentsSuccess({
                      data: newParams.page === 1 ? data : [...accidents, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setAccidentsLoading({ loading: false }))
        )
      )
    )
  );

  fetchAccident$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchAccident),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchAccident$' })),
          this.accidentsService.fetchAccident(id).pipe(
            map(({ data }) => ReportsActions.fetchAccidentSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchAccident$' }))
        )
      )
    )
  );

  exportAccident$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportAccident),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportAccident$' })),
          this.accidentsService.exportAccident(id).pipe(
            map(() => ReportsActions.exportAccidentSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportAccident$' }))
        )
      )
    )
  );

  fetchTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.fetchTrips),
      withLatestFrom(this.store.select(ReportsSelectors.tripsParams), this.store.select(ReportsSelectors.trips)),
      switchMap(([{ params }, tripsParams, trips]) =>
        concat(
          of(ReportsActions.setTripsLoading({ loading: true })),
          of({ ...tripsParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(ReportsActions.setTripsParams({ params: newParams })),
                this.reportsService.fetchTrips(newParams).pipe(
                  map(({ data, meta }) =>
                    ReportsActions.fetchTripsSuccess({
                      data: newParams.page === 1 ? data : [...trips, ...data],
                      meta
                    })
                  ),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(ReportsActions.setTripsLoading({ loading: false }))
        )
      )
    )
  );

  exportTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.exportTrips),
      withLatestFrom(this.store.select(ReportsSelectors.rangeFilter), this.store.select(ReportsSelectors.tripsParams)),
      switchMap(([{ exportType }, rangeFilter, tripsParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'exportTrips$' })),
          this.reportsService.exportTrips(exportType, tripsParams, rangeFilter).pipe(
            map(() => ReportsActions.exportTripsSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'exportTrips$' }))
        )
      )
    )
  );

  constructor(private readonly store: Store, private readonly actions$: Actions, private readonly reportsService: ReportsService, private readonly vehicleChecksService: VehicleChecksService, private readonly accidentsService: AccidentsService) {}
}
