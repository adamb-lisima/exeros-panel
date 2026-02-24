import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, shareReplay, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../../util/control';
import { VehiclesParams } from '../../../stream/stream.model';
import { VehiclesActions } from '../../vehicles.actions';

type SearchBy = 'fleet' | 'driver' | 'vehicle';

@Component({
  selector: 'app-vehicles-left-search',
  templateUrl: './vehicles-left-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesLeftSearchComponent implements OnInit, OnDestroy {
  searchBy$ = new BehaviorSubject<SearchBy>('fleet');
  isOpen = false;
  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(
    distinctUntilChanged(),
    map(data => ControlUtil.mapFleetsTreeToTreeControls(data)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private readonly destroy$ = new Subject<void>();

  driverOptions$ = this.store.select(CommonObjectsSelectors.driversTree).pipe(
    distinctUntilChanged(),
    map((drivers): SelectControl[] =>
      drivers.map(driver => ({
        value: driver.id,
        label: `${driver.name}`
      }))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    distinctUntilChanged(),
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-success-500' : undefined
      }))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  searchControl = this.fb.control('');
  private readonly sub: Subscription = new Subscription();

  paramsGroup = this.fb.group<Nullable<Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>>>({
    fleet_id: 1,
    driver_id: undefined,
    vehicle_id: undefined
  });

  private currentSearch: Nullable<Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>> = {
    fleet_id: 1,
    driver_id: undefined,
    vehicle_id: undefined
  };

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {}

  trackByValue = (index: number, item: SelectControl): any => item.value;

  ngOnInit(): void {
    const savedFleetId = localStorage.getItem('exeros-fleet-id');
    if (savedFleetId) {
      const fleetId = parseInt(savedFleetId, 10);
      if (!isNaN(fleetId)) {
        this.paramsGroup.patchValue(
          {
            fleet_id: fleetId
          },
          { emitEvent: false }
        );

        this.currentSearch = {
          ...this.currentSearch,
          fleet_id: fleetId
        };

        this.store.dispatch(
          VehiclesActions.fetchVehicles({
            params: { fleet_id: fleetId }
          })
        );
      }
    }

    this.sub.add(
      this.paramsGroup.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
          tap(params => {
            if (!params) return;

            if (params.fleet_id !== undefined) {
              localStorage.setItem('exeros-fleet-id', String(params.fleet_id ?? ''));
            }

            if (this.currentSearch.fleet_id !== params.fleet_id) {
              requestAnimationFrame(() => {
                this.store.dispatch(VehiclesActions.fetchVehicles({ params: { fleet_id: params.fleet_id! } }));
              });
            }
            const currentSearch = params as Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>;
            this.store.dispatch(VehiclesActions.fetchVehicles({ params: { ...currentSearch } }));
            this.currentSearch = currentSearch;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetFilters(): void {
    this.paramsGroup.patchValue({
      fleet_id: 1,
      driver_id: undefined,
      vehicle_id: undefined
    });
    this.isOpen = false;
  }
}
