import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first, map, Subject, Subscription, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { TripsBaseComponent } from '../../../../shared/component/dialog/trips-base/trips-base.component';
import { VehiclesActions } from '../../vehicles.actions';
import { TripsElement, TripsParams } from '../../vehicles.model';
import { vehiclesInitialState } from '../../vehicles.reducer';
import { VehiclesSelectors } from '../../vehicles.selectors';

@Component({
  selector: 'app-vehicles-core-trips',
  templateUrl: './vehicles-core-trips.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreTripsComponent implements OnInit, OnDestroy {
  readonly sortOrderOptions: SelectControl<TripsParams['sort_order']>[] = [
    { value: 'ASC', label: 'ASC' },
    { value: 'DESC', label: 'DESC' }
  ];
  paramsGroup = this.fb.group<Nullable<Pick<TripsParams, 'sort_order'>>>({
    sort_order: undefined
  });
  trips$ = this.store.select(VehiclesSelectors.trips);
  tripsMeta$ = this.store.select(VehiclesSelectors.tripsMeta);
  tripsLoading$ = this.store.select(VehiclesSelectors.tripsLoading);
  tripLoading$ = this.store.select(VehiclesSelectors.tripLoading);
  trip$ = this.store.select(VehiclesSelectors.trip);
  mapData$ = this.store.select(VehiclesSelectors.trip).pipe(map(trip => TripsBaseComponent.generateMapData(trip)));

  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.store
      .select(VehiclesSelectors.selectedId)
      .pipe(
        takeUntil(this.destroy$),
        tap(vehicleId => {
          if (vehicleId) {
            this.store.dispatch(VehiclesActions.resetTrip());

            this.store
              .select(VehiclesSelectors.tripsParams)
              .pipe(
                first(),
                takeUntil(this.destroy$),
                tap(tripsParams => {
                  this.paramsGroup.reset({ sort_order: tripsParams.sort_order });

                  this.store.dispatch(
                    VehiclesActions.fetchTrips({
                      params: {
                        ...tripsParams,
                        vehicle_id: vehicleId,
                        page: 1
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
          return this.store.select(VehiclesSelectors.selectedId).pipe(
            first(),
            takeUntil(this.destroy$),
            tap(vehicleId => {
              if (vehicleId) {
                this.store.dispatch(
                  VehiclesActions.fetchTrips({
                    params: {
                      ...(params as Pick<TripsParams, 'sort_order'>),
                      page: vehiclesInitialState.tripsParams.page,
                      per_page: vehiclesInitialState.tripsParams.per_page,
                      vehicle_id: vehicleId
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
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleNextPageRequest(page: TripsParams['page']): void {
    this.store.dispatch(VehiclesActions.fetchTrips({ params: { page } }));
  }

  handleTripClick(trip: TripsElement): void {
    this.store.dispatch(VehiclesActions.fetchTrip({ id: trip.id }));
  }
}
