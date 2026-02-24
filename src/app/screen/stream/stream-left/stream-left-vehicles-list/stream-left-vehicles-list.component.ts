import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { interval, Observable, of, Subject, Subscription, switchMap } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, first, map, takeUntil } from 'rxjs/operators';
import RouteConst from 'src/app/const/route';
import { StreamActions } from 'src/app/screen/stream/stream.actions';
import { VehiclesElement, VehiclesParams } from 'src/app/screen/stream/stream.model';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';
import { AppState } from 'src/app/store/app-store.model';

@Component({
  selector: 'app-stream-left-vehicles-list',
  templateUrl: './stream-left-vehicles-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamLeftVehiclesListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly subscriptions = new Subscription();

  private readonly pageSize = 500;
  private currentPage = 1;

  readonly orderOptions: SelectControl<VehiclesParams['order']>[] = [
    { value: 'a-z', label: 'A-Z' },
    { value: 'active-first', label: 'Active First' }
  ];

  paramsGroup = this.fb.group<Nullable<Pick<VehiclesParams, 'order'>>>({
    order: 'active-first'
  });

  vehiclesLoading$ = this.store.select(StreamSelectors.vehiclesLoading).pipe(distinctUntilChanged());

  vehicles$: Observable<VehiclesElement[]> = this.store.select(StreamSelectors.vehicles).pipe(
    distinctUntilChanged((prev, curr) => prev?.length === curr?.length && prev?.[0]?.id === curr?.[0]?.id),
    map((vehicles): VehiclesElement[] => {
      if (!vehicles) return [];
      return vehicles.slice(0, this.pageSize * this.currentPage);
    }),
    catchError(() => of([]))
  );

  vehiclesMeta$ = this.store.select(StreamSelectors.vehiclesMeta);

  constructor(private readonly store: Store<AppState>, private readonly fb: FormBuilder, private readonly router: Router) {}

  ngOnInit(): void {
    const paramsSub = this.store
      .select(StreamSelectors.vehiclesParams)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe({
        next: vehiclesParams => {
          this.currentPage = 1;
          this.paramsGroup.reset({ order: vehiclesParams.order }, { emitEvent: false });
        },
        error: (error: unknown) => {
          console.error('Error in vehiclesParams subscription:', error);
        }
      });

    this.subscriptions.add(paramsSub);

    const orderChangeSub = this.paramsGroup.controls.order.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        switchMap(orderValue => {
          if (orderValue === null || orderValue === undefined) {
            return of(null);
          }

          return this.store.select(StreamSelectors.vehiclesParams).pipe(
            first(),
            map(currentParams => ({
              orderValue,
              currentParams
            }))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: result => {
          if (!result) return;

          const { orderValue, currentParams } = result;
          this.currentPage = 1;
          this.store.dispatch(
            StreamActions.fetchVehicles({
              params: {
                ...currentParams,
                order: orderValue as VehiclesParams['order']
              }
            })
          );
        },
        error: (error: unknown) => {
          console.error('Error in order value changes subscription:', error);
        }
      });

    this.subscriptions.add(orderChangeSub);

    const filterWatcherSub = this.store
      .select(StreamSelectors.vehiclesParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (this.refreshSubscription) {
          this.refreshSubscription.unsubscribe();
          this.refreshSubscription = null;
        }

        if (this.isUsingDefaultFilters(params)) {
          this.startRefreshInterval();
        }
      });

    this.subscriptions.add(filterWatcherSub);
  }

  handleVehicleClick = (vehicle: VehiclesElement): void => {
    if (!vehicle?.id) return;
    this.router.navigate(['/', RouteConst.stream, vehicle.id]);
  };

  handleDriverClick = (driver: NonNullable<VehiclesElement['driver']>): void => {
    if (!driver?.id) return;
    this.router.navigate(['/', RouteConst.drivers, driver.id]);
  };

  handlePlaybackClick = (event: Event, vehicle: VehiclesElement): void => {
    if (!event || !vehicle?.id) return;
    event.stopPropagation();

    this.store.dispatch(StreamActions.setLastVisitedTab({ route: RouteConst.stream }));
    sessionStorage.setItem('lastVisitedTab', RouteConst.stream);

    this.router.navigate(['/', RouteConst.playbacks, vehicle.id]);
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  offlineSince(inactiveSince: string): string {
    const inactiveDate = new Date(inactiveSince);
    const currentDate = new Date();
    const diffMs = currentDate.getTime() - inactiveDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes}m`;
      }
      return `${diffHours}h`;
    }

    return `${diffDays}D`;
  }

  private refreshSubscription: Subscription | null = null;

  private isUsingDefaultFilters(params: VehiclesParams): boolean {
    if (params.order !== 'active-first') return false;

    const driverId = String(params.driver_id);
    if (driverId !== 'undefined' && driverId !== 'null' && driverId !== '' && driverId !== '0') {
      return false;
    }

    if (Array.isArray(params.vehicle_id) && params.vehicle_id.length > 0) {
      return false;
    }

    if (params.search) {
      return false;
    }

    return true;
  }

  private startRefreshInterval(): void {
    this.refreshSubscription = interval(10000)
      .pipe(
        filter(() => !document.hidden),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.store.dispatch(StreamActions.fetchVehiclesInBackground());
      });

    this.subscriptions.add(this.refreshSubscription);
  }
}
