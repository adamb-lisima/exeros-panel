import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, distinctUntilChanged, filter, first, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { SelectControl } from '../../../../../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../../../../../store/app-store.model';
import { CommonObjectsSelectors } from '../../../../../../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../../../../../../util/control';
import { firstNonNullish } from '../../../../../../../../util/operators';
import { SettingsActions } from '../../../../../../settings.actions';
import { CreateVehicleBody, ProviderForm, VehicleElement } from '../../../../../../settings.model';
import { SettingsSelectors } from '../../../../../../settings.selectors';
import DateConst from 'src/app/const/date';

export type SettingsCoreFleetsNewVehicleDialogData = { fleetId: number; userCompanyId: number | undefined } & (
  | {
      type: 'create';
    }
  | {
      type: 'edit';
      vehicle: VehicleElement;
    }
);

interface VehicleChecked {
  id: number;
  fleetName: string;
  registrationPlate: string;
  brand: string;
  model: string;
  checked: boolean;
}

@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralInfoComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
  @Input() dvlaData: any;
  @Input() bodyForm?: FormGroup;

  @Input() fleetOptions?: Observable<any[]>;
  private _fleetOptions$?: Observable<any[]>;

  private readonly destroy$ = new Subject<void>();

  readonly DateConst = DateConst;
  title = 'Add vehicle';

  searchControl = this.fb.control('');
  typeOptions: SelectControl<CreateVehicleBody['type']>[] = [
    { value: 'VAN', label: 'VAN' },
    { value: 'HGV', label: 'HGV' },
    { value: 'COMPANY_CAR', label: 'Company car' },
    { value: 'BUS', label: 'Bus' }
  ];

  driverModeOptions: SelectControl<CreateVehicleBody['driver_mode']>[] = [
    { value: 'Disabled', label: 'Disabled' },
    { value: 'Enabled', label: 'Enabled' }
  ];

  private flattenFleets(data: any[]): any[] {
    let flattened: any[] = [];

    function processItem(item: any, level = 0) {
      const indent = level > 0 ? '    '.repeat(level) : '';
      flattened.push({
        value: item.value ?? item.id,
        label: indent + item.label || item.name,
        profile: item.profile
      });

      if (item.children && item.children.length > 0) {
        item.children.forEach((child: any) => processItem(child, level + 1));
      }
    }

    data.forEach(item => processItem(item));
    return flattened;
  }

  get fleetOptions$(): Observable<any[]> {
    return this._fleetOptions$!;
  }

  bodyGroup = this.fb.group<Nullable<CreateVehicleBody>>({
    brand_name: undefined,
    model_name: undefined,
    registration_plate: undefined,
    type: undefined,
    fleet_id: undefined,
    bus_id: undefined,
    mot_expiry_due: undefined,
    service_due: undefined,
    providers: this.fb.array<FormGroup<ProviderForm>>([]),
    channel_count: undefined,
    protocol: undefined,
    transmit_ip: undefined,
    transmit_port: undefined,
    route: undefined,
    colour: undefined,
    fuel_type: undefined,
    fuel_capacity: undefined,
    gross_vehicle_weight: undefined,
    driver_mode: 'Disabled'
  });

  selectedAction: 'addNew' | 'assignExisting' = 'addNew';

  vehicles: VehicleChecked[] = [];

  constructor(@Inject(DIALOG_DATA) public data: SettingsCoreFleetsNewVehicleDialogData, private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly fb: FormBuilder, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));
    this.store.dispatch(SettingsActions.fetchVehicleReset());

    this._fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(
      distinctUntilChanged(),
      filter(data => !!data && data.length > 0),
      first(),
      map(data => {
        const treeControls = ControlUtil.mapFleetsTreeToTreeControls(data);
        return this.flattenFleets(treeControls);
      }),
      shareReplay(1)
    );

    this.bodyGroup.controls.brand_name.setValidators(Validators.required);
    this.bodyGroup.controls.model_name.setValidators(Validators.required);
    this.bodyGroup.controls.registration_plate.setValidators(Validators.required);
    this.bodyGroup.controls.type.setValidators(Validators.required);
    this.bodyGroup.controls.fleet_id.setValidators(Validators.required);

    this.bodyGroup.controls.brand_name.updateValueAndValidity();
    this.bodyGroup.controls.model_name.updateValueAndValidity();
    this.bodyGroup.controls.registration_plate.updateValueAndValidity();
    this.bodyGroup.controls.type.updateValueAndValidity();
    this.bodyGroup.controls.fleet_id.updateValueAndValidity();

    if (this.data.type === 'edit') {
      this.handleEditMode();
    } else {
      this.handleCreateMode();
    }
  }

  private handleEditMode(): void {
    this.title = 'Edit vehicle';

    if (this.data.type !== 'edit') {
      return;
    }

    this.store.dispatch(SettingsActions.fetchVehicle({ id: this.data.vehicle.id }));

    combineLatest([this.store.select(SettingsSelectors.vehicle).pipe(firstNonNullish()), this._fleetOptions$!.pipe(first())])
      .pipe(
        tap(([vehicle, _]) => {
          this.patchVehicleData(vehicle);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private patchVehicleData(vehicle: any): void {
    this.bodyGroup.patchValue({
      fleet_id: vehicle.fleet_id,
      bus_id: vehicle.bus_id,
      brand_name: vehicle.brand_name,
      model_name: vehicle.model_name,
      registration_plate: vehicle.registration_plate,
      type: vehicle.type,
      mot_expiry_due: vehicle.mot_expiry_due,
      service_due: vehicle.service_due,
      channel_count: vehicle.channel_count,
      protocol: vehicle.protocol,
      transmit_ip: vehicle.transmit_ip,
      transmit_port: vehicle.transmit_port,
      route: vehicle.route,
      colour: vehicle.colour,
      fuel_type: vehicle.fuel_type,
      fuel_capacity: vehicle.fuel_capacity ? Number(vehicle.fuel_capacity) : undefined,
      gross_vehicle_weight: vehicle.gross_vehicle_weight,
      driver_mode: vehicle.driver_mode
    });

    this.cdr.detectChanges();
  }

  private handleCreateMode(): void {
    this._fleetOptions$!.pipe(
      first(),
      tap(() => {
        if (this.dvlaData) {
          this.applyDvlaData();
        } else {
          const parentData = this.data as any;
          if (parentData?.completeVehicleData?.registration_plate) {
            this.bodyGroup.patchValue({
              registration_plate: parentData.completeVehicleData.registration_plate
            });
          }

          if (this.data.fleetId) {
            this.bodyGroup.patchValue({
              fleet_id: this.data.fleetId
            });
          }

          this.cdr.detectChanges();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private applyDvlaData(): void {
    if (!this.dvlaData) {
      const parentData = this.data as any;
      if (parentData?.completeVehicleData?.registration_plate) {
        this.bodyGroup.patchValue({
          registration_plate: parentData.completeVehicleData.registration_plate
        });
      }

      if (this.data.fleetId) {
        this.bodyGroup.patchValue({
          fleet_id: this.data.fleetId
        });
      }

      this.cdr.detectChanges();
      return;
    }

    this.bodyGroup.patchValue({
      brand_name: this.dvlaData.make ?? '',
      registration_plate: this.dvlaData.registration_plate ?? '',
      type: this.mapDvlaTypeToVehicleType(this.dvlaData.type_approval),
      mot_expiry_due: this.dvlaData.art_end_date ?? '',
      colour: this.dvlaData.colour ?? '',
      fuel_type: this.dvlaData.fuel_type ?? null,
      fuel_capacity: this.dvlaData.engine_capacity ? Number(this.dvlaData.engine_capacity) : null,
      gross_vehicle_weight: this.dvlaData.revenue_weight ?? null
    });

    if (!this.bodyGroup.get('fleet_id')?.value && this.data.fleetId) {
      this.bodyGroup.patchValue({
        fleet_id: this.data.fleetId
      });
    }

    this.cdr.detectChanges();
  }

  private mapDvlaTypeToVehicleType(dvlaType: string): 'HGV' | 'VAN' | 'BUS' | 'TRAIN' | 'COMPANY_CAR' {
    if (dvlaType === 'M1') return 'COMPANY_CAR';
    if (dvlaType === 'N1') return 'VAN';
    if (dvlaType === 'M2' || dvlaType === 'M3') return 'BUS';
    if (dvlaType === 'N2' || dvlaType === 'N3') return 'HGV';

    return 'VAN';
  }

  private markFormAsTouched() {
    Object.keys(this.bodyGroup.controls).forEach(key => {
      const control = this.bodyGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
    this.cdr.detectChanges();
  }

  validateForm(): boolean {
    Object.keys(this.bodyGroup.controls).forEach(key => {
      const control = this.bodyGroup.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();

        if (['brand_name', 'model_name', 'registration_plate', 'type', 'fleet_id'].includes(key) && !control.value) {
          control.setErrors({ required: true });
        }
      }
    });

    this.cdr.detectChanges();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);

    const brandValue = this.bodyGroup.get('brand_name')?.value;
    const modelValue = this.bodyGroup.get('model_name')?.value;
    const plateValue = this.bodyGroup.get('registration_plate')?.value;
    const typeValue = this.bodyGroup.get('type')?.value;
    const fleetValue = this.bodyGroup.get('fleet_id')?.value;

    const isManuallyValid = !!brandValue && !!modelValue && !!plateValue && !!typeValue && !!fleetValue;

    return isManuallyValid;
  }
}
