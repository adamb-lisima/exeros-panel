import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, shareReplay, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../../util/control';

import { VehiclesParams } from '../../../stream/stream.model';
import { DriversActions } from '../../drivers.actions';
import { DriversParams } from '../../drivers.model';

type SearchBy = 'fleet' | 'driver' | 'vehicle';

@Component({
  selector: 'app-drivers-left-search',
  templateUrl: './drivers-left-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversLeftSearchComponent implements OnInit, OnDestroy {
  isOpen = false;
  searchBy$ = new BehaviorSubject<SearchBy>('driver');

  private readonly destroy$ = new Subject<void>();

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(
    distinctUntilChanged(),
    map(data => {
      return ControlUtil.mapFleetsTreeToTreeControls(data);
    }),
    shareReplay(1)
  );

  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    distinctUntilChanged(),
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
      }))
    ),
    shareReplay(1)
  );

  driverOptions$ = this.store.select(CommonObjectsSelectors.driversTree).pipe(
    distinctUntilChanged(),
    map((drivers): SelectControl[] =>
      drivers.map(driver => ({
        value: driver.id,
        label: `${driver.name}`
      }))
    ),
    shareReplay(1)
  );

  paramsGroup = this.fb.group<Nullable<Pick<DriversParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>>>({
    fleet_id: 1,
    driver_id: undefined,
    vehicle_id: undefined
  });

  private readonly defaultParams: Omit<DriversParams, 'fleet_id' | 'driver_id' | 'vehicle_id'> = {
    search: '',
    order: 'a-z'
  };

  private currentSearch: Nullable<Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>> = {
    fleet_id: 1,
    driver_id: undefined,
    vehicle_id: undefined
  };

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {}

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
          DriversActions.fetchDrivers({
            params: {
              ...this.defaultParams,
              fleet_id: fleetId,
              vehicle_id: []
            }
          })
        );
      }
    }

    this.paramsGroup.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => {
          const result = isEqual(prev, curr);
          return result;
        }),
        tap(params => {
          const fleetId = params.fleet_id === null ? undefined : params.fleet_id;
          const driverId = params.driver_id === null ? undefined : params.driver_id;
          const vehicleId = params.vehicle_id === null ? undefined : params.vehicle_id;

          if (fleetId !== undefined) {
            localStorage.setItem('exeros-fleet-id', String(fleetId));
          }

          if (this.currentSearch.fleet_id !== fleetId && fleetId) {
            requestAnimationFrame(() => {
              this.store.dispatch(
                DriversActions.fetchDrivers({
                  params: {
                    ...this.defaultParams,
                    fleet_id: fleetId,
                    vehicle_id: []
                  }
                })
              );
            });
          }

          const searchParams: Partial<DriversParams> = {
            ...this.defaultParams,
            fleet_id: fleetId,
            driver_id: driverId,
            vehicle_id: vehicleId ?? []
          };

          if (searchParams.fleet_id) {
            this.store.dispatch(DriversActions.fetchDrivers({ params: searchParams }));

            this.currentSearch = {
              fleet_id: fleetId,
              driver_id: driverId,
              vehicle_id: vehicleId
            };
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
