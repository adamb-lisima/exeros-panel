import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, first, map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from '../../../../../shared/component/control/select-control/select-control.model';
import { CommonObjectsActions } from '../../../../../store/common-objects/common-objects.actions';
import { CommonObjectsSelectors } from '../../../../../store/common-objects/common-objects.selectors';
import { waitOnceForAction } from '../../../../../util/operators';
import { StreamSelectors } from '../../../../stream/stream.selectors';
import { SettingsActions } from '../../../settings.actions';
import { AddVehicleBody } from '../../../settings.model';

interface VehicleParams {
  vehicle_id?: number | null | undefined;
}

@Component({
  selector: 'app-settings-core-driver-add-vehicle-dialog',
  templateUrl: './settings-core-driver-add-vehicle-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreDriverAddVehicleDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  vehicleSearch$ = new BehaviorSubject<string>('');
  private currentVehicleParams: VehicleParams | null = null;

  paramsGroup = this.fb.nonNullable.group<VehicleParams>({
    vehicle_id: null
  });

  private readonly vehicleOptionsCache = new Map<string, SelectControl[]>();

  filteredVehicleOptions$ = combineLatest([this.store.select(CommonObjectsSelectors.vehiclesTreeWithDriver).pipe(distinctUntilChanged((prev, curr) => prev?.length === curr?.length)), this.vehicleSearch$.pipe(debounceTime(200), distinctUntilChanged())]).pipe(
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

  constructor(private readonly fb: FormBuilder, private readonly actions$: Actions, private readonly store: Store, private readonly dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: { id: number; vehicle_id: number }) {}

  handleVehicleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.vehicleOptionsCache.clear();
    this.vehicleSearch$.next(target.value);
  }

  handleAddVehicleClick(): void {
    this.store.dispatch(SettingsActions.addVehicle({ id: this.data.id, body: this.paramsGroup.value as AddVehicleBody }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.addVehicleSuccess]),
        tap(() => this.paramsGroup.reset()),
        tap(() => this.store.dispatch(SettingsActions.fetchDriverResponse({ params: {} }))),
        tap(() => this.dialogRef.close()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private mapVehicleToOption(vehicle: any): SelectControl {
    return {
      value: vehicle.id,
      label: vehicle.registration_plate + (vehicle.driver ? ' (Assigned to ' + vehicle.driver.name + ')' : ''),
      colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
    };
  }

  ngOnInit(): void {
    this.store.dispatch(CommonObjectsActions.fetchVehiclesTreeWithDriver({ id: this.data.id }));
    this.initializeParams();
    this.initializeSubscriptions();
  }
  private initializeParams(): void {
    this.store
      .select(StreamSelectors.vehiclesParams)
      .pipe(first(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.paramsGroup.reset(
          {
            vehicle_id: this.data.vehicle_id
          },
          { emitEvent: false }
        );

        this.currentVehicleParams = {
          vehicle_id: this.data.vehicle_id
        };
      });
  }

  private initializeSubscriptions(): void {
    this.paramsGroup.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(params => {
        if (!params) return;
      });
  }

  ngOnDestroy(): void {
    this.vehicleSearch$.complete();
    this.vehicleOptionsCache.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
