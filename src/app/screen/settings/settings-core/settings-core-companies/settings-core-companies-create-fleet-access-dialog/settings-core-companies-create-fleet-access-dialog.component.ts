import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounceTime, filter, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FleetsTreeCamera, FleetsTreeElement, FleetsTreeVehicle } from 'src/app/store/common-objects/common-objects.model';
import MapUtil from 'src/app/util/map';
import { waitOnceForAction } from '../../../../../util/operators';
import { SettingsActions } from '../../../settings.actions';
import { CreateUpdateFleetAccess, FleetAccess } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';

export type EditFleetAccessData =
  | { companyName: string; companyId: number } & (
      | {
          type: 'create';
        }
      | {
          type: 'edit';
          fleet: FleetAccess;
        }
    );

type CheckStatus = boolean | null;

export type FleetCheckbox = Omit<FleetsTreeElement, 'vehicles' | 'children'> & { checked: boolean | null; vehicles: VehicleCheckbox[]; children: FleetCheckbox[] };
type VehicleCheckbox = FleetsTreeVehicle & { checked: boolean; camerasCheckBox: CameraCheckBox[] };
type CameraCheckBox = FleetsTreeCamera & { checked: boolean };

const CENTER = 1;

@Component({
  templateUrl: './settings-core-companies-create-fleet-access-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreCompaniesCreateFleetAccessDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly sub = new Subscription();
  searchControl = this.fb.control('');
  bodyGroup = this.fb.group({
    companyName: this.fb.control({ value: this.data.companyName, disabled: true }),
    name: ['', Validators.required]
  });
  title = '';
  button = '';
  allFleets: CheckStatus = false;

  tempFleets: FleetCheckbox[] = [];
  fleets: FleetCheckbox[] = [];

  constructor(private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: EditFleetAccessData, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef) {
    this.store.dispatch(SettingsActions.fetchFleetsTree({ params: { with_profiles: false, fleet_ids: undefined, show_vehicles: true, company_id: this.data.companyId } }));
    if (this.data?.type === 'create') {
      this.title = 'Create new fleet access';
      this.button = 'Add fleet access';
    } else {
      this.title = 'Edit fleet access';
      this.button = 'Save';
      this.bodyGroup.patchValue({ name: this.data.fleet.name });
      this.store.dispatch(SettingsActions.fetchFleetAccess({ params: { company_id: this.data.companyId, page: 1, per_page: 100 } }));
      this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));
    }
  }

  ngOnInit(): void {
    const isEditMode = (data: EditFleetAccessData): data is { companyName: string; companyId: number; type: 'edit'; fleet: FleetAccess } => {
      return data.type === 'edit';
    };

    if (isEditMode(this.data)) {
      const fleetId = this.data.fleet.id;
      this.sub.add(
        this.store
          .select(SettingsSelectors.fleetAccess)
          .pipe(
            takeUntil(this.destroy$),
            tap(fleetAccess => {
              if (fleetAccess && isEditMode(this.data)) {
                const updatedFleet = fleetAccess.find(fa => fa.id === fleetId);
                if (updatedFleet) {
                  this.data = {
                    companyName: this.data.companyName,
                    companyId: this.data.companyId,
                    type: 'edit',
                    fleet: updatedFleet
                  };

                  this.store.dispatch(
                    SettingsActions.fetchFleetsTree({
                      params: {
                        with_profiles: false,
                        fleet_ids: undefined,
                        show_vehicles: true,
                        company_id: this.data.companyId
                      }
                    })
                  );
                }
              }
            })
          )
          .subscribe()
      );
    }

    this.sub.add(
      this.store
        .select(SettingsSelectors.fleetsTree)
        .pipe(
          takeUntil(this.destroy$),
          tap(fleetOptions => {
            const checkedFleets: number[] = [];
            const checkedVehicles: number[] = [];
            const checkedCameraChannels: number[] = [];
            if (this.data.type === 'edit') {
              this.data.fleet.company_fleet_access_items.forEach(access => {
                if (access.fleet_id) {
                  checkedFleets.push(access.fleet_id);
                }
                if (access.vehicle_id) {
                  checkedVehicles.push(access.vehicle_id);
                }
              });
              this.data.fleet.company_fleet_access_camera_channels?.forEach(access => {
                checkedCameraChannels.push(access.camera_channel_id);
              });
            }
            const mappedFleets = fleetOptions.map(fleet => this.fleetMapper(fleet, checkedVehicles, checkedFleets, checkedCameraChannels)) ?? [];
            this.fleets = this.checkTree(mappedFleets);
            this.allFleets = this.checkAllFleets(this.fleets);
            this.tempFleets = this.getTempFleets('', this.fleets);
            this.cdr.detectChanges();
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
            this.tempFleets = this.getTempFleets(value, this.fleets);
            this.cdr.detectChanges();
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  handleCheckboxChange(value: boolean, fleetId: number, vehicleId?: number, cameraId?: number) {
    const fleets = [...this.fleets];
    const fleet = this.searchTree(fleets[0], fleetId);

    if (fleet == null) {
      return;
    }

    if (vehicleId) {
      const vehicle = fleet.vehicles.find(vehicle => vehicle.id === vehicleId);
      if (vehicle) {
        if (cameraId) {
          const camera = vehicle.camerasCheckBox.find(camera => camera.id === cameraId);
          if (camera) {
            camera.checked = value;
          }
        } else {
          vehicle.checked = value;
          vehicle.camerasCheckBox = vehicle.camerasCheckBox.map(camera => ({
            ...camera,
            checked: value
          }));
        }
      }
    } else {
      fleet.checked = value;
      fleet.children = fleet.children.map(child => this.markChild(child, value));
      fleet.vehicles = fleet.vehicles.map(vehicle => ({
        ...vehicle,
        checked: value,
        camerasCheckBox: vehicle.camerasCheckBox.map(camera => ({
          ...camera,
          checked: value
        }))
      }));
    }
    this.fleets = this.checkTree(fleets);
    this.allFleets = this.checkAllFleets(fleets);
    this.tempFleets = this.getTempFleets(this.searchControl.value ?? '', fleets);
    this.cdr.detectChanges();
  }

  handleAddFleetAccessClick() {
    this.markFormAsTouched();

    this.store.dispatch(SettingsActions.createFleetAccess({ body: this.getBody() }));
    this.sub.add(
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.createFleetAccessSuccess]),
          takeUntil(this.destroy$),
          tap(() => {
            this.store.dispatch(
              SettingsActions.fetchFleetAccess({
                params: { company_id: this.data.companyId, page: 1, per_page: 100 }
              })
            );

            this.store.dispatch(
              SettingsActions.fetchFleetAccessFilter({
                params: { company_id: this.data.companyId, page: 1, per_page: 100 }
              })
            );

            this.dialogRef.close();
          })
        )
        .subscribe()
    );
  }

  handleUpdateFleetAccessClick(fleetId: number) {
    this.markFormAsTouched();

    this.store.dispatch(SettingsActions.updateFleetAccess({ id: fleetId, body: this.getBody() }));
    this.sub.add(
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.updateFleetAccessSuccess]),
          takeUntil(this.destroy$),
          tap(() => {
            this.store.dispatch(
              SettingsActions.fetchFleetAccess({
                params: { company_id: this.data.companyId, page: 1, per_page: 100 }
              })
            );

            this.store.dispatch(
              SettingsActions.fetchFleetAccessFilter({
                params: { company_id: this.data.companyId, page: 1, per_page: 100 }
              })
            );

            this.store.dispatch(
              SettingsActions.fetchCompaniesTree({
                params: { with_users: true, with_drivers: false, with_score: false }
              })
            );

            this.dialogRef.close();
          })
        )
        .subscribe()
    );
  }

  handleAllFleetsClick(value: boolean) {
    this.allFleets = value;
    const fleets = this.fleets.map(fleet => ({ ...fleet, checked: value, children: fleet.children.map(child => this.markChild(child, value)), vehicles: fleet.vehicles.map(vehicle => ({ ...vehicle, checked: value })) }));
    this.fleets = this.checkTree(fleets);
    const searchValue = this.searchControl.value ?? '';
    this.tempFleets = this.getTempFleets(searchValue, fleets);
    this.cdr.detectChanges();
  }

  private checkTree(fleets: FleetCheckbox[]): FleetCheckbox[] {
    if (fleets.length === 0) {
      return [];
    }
    const newFleets = [...fleets];

    for (let i = 0; i < newFleets.length; i++) {
      const fleet = newFleets[i];
      const checkChildren = this.checkTree(fleet.children);
      fleet.checked = this.checkFleet(fleet.vehicles, checkChildren, fleet.checked);
      fleet.children = checkChildren;
    }
    return newFleets;
  }

  private checkFleet(vehicles: VehicleCheckbox[], children: FleetCheckbox[], checkValue: CheckStatus): CheckStatus {
    if (vehicles.length === 0 && children.length === 0) {
      return checkValue;
    }

    const countVehicles = vehicles.filter(vehicle => vehicle.checked).length;
    const countChildren = children.filter(child => child.checked).length;

    const countNull = children.filter(child => child.checked === null).length;

    const countChecked = countVehicles + countChildren;

    const all = vehicles.length + children.length;

    return (countChecked > 0 && countChecked < all) || countNull > 0 ? null : countChecked !== 0;
  }

  private fleetMapper(fleet: FleetsTreeElement, checkedVehicles: number[], checkedFleets: number[], checkedCameraChannels: number[], parentChecked: boolean = false): FleetCheckbox {
    const checked = parentChecked || checkedFleets.includes(fleet.id);
    return {
      ...fleet,
      checked,
      children: fleet.children.map(fleet => this.fleetMapper(fleet, checkedVehicles, checkedFleets, checkedCameraChannels, checked)),
      vehicles: fleet.vehicles?.map(vehicle => ({ ...vehicle, checked: checkedVehicles.includes(vehicle.id) || checked, camerasCheckBox: vehicle.cameras?.map(camera => ({ ...camera, checked: checkedCameraChannels.includes(camera.id) })) })) ?? []
    };
  }

  private searchTree(fleet: FleetCheckbox, fleetId: number): FleetCheckbox | null {
    if (fleet.id === fleetId) {
      return fleet;
    } else if (fleet.children != null) {
      let result: FleetCheckbox | null = null;
      for (let i = 0; result == null && i < fleet.children.length; i++) {
        result = this.searchTree(fleet.children[i], fleetId);
      }
      return result;
    }
    return null;
  }

  private markChild(fleet: FleetCheckbox, value: boolean): FleetCheckbox {
    fleet.checked = value;
    fleet.vehicles = fleet.vehicles.map(vehicle => ({
      ...vehicle,
      checked: value,
      camerasCheckBox: vehicle.camerasCheckBox.map(camera => ({
        ...camera,
        checked: value
      }))
    }));
    fleet.children = fleet.children.map(child => this.markChild(child, value));
    return fleet;
  }

  private getTempFleets(searchValue: string, fleets: FleetCheckbox[]): FleetCheckbox[] {
    return searchValue == '' ? fleets : this.searchInTree(searchValue.toLowerCase(), fleets);
  }

  private searchInTree(search: string, fleets: FleetCheckbox[]): FleetCheckbox[] {
    return fleets
      .map(fleet => {
        const vehicles = fleet.vehicles.filter(vehicle => {
          const name = `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.registration_plate}`;
          return name.toLowerCase().includes(search);
        });
        if (vehicles.length > 0) {
          return {
            ...fleet,
            vehicles,
            children: this.searchInTree(search, fleet.children)
          };
        }
        if (fleet.name.toLowerCase().includes(search)) {
          return {
            ...fleet,
            vehicles: [],
            children: this.searchInTree(search, fleet.children)
          };
        }
        const searchLength = MapUtil.mapToFlatFleets(this.searchInTree(search, fleet.children)).length;
        if (searchLength > 0) {
          return {
            ...fleet,
            vehicles: [],
            children: this.searchInTree(search, fleet.children)
          };
        }
        return null;
      })
      .filter(fleet => fleet != null) as FleetCheckbox[];
  }

  private checkAllFleets(fleets: FleetCheckbox[]): boolean | null {
    const allCheck = fleets.every(fleet => fleet.checked);
    const someCheck = fleets.some(fleet => fleet.checked || fleet.checked === null);

    return allCheck ? true : someCheck ? null : false;
  }

  private getCheckedElements(fleets: FleetCheckbox[]): [number[], number[], number[]] {
    const fleetIds: number[] = [];
    const vehiclesIds: number[] = [];
    const cameraChannelIds: number[] = [];

    function analyzeTree(fleets: FleetCheckbox[]): void {
      if (fleets.length === 0) {
        return;
      }

      fleets.forEach(fleet => {
        if (fleet.id === CENTER) {
          analyzeTree(fleet.children);
        } else if (fleet.checked === true) {
          analyzeTree(fleet.children);
          fleetIds.push(fleet.id);
          const cameraChannels = fleet.vehicles.flatMap(vehicle => vehicle.camerasCheckBox.filter(camera => camera.checked).map(camera => camera.id));
          cameraChannelIds.push(...cameraChannels);
        } else if (fleet.checked === null) {
          analyzeTree(fleet.children);
          const vehicles = fleet.vehicles.filter(vehicle => vehicle.checked).map(vehicle => vehicle.id);
          vehiclesIds.push(...vehicles);
          const cameraChannels = fleet.vehicles.flatMap(vehicle => vehicle.camerasCheckBox.filter(camera => camera.checked).map(camera => camera.id));
          cameraChannelIds.push(...cameraChannels);
        }
      });
    }

    analyzeTree(fleets);

    return [fleetIds, vehiclesIds, cameraChannelIds];
  }

  private getBody(): CreateUpdateFleetAccess {
    const [fleetIds, vehiclesIds, cameraChannelIds] = this.getCheckedElements(this.fleets);
    return {
      company_id: String(this.data.companyId),
      name: String(this.bodyGroup.value?.name),
      fleet_ids: fleetIds.join(','),
      vehicle_ids: vehiclesIds.join(','),
      camera_channel_ids: cameraChannelIds.join(',')
    };
  }

  private markFormAsTouched() {
    Object.keys(this.bodyGroup.controls).forEach(key => {
      const control = this.bodyGroup.get(key);
      control?.markAsTouched();
    });
    this.cdr.detectChanges();
  }
}
