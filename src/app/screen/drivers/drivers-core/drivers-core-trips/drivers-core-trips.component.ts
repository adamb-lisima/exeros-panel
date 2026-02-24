import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first, map, Subject, Subscription, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { TripsBaseComponent } from '../../../../shared/component/dialog/trips-base/trips-base.component';
import { DriversActions } from '../../drivers.actions';
import { TripsElement, TripsParams } from '../../drivers.model';
import { driversInitialState } from '../../drivers.reducer';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-trips',
  templateUrl: './drivers-core-trips.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreTripsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly sortOrderOptions: SelectControl<TripsParams['sort_order']>[] = [
    { value: 'ASC', label: 'ASC' },
    { value: 'DESC', label: 'DESC' }
  ];

  paramsGroup = this.fb.group<Nullable<Pick<TripsParams, 'sort_order'>>>({
    sort_order: undefined
  });

  trips$ = this.store.select(DriversSelectors.trips);
  tripsMeta$ = this.store.select(DriversSelectors.tripsMeta);
  tripsLoading$ = this.store.select(DriversSelectors.tripsLoading);
  tripLoading$ = this.store.select(DriversSelectors.tripLoading);
  trip$ = this.store.select(DriversSelectors.trip);

  mapData$ = this.store.select(DriversSelectors.trip).pipe(map(trip => TripsBaseComponent.generateMapData(trip)));

  private readonly sub?: Subscription;

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.store
      .select(DriversSelectors.selectedId)
      .pipe(
        takeUntil(this.destroy$),
        tap(driverId => {
          if (driverId) {
            this.store.dispatch(DriversActions.resetTrip());
            this.store
              .select(DriversSelectors.tripsParams)
              .pipe(
                takeUntil(this.destroy$),
                first(),
                takeUntil(this.destroy$),
                tap(tripsParams => {
                  this.paramsGroup.reset({ sort_order: tripsParams.sort_order });

                  this.store.dispatch(
                    DriversActions.fetchTrips({
                      params: {
                        ...tripsParams,
                        page: 1,
                        driver_id: driverId
                      }
                    })
                  );
                })
              )
              .subscribe();
          }
        })
      )
      .subscribe();

    this.paramsGroup.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          return this.store.select(DriversSelectors.selectedId).pipe(
            first(),
            takeUntil(this.destroy$),
            tap(driverId => {
              if (driverId) {
                this.store.dispatch(
                  DriversActions.fetchTrips({
                    params: {
                      ...(params as Pick<TripsParams, 'sort_order'>),
                      page: driversInitialState.tripsParams.page,
                      per_page: driversInitialState.tripsParams.per_page,
                      driver_id: driverId
                    }
                  })
                );
              }
            })
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sub?.unsubscribe();
  }

  handleNextPageRequest(page: number): void {
    this.store.dispatch(DriversActions.fetchTrips({ params: { page } }));
  }

  handleTripClick(trip: TripsElement): void {
    this.store.dispatch(DriversActions.fetchTrip({ id: trip.id }));
  }
}
