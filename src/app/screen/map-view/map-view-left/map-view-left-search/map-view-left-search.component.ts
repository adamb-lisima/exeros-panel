import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, filter, first, map, of, Subject, Subscription, switchMap, take } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../store/app-store.model';
import { CommonObjectsActions } from '../../../../store/common-objects/common-objects.actions';
import { MapVehiclesParams } from '../../../../store/common-objects/common-objects.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../../util/control';
import { StreamActions } from '../../../stream/stream.actions';
import { VehiclesParams } from '../../../stream/stream.model';
import { StreamSelectors } from '../../../stream/stream.selectors';
import { StreamService } from '../../../stream/stream.service';

@Component({
  selector: 'app-map-view-left-search',
  templateUrl: './map-view-left-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewLeftSearchComponent implements OnInit, OnDestroy {
  @ViewChild('locationSelect') locationSelect!: MatSelect;
  private readonly destroy$ = new Subject<void>();

  locationValue: any = null;
  locationSearch: string = '';
  locationOptions: { display_name: string; latitude: string; longitude: string }[] = [];
  private readonly locationSearchSubject = new Subject<string>();

  isOpen = false;

  vehicleSearch$ = new BehaviorSubject<string>('');

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

  constructor(private readonly store: Store<AppState>, private readonly fb: FormBuilder, private readonly streamService: StreamService) {}

  ngOnInit(): void {
    this.loadSavedFleetId();
    this.initializeParams();
    this.initializeSubscriptions();
    this.initializeLocationSearch();
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
    this.store
      .select(StreamSelectors.vehiclesParams)
      .pipe(first(), takeUntil(this.destroy$))
      .subscribe(vehiclesParams => {
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

        const mapFilterParams = {} as Partial<MapVehiclesParams>;

        if (fleetId !== undefined && fleetId !== null) {
          mapFilterParams.fleet_id = fleetId;
        }

        if (vehiclesParams.driver_id !== undefined && vehiclesParams.driver_id !== null) {
          mapFilterParams.driver_id = vehiclesParams.driver_id;
        }

        if (vehiclesParams.vehicle_id !== undefined && vehiclesParams.vehicle_id !== null) {
          mapFilterParams.vehicle_id = vehiclesParams.vehicle_id as number[];
        }

        this.store
          .select(StreamSelectors.mapTimeRange)
          .pipe(take(1), takeUntil(this.destroy$))
          .subscribe(timeRange => {
            const initialMapParams: any = {};

            if (fleetId !== undefined && fleetId !== null) {
              initialMapParams.fleet_id = fleetId;
            }

            if (timeRange.from && timeRange.to) {
              initialMapParams.from = timeRange.from;
              initialMapParams.to = timeRange.to;
            }

            this.store.dispatch(
              CommonObjectsActions.fetchMapVehicles({
                params: initialMapParams
              })
            );

            this.store.dispatch(
              StreamActions.setMapFilterParams({
                params: mapFilterParams
              })
            );
          });

        if (this.savedFleetIdFromLocalStorage) {
          this.store
            .select(StreamSelectors.mapTimeRange)
            .pipe(take(1), takeUntil(this.destroy$))
            .subscribe(timeRange => {
              const vehicleParams: any = {
                fleet_id: this.savedFleetIdFromLocalStorage
              };

              if (timeRange.from && timeRange.to) {
                vehicleParams.from = timeRange.from;
                vehicleParams.to = timeRange.to;
              }

              this.store.dispatch(
                StreamActions.fetchVehicles({
                  params: vehicleParams
                })
              );
            });
        }
      });
  }

  private initializeSubscriptions(): void {
    this.paramsGroup.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter(params => !!params),
        switchMap(params => {
          if (params.fleet_id !== undefined) {
            localStorage.setItem('exeros-fleet-id', String(params.fleet_id ?? ''));
          }

          return combineLatest([of(params), this.store.select(StreamSelectors.mapFilterParams).pipe(take(1)), this.store.select(StreamSelectors.mapTimeRange).pipe(take(1))]);
        })
      )
      .subscribe(([formParams, currentMapFilterParams, timeRange]) => {
        const mapFilterParams = this.createMapFilterParams(formParams as Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>, timeRange, currentMapFilterParams.polygon);

        this.dispatchSetMapFilterParams(mapFilterParams);

        const currentSearch = formParams as Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>;
        const filtersChanged = this.haveFiltersChanged(currentSearch);

        if (filtersChanged) {
          this.dispatchFetchMapVehicles(mapFilterParams, timeRange);
        }

        this.currentSearch = { ...currentSearch };
      });
  }

  private createMapFilterParams(params: Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>, timeRange: { from: string | null; to: string | null }, currentPolygon?: any): Partial<MapVehiclesParams> {
    const mapFilterParams = {} as Partial<MapVehiclesParams>;

    if (params.fleet_id !== undefined && params.fleet_id !== null) {
      mapFilterParams.fleet_id = params.fleet_id;
    }

    if (params.driver_id !== undefined && params.driver_id !== null) {
      mapFilterParams.driver_id = params.driver_id;
    }

    if (params.vehicle_id !== undefined && params.vehicle_id !== null) {
      mapFilterParams.vehicle_id = params.vehicle_id as number[];
    }

    if (timeRange.from && timeRange.to) {
      mapFilterParams.from = timeRange.from;
      mapFilterParams.to = timeRange.to;
    }

    if (currentPolygon && Array.isArray(currentPolygon) && currentPolygon.length > 0) {
      mapFilterParams.polygon = currentPolygon;
    }

    return mapFilterParams;
  }

  private dispatchSetMapFilterParams(params: Partial<MapVehiclesParams>): void {
    this.store.dispatch(
      StreamActions.setMapFilterParams({
        params: params
      })
    );
  }

  private haveFiltersChanged(newSearch: Pick<VehiclesParams, 'fleet_id' | 'driver_id' | 'vehicle_id'>): boolean {
    return newSearch.fleet_id !== this.currentSearch.fleet_id || newSearch.driver_id !== this.currentSearch.driver_id || newSearch.vehicle_id !== this.currentSearch.vehicle_id;
  }

  private dispatchFetchMapVehicles(filterParams: Partial<MapVehiclesParams>, timeRange: { from: string | null; to: string | null }): void {
    const apiParams: any = {};

    if (filterParams.fleet_id !== undefined) {
      apiParams.fleet_id = filterParams.fleet_id;
    }

    if (filterParams.driver_id !== undefined) {
      apiParams.driver_id = filterParams.driver_id;
    }

    if (filterParams.vehicle_id !== undefined) {
      apiParams.vehicle_id = filterParams.vehicle_id;
    }

    if (timeRange.from && timeRange.to) {
      apiParams.from = timeRange.from;
      apiParams.to = timeRange.to;
    }

    if (filterParams.polygon && Array.isArray(filterParams.polygon) && filterParams.polygon.length > 0) {
      apiParams.polygon = JSON.stringify(filterParams.polygon);
    }

    this.store.dispatch(
      CommonObjectsActions.fetchMapVehicles({
        params: apiParams
      })
    );
  }

  private mapVehicleToOption(vehicle: any): SelectControl {
    return {
      value: vehicle.id,
      label: vehicle.registration_plate,
      colorClass: vehicle.status === 'Active' ? 'text-success-500' : undefined
    };
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.vehicleSearch$.complete();
    this.locationSearchSubject.complete();
    this.vehicleOptionsCache.clear();
    this.sub.unsubscribe();
  }

  handleLocationClearClick(event: MouseEvent): void {
    this.store.dispatch(StreamActions.resetMapLocation());

    this.locationValue = null;
    this.locationSearch = '';
    this.locationOptions = [];

    event.stopPropagation();
  }

  handleLocationModelChange(value: any) {
    this.locationValue = value;

    const selectedOption = this.locationOptions.find(option => option.display_name === value);

    if (selectedOption) {
      this.store.dispatch(
        StreamActions.setMapLocation({
          location: {
            latitude: parseFloat(selectedOption.latitude),
            longitude: parseFloat(selectedOption.longitude),
            displayName: selectedOption.display_name,
            zoom: 15
          }
        })
      );
    }
  }

  private initializeLocationSearch(): void {
    this.locationSearchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(search => !search || search.length >= 3),
        switchMap(search => {
          return search ? this.streamService.searchLocation(search) : of({ data: [] });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        results => {
          if (results?.data) {
            this.locationOptions = results.data.map((item: any) => ({
              display_name: item.display_name,
              latitude: item.latitude,
              longitude: item.longitude
            }));
          } else {
            this.locationOptions = [];
          }
          this.forceOpenLocationDropdown();
        },
        error => console.error('Error in location search:', error)
      );
  }

  handleLocationSearchChange(searchValue: string) {
    this.locationSearch = searchValue;
    this.locationSearchSubject.next(searchValue);
  }

  forceOpenLocationDropdown() {
    if (this.locationSelect) {
      setTimeout(() => this.locationSelect.open(), 0);
    }
  }

  trackByLocationValue(index: number, option: any) {
    return option.latitude + ',' + option.longitude;
  }
}
