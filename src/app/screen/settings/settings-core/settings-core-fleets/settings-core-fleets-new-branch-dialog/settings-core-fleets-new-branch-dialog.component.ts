import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounceTime, filter, first, map, Observable, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FleetsTreeElement } from 'src/app/store/common-objects/common-objects.model';
import { ConfigSelectors } from 'src/app/store/config/config.selectors';
import { SelectControl } from '../../../../../shared/component/control/select-control/select-control.model';
import { CommonObjectsSelectors } from '../../../../../store/common-objects/common-objects.selectors';
import { EventType } from '../../../../../store/config/config.model';
import ControlUtil from '../../../../../util/control';
import { waitOnceForAction } from '../../../../../util/operators';
import { SettingsActions } from '../../../settings.actions';
import { CreateFleetBody, CreateVehicleBody } from '../../../settings.model';

export type EditFleetData =
  | {
      type: 'create';
      parentId: number | undefined;
    }
  | {
      type: 'edit';
      fleet: FleetsTreeElement;
    };

interface VehicleChecked {
  id: number;
  fleetName: string;
  registrationPlate: string;
  brand: string;
  model: string;
  checked: boolean;
}

type DataModel = {
  [key in string]: number | undefined;
};

@Component({
  templateUrl: './settings-core-fleets-new-branch-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreFleetsNewBranchDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly sub = new Subscription();

  searchControl = this.fb.control('');
  configData$ = this.store.select(ConfigSelectors.data);

  phasesOptions$: Observable<SelectControl<string>[]> = this.configData$.pipe(
    map(configData => {
      return (
        configData?.available_fleet_phases?.map(phase => ({
          value: phase,
          label: phase
        })) ?? []
      );
    })
  );

  driverModeOptions: SelectControl<CreateVehicleBody['driver_mode']>[] = [
    { value: 'Disabled', label: 'Disabled' },
    { value: 'Enabled', label: 'Enabled' }
  ];

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(data => ControlUtil.mapFleetsTreeToTreeControls(data)));
  bodyGroup = this.fb.group({
    name: '',
    fleet_id: 0,
    phase: '',
    custom_event_types: this.fb.control<string[]>([]),
    speeding_event_cooldown_minutes: this.fb.control<number>(30),
    speeding_event_percentage_trigger: this.fb.control<number>(10),
    driver_mode: this.fb.control<string | null>(null)
  });

  eventForm = this.fb.group<DataModel>({});

  eventTypes: EventType[] = [];
  customEventTypes: SelectControl<string>[] = [];

  allVehicles: boolean | null = false;
  tempVehicles: VehicleChecked[] = [];
  vehicles: VehicleChecked[] = [];

  title = '';
  isOpen = false;

  constructor(@Inject(DIALOG_DATA) public data: EditFleetData, private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.data.type === 'create') {
      this.title = 'Create new fleet';
      this.bodyGroup.patchValue({
        fleet_id: this.data.parentId
      });
    } else {
      this.title = 'Edit fleet';
      this.bodyGroup.patchValue({
        name: this.data.fleet.name,
        fleet_id: this.data.fleet.parent_id,
        phase: this.data.fleet.phase,
        custom_event_types: this.data.fleet.custom_event_types,
        speeding_event_cooldown_minutes: this.data.fleet.settings.speeding_event_cooldown_minutes,
        speeding_event_percentage_trigger: this.data.fleet.settings.speeding_event_percentage_trigger,
        driver_mode: this.data.fleet.driver_mode
      });
    }

    this.sub.add(
      this.store
        .select(ConfigSelectors.data)
        .pipe(
          first(),
          takeUntil(this.destroy$),
          map(data => ({
            eventTypes: data?.event_types,
            customEventTypes: data?.custom_event_types
          })),
          tap(({ eventTypes, customEventTypes }) => {
            if (eventTypes) {
              const eventsMap = new Map<string, number>();

              if (this.data.type === 'edit') {
                this.data.fleet.event_camera_channel_priorities.forEach(event => {
                  eventsMap.set(event.event_type, event.default_camera_channel);
                });
              }

              this.eventTypes = eventTypes;

              const form: DataModel = eventTypes
                .map(event => {
                  const value = eventsMap.get(event.default_name) ?? 0;
                  return { [event.default_name]: value };
                })
                .reduce((prev, curr) => ({ ...prev, ...curr }), {});

              this.eventForm = this.fb.group({
                ...form
              });
            }
            if (customEventTypes) {
              this.customEventTypes = customEventTypes.map(event => ({
                label: event.name,
                value: event.name
              }));
            }
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(CommonObjectsSelectors.vehiclesTree)
        .pipe(
          takeUntil(this.destroy$),
          tap(vehiclesTree => {
            const vehicles = this.data.type === 'edit' ? this.data.fleet.vehicles?.map(vehicle => vehicle.id) : [];

            this.vehicles = vehiclesTree.map(vehicle => ({
              id: vehicle.id,
              fleetName: vehicle.fleet_name ?? '',
              brand: vehicle.brand_name ?? '',
              model: vehicle.model_name ?? '',
              registrationPlate: vehicle.registration_plate,
              checked: vehicles?.includes(vehicle.id) ?? false
            }));
            this.allVehicles = this.checkAllVehicles(this.vehicles);
            this.tempVehicles = this.getTempVehicles('', this.vehicles);
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.searchControl.valueChanges
        .pipe(
          filter((value): value is string => value != null),
          debounceTime(200),
          takeUntil(this.destroy$),
          tap(value => {
            this.tempVehicles = this.getTempVehicles(value, this.vehicles);
            this.cdr.detectChanges();
          })
        )
        .subscribe()
    );

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sub.unsubscribe();
  }

  handleFleetCreateClick() {
    this.store.dispatch(SettingsActions.createFleet({ body: this.getBody() }));
    this.sub.add(
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.createFleetSuccess]),
          takeUntil(this.destroy$),
          tap(() => this.store.dispatch(SettingsActions.fetchFleetsTree({ params: { show_vehicles: true, with_profiles: false } }))),
          tap(() => this.dialogRef.close())
        )
        .subscribe()
    );
  }

  handleEditFleetClick(id: number) {
    this.store.dispatch(SettingsActions.updateFleet({ id, body: this.getBody() }));
    this.sub.add(
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.updateFleetSuccess]),
          takeUntil(this.destroy$),
          tap(() => this.store.dispatch(SettingsActions.fetchFleetsTree({ params: { show_vehicles: true, with_profiles: false } }))),
          tap(() => this.dialogRef.close())
        )
        .subscribe()
    );
  }

  private getTempVehicles(searchValue: string, vehicles: VehicleChecked[]): VehicleChecked[] {
    return this.getFilteredVehicles(searchValue, vehicles).sort(this.sortVehicles);
  }

  handleCheckboxChange(value: boolean, id: number): void {
    const vehicles = [...this.vehicles];
    const vehicle = vehicles.find(vehicle => vehicle.id === id)!;
    vehicle.checked = value;
    this.allVehicles = this.checkAllVehicles(vehicles);
    this.vehicles = vehicles;
    const searchValue = this.searchControl.value ?? '';
    this.tempVehicles = this.getTempVehicles(searchValue, vehicles);
    this.cdr.detectChanges();
  }

  handleAllVehiclesClick(value: boolean) {
    this.allVehicles = value;
    const vehicles = this.vehicles.map(vehicle => ({ ...vehicle, checked: value }));
    this.vehicles = vehicles;
    const searchValue = this.searchControl.value ?? '';
    this.tempVehicles = this.getTempVehicles(searchValue, vehicles);
    this.cdr.detectChanges();
  }

  private getFilteredVehicles(searchValue: string, vehicles: VehicleChecked[]) {
    if (searchValue != '') {
      const search = searchValue.toLowerCase();
      return vehicles.filter(vehicle => {
        const name = vehicle.brand + ' ' + vehicle.model;
        return name.toLowerCase().includes(search) || vehicle.registrationPlate.toLowerCase().includes(search);
      });
    }
    return vehicles;
  }

  private readonly sortVehicles = (u1: VehicleChecked, u2: VehicleChecked) => {
    if (!u1.checked && u2.checked) {
      return 1;
    }
    if (u1.checked && !u2.checked) {
      return -1;
    }
    return u1.registrationPlate.localeCompare(u2.registrationPlate);
  };

  private checkAllVehicles(vehicles: VehicleChecked[]): boolean | null {
    const allCheck = vehicles.every(vehicle => vehicle.checked);
    const someCheck = vehicles.some(vehicle => vehicle.checked);

    if (allCheck) {
      return true;
    }
    if (someCheck) {
      return null;
    }
    return false;
  }

  private getBody(): CreateFleetBody {
    const form = this.bodyGroup.value!;
    const vehiclesIds = this.vehicles.filter(vehicle => vehicle.checked).map(vehicle => vehicle.id);
    const events = Object.entries(this.eventForm.value)
      .map(([key, value]) => ({ [key]: value ?? 0 }))
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});
    return <CreateFleetBody>{
      name: form.name!,
      phase: form.phase!,
      parent_id: form.fleet_id!.toString(),
      vehicle_ids: vehiclesIds,
      eventTypes: events,
      custom_event_types: form.custom_event_types!,
      settings: {
        speeding_event_cooldown_minutes: form.speeding_event_cooldown_minutes!,
        speeding_event_percentage_trigger: form.speeding_event_percentage_trigger!
      },
      driver_mode: form.driver_mode
    };
  }
}
