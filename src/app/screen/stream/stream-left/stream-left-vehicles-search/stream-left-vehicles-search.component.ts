import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, first, map, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StreamActions } from 'src/app/screen/stream/stream.actions';
import { VehiclesParams } from 'src/app/screen/stream/stream.model';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { AppState } from 'src/app/store/app-store.model';
import ControlUtil from 'src/app/util/control';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';

@Component({
  selector: 'app-stream-left-vehicles-search',
  templateUrl: './stream-left-vehicles-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamLeftVehiclesSearchComponent implements OnInit, OnDestroy {
  isOpen = false;

  vehicleSearch$ = new BehaviorSubject<string>('');
  private readonly destroy$ = new Subject<void>();

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(
    distinctUntilChanged(),
    map(data => ControlUtil.mapFleetsTreeToTreeControls(data))
  );

  driverOptions$ = this.store.select(CommonObjectsSelectors.driversTree).pipe(
    distinctUntilChanged(),
    map((drivers): SelectControl[] =>
      drivers.map(driver => ({
        value: driver.id,
        label: `${driver.name}`
      }))
    )
  );

  private readonly vehicleOptionsCache = new Map<string, SelectControl[]>();

  filteredVehicleOptions$ = combineLatest([this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(distinctUntilChanged((prev, curr) => prev?.length === curr?.length)), this.vehicleSearch$.pipe(debounceTime(200), distinctUntilChanged())]).pipe(
    map(([vehicles, search]) => {
      if (!vehicles?.length) return [];

      const cacheKey = search ?? 'all';
      const cached = this.vehicleOptionsCache.get(cacheKey);
      if (cached) return cached;

      let result: SelectControl[];
      const searchLower = search?.toLowerCase();

      if (searchLower) {
        result = vehicles.filter(v => v.registration_plate.toLowerCase().includes(searchLower)).map(this.mapVehicleToOption);
      } else {
        result = vehicles.map(this.mapVehicleToOption);
      }

      this.vehicleOptionsCache.set(cacheKey, result);
      return result;
    })
  );

  paramsGroup = this.fb.group<Nullable<Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>>>({
    fleet_id: undefined,
    driver_id: undefined,
    vehicle_id: undefined
  });

  private currentSearch: Nullable<Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>> = {
    fleet_id: undefined,
    driver_id: undefined,
    vehicle_id: undefined
  };

  private readonly sub = new Subscription();
  private savedFleetIdFromLocalStorage: number | undefined;

  constructor(private readonly store: Store<AppState>, private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadSavedFleetId();
    this.initializeParams();
    this.initializeSubscriptions();
  }

  private loadSavedFleetId(): void {
    const savedFleetId = localStorage.getItem('exeros-fleet-id');
    if (savedFleetId) {
      const fleetId = parseInt(savedFleetId, 10);
      if (!isNaN(fleetId)) {
        this.savedFleetIdFromLocalStorage = fleetId;
        this.currentSearch = {
          ...this.currentSearch,
          fleet_id: fleetId
        };
      }
    }
  }

  private initializeParams(): void {
    const paramsSub = this.store
      .select(StreamSelectors.vehiclesParams)
      .pipe(
        first(),
        catchError((error: unknown) => {
          console.error('Error initializing params:', error);
          return [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: vehiclesParams => {
          const fleetId = this.savedFleetIdFromLocalStorage ?? vehiclesParams.fleet_id;

          this.paramsGroup.reset(
            {
              fleet_id: fleetId,
              driver_id: vehiclesParams.driver_id,
              vehicle_id: vehiclesParams.vehicle_id
            },
            { emitEvent: false }
          );

          this.currentSearch = {
            fleet_id: fleetId,
            driver_id: vehiclesParams.driver_id,
            vehicle_id: vehiclesParams.vehicle_id
          };

          if (this.savedFleetIdFromLocalStorage) {
            this.store.dispatch(
              StreamActions.fetchVehicles({
                params: { fleet_id: this.savedFleetIdFromLocalStorage }
              })
            );
          }
        },
        error: (error: unknown) => {
          console.error('Error in vehiclesParams subscription:', error);
        }
      });

    this.sub.add(paramsSub);
  }

  private initializeSubscriptions(): void {
    const valueChangesSub = this.paramsGroup.valueChanges
      .pipe(
        catchError((error: unknown) => {
          console.error('Error in params group value changes:', error);
          return [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: params => {
          if (!params) return;

          requestAnimationFrame(() => {
            const currentSearch = params as Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>;

            if (params.fleet_id !== undefined) {
              localStorage.setItem('exeros-fleet-id', String(params.fleet_id ?? ''));
            }

            if (params.fleet_id !== this.currentSearch.fleet_id) {
              this.store.dispatch(
                StreamActions.fetchMapVehicles({
                  params: { fleet_id: params.fleet_id! }
                })
              );
            }
            const searchParams = {
              ...currentSearch,
              _t: Date.now()
            };
            this.store.dispatch(
              StreamActions.fetchVehicles({
                params: searchParams
              })
            );
            this.currentSearch = { ...currentSearch };
          });
        },
        error: (error: unknown) => {
          console.error('Error in paramsGroup subscription:', error);
        }
      });

    this.sub.add(valueChangesSub);
  }

  private mapVehicleToOption(vehicle: any): SelectControl {
    return {
      value: vehicle.id,
      label: vehicle.registration_plate,
      colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
    };
  }
  ngOnDestroy(): void {
    this.vehicleSearch$.complete();
    this.vehicleOptionsCache.clear();
    this.sub.unsubscribe();
  }
}
