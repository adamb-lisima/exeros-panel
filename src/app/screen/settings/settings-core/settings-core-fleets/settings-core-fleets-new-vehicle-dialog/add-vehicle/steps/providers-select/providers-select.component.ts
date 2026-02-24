import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounceTime, forkJoin, map, Observable, of, shareReplay, Subject, take, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from '../../../../../../../../shared/component/control/select-control/select-control.model';
import { HumanizePipe } from '../../../../../../../../shared/pipe/humanize/humanize.pipe';
import { AppState } from '../../../../../../../../store/app-store.model';
import { CommonObjectsSelectors } from '../../../../../../../../store/common-objects/common-objects.selectors';
import { CommonObjectsService } from '../../../../../../../../store/common-objects/common-objects.service';
import { ConfigSelectors } from '../../../../../../../../store/config/config.selectors';
import ControlUtil from '../../../../../../../../util/control';
import { firstNonNullish } from '../../../../../../../../util/operators';
import { CreateVehicleBody, ProviderForm } from '../../../../../../settings.model';
import { SettingsSelectors } from '../../../../../../settings.selectors';
import { SettingsCoreFleetsNewVehicleDialogData } from '../../../settings-core-fleets-new-vehicle-dialog.component';
import DateConst from 'src/app/const/date';

const vehiclesOptions: SelectControl[] = [
  { label: 'Coach bus', value: '10' },
  { label: 'Larger bus', value: '11' },
  { label: 'Medium bus', value: '12' },
  { label: 'Small bus', value: '13' },
  { label: 'Sedan', value: '14' },
  { label: 'Large sleeper bus', value: '15' },
  { label: 'Medium sleeper bus', value: '16' },
  { label: 'General truck', value: '20' },
  { label: 'Large general truck', value: '21' },
  { label: 'Medium general truck', value: '22' },
  { label: 'Small general truck', value: '23' },
  { label: 'Special transport vehicle', value: '30' },
  { label: 'Container car', value: '31' },
  { label: 'Large transport vehicle', value: '32' },
  { label: 'Insulation refrigerated truck', value: '33' },
  { label: 'Commercial vehicles transport vehicle', value: '34' },
  { label: 'Tanker', value: '35' },
  { label: 'Tractor', value: '36' },
  { label: 'Trailer', value: '37' },
  { label: 'Flatbed truck', value: '38' },
  { label: 'Other special vehicle', value: '39' },
  { label: 'Dangerous goods vehicle', value: '40' },
  { label: 'Agricultural vehicle', value: '50' },
  { label: 'Other vehicle', value: '90' }
];

interface ProviderData {
  provider_id: number;
  vehicle_device_id: string | null | undefined;
  mode: 'create' | 'assign';
  order: number;
  transmit_ip?: string;
  transmit_port?: number;
}

@Component({
  selector: 'app-providers-select',
  templateUrl: './providers-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersSelectComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();

  readonly DateConst = DateConst;
  title = 'Add vehicle';

  searchControl = this.fb.control('');
  deviceOptionsLoading: Map<number, boolean> = new Map();

  networkModuleTypeOptions: SelectControl[] = ['GPRS', 'CDMA', 'EVDO', 'WCDMA', 'EDGE', 'TDSCDMA'].map(value => ({ label: value, value }));
  vehicleClassOptions: SelectControl[] = vehiclesOptions;
  fuelTypeOptions: SelectControl[] = ['Gasoline', 'Diesel', 'Natural gas', 'Liquefied gas', 'electric', 'Other'].map(value => ({ label: value, value }));
  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(data => ControlUtil.mapFleetsTreeToTreeControls(data)));
  providerOptions$ = this.store.select(ConfigSelectors.data).pipe(map((data): SelectControl[] => data?.providers.map(provider => ({ value: provider.id, label: this.humanize.transform(provider.name) })) ?? []));
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
    camera_channels: undefined,
    driver_mode: undefined
  });

  get providersFormArray(): FormArray<FormGroup<ProviderForm>> {
    return this.bodyGroup.get('providers') as unknown as FormArray<FormGroup<ProviderForm>>;
  }

  isProvidersSetOpen = false;
  isChannelSetOpen = false;
  isSimCardOpen = false;
  isVehicleFileOpen = false;
  isEquipmentFileOpen = false;

  allChannels: boolean | null = true;
  channelEnabled: boolean[] = [true, true, true, true, true];

  channelSetForm = this.fb.group({
    0: '',
    1: '',
    2: '',
    3: '',
    4: ''
  });

  simCardForm = this.fb.group({
    sim_no: '',
    imei: '',
    imsi: '',
    network_module_type: ''
  });

  vehicleFileForm = this.fb.group({
    vehicle_class: '',
    factory_grade: '',
    loading_capacity: '',
    engine_number: '',
    chassis_number: '',
    fuel_type: '',
    road_transport_certificate: '',
    technical_grade: '',
    validity_period: '',
    fuel_consumption: '',
    province: '',
    city: ''
  });

  equipmentFileForm = this.fb.group({
    device_username: '',
    device_password: '',
    factory_lot_number: '',
    factory_lot_time: '',
    installer: '',
    installation_date: '',
    peripheral_description: ''
  });

  private readonly humanize = new HumanizePipe();

  showSmaxOptions: boolean[] = [];
  providerModes: ('assign' | 'create')[] = [];
  isExistingSmaxProvider: boolean[] = [];

  providerModified: boolean[] = [];
  originalProviders: any[] = [];
  activeProviderIndex: number | null = null;

  constructor(@Inject(DIALOG_DATA) public data: SettingsCoreFleetsNewVehicleDialogData, private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly fb: FormBuilder, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef, private readonly commonObjectsService: CommonObjectsService) {}

  setActiveProvider(index: number): void {
    this.activeProviderIndex = index;
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.providerModified = [];
    this.originalProviders = [];
    this.showSmaxOptions = [];
    this.providerModes = [];
    this.isExistingSmaxProvider = [];
    this.deviceOptionsMap.clear();

    const providerArray = this.bodyGroup.get('providers') as unknown as FormArray;
    providerArray.clear();

    if (this.data.type === 'edit') {
      this.title = 'Edit vehicle';
      this.isProvidersSetOpen = true;
      this.isChannelSetOpen = true;
      this.isSimCardOpen = true;
      this.isVehicleFileOpen = true;
      this.isEquipmentFileOpen = true;

      const vehicleData = this.data.vehicle as any;

      if (vehicleData?.providers?.length > 0) {
        this.originalProviders = JSON.parse(JSON.stringify(vehicleData.providers));
      }
    }

    this.allChannels = true;

    for (let i = 0; i < 5; i++) {
      this.channelSetForm.get(i.toString())?.enable();
    }

    if (this.providersFormArray.length === 0 && this.data.type !== 'edit') {
      this.addProvider();
    }

    Promise.resolve().then(() => {
      this.store
        .select(SettingsSelectors.vehicle)
        .pipe(
          firstNonNullish(),
          tap(vehicle => {
            const vehicleData = vehicle;

            if (Array.isArray(vehicleData.providers) && vehicleData.providers.length > 0) {
              this.originalProviders = JSON.parse(JSON.stringify(vehicleData.providers));
            }

            this.setupFormsWithVehicleData(vehicleData);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    });

    if (this.providersFormArray.length > 0) {
      this.activeProviderIndex = 0;
    }
  }

  getProviders(): any[] {
    if (this.providersFormArray && this.providersFormArray.length > 0) {
      const providers = this.providersFormArray.controls
        .filter(control => control.get('provider_id')?.value)
        .map((control, index) => {
          const values = control.value;

          const providerId = values.provider_id;
          let deviceId = values.device_id;

          if (!providerId) {
            return null;
          }

          if (deviceId === undefined || deviceId === '') {
            deviceId = null;

            if (this.originalProviders?.[index]) {
              deviceId = this.originalProviders[index].details?.vehicle_device_id ?? this.originalProviders[index].vehicle_device_id ?? this.originalProviders[index].device_id ?? null;
            }
          }

          const isSmax = providerId === 1;
          const mode = isSmax ? this.providerModes[index] || 'create' : 'assign';

          const providerData: any = {
            provider_id: providerId,
            vehicle_device_id: deviceId,
            mode: mode,
            order: index + 1
          };

          if (isSmax) {
            providerData.transmit_ip = values.transmit_ip ?? '';
            providerData.transmit_port = values.transmit_port ?? null;

            if ((!providerData.transmit_ip || providerData.transmit_ip === '') && providerId === 1) {
              providerData.transmit_ip = '0.0.0.0';
            }

            if (providerData.transmit_port === null && providerId === 1) {
              providerData.transmit_port = 8080;
            }
          }

          return providerData;
        })
        .filter(Boolean);

      if (providers.length > 0) {
        return providers;
      }
    }

    if (this.originalProviders && this.originalProviders.length > 0) {
      return this.originalProviders.map((provider, index) => {
        const deviceId = provider.details?.vehicle_device_id ?? provider.vehicle_device_id ?? provider.device_id ?? null;

        const providerData: ProviderData = {
          provider_id: provider.provider_id,
          vehicle_device_id: deviceId,
          mode: 'assign',
          order: index + 1
        };

        if (provider.provider_type === 'STREAMAX') {
          providerData.transmit_ip = provider.details?.transmit_ip ?? provider.transmit_ip ?? undefined;
          providerData.transmit_port = provider.details?.transmit_port ?? provider.transmit_port ?? undefined;
        }

        return providerData;
      });
    }

    if (this.data.type === 'edit') {
      const vehicleProviders = (this.data.vehicle as any)?.providers;
      if (vehicleProviders && vehicleProviders.length > 0) {
        return vehicleProviders.map((provider: any, index: number) => {
          const deviceId = provider.details?.vehicle_device_id ?? provider.vehicle_device_id ?? provider.device_id ?? null;

          const providerData: ProviderData = {
            provider_id: provider.provider_id,
            vehicle_device_id: deviceId,
            mode: 'assign',
            order: index + 1
          };

          if (provider.provider_type === 'STREAMAX') {
            providerData.transmit_ip = provider.details?.transmit_ip ?? provider.transmit_ip ?? undefined;
            providerData.transmit_port = provider.details?.transmit_port ?? provider.transmit_port ?? undefined;
          }

          return providerData;
        });
      }
    }

    return [];
  }

  private addProviderFromData(provider: any, index: number, vehicle: any): void {
    const isSmax = provider.provider_type === 'STREAMAX';

    let deviceId = null;
    if (provider?.details?.vehicle_device_id) {
      deviceId = provider.details.vehicle_device_id;
    } else if (provider.vehicle_device_id) {
      deviceId = provider.vehicle_device_id;
    } else if (provider.device_id && provider.device_id !== '') {
      deviceId = provider.device_id;
    }

    let initialTransmitIp = '';
    let transmitIpValidator = null;
    let initialTransmitPort = null;
    let transmitPortValidator = null;

    if (isSmax) {
      initialTransmitIp = provider.transmit_ip ?? provider.details?.transmit_ip ?? vehicle.transmit_ip ?? '';
      transmitIpValidator = Validators.required;
      initialTransmitPort = provider.transmit_port ?? provider.details?.transmit_port ?? vehicle.transmit_port ?? null;
      transmitPortValidator = Validators.required;
    }

    const formGroup = this.fb.group({
      provider_id: [provider.provider_id, Validators.required],
      device_id: [deviceId ?? ''],
      order: [index + 1],
      transmit_ip: [initialTransmitIp, transmitIpValidator],
      transmit_port: [initialTransmitPort, transmitPortValidator]
    });

    const providerArray = this.bodyGroup.get('providers') as unknown as FormArray;
    if (providerArray) {
      providerArray.push(formGroup);

      this.showSmaxOptions[index] = isSmax;
      this.providerModes[index] = 'assign';
      this.isExistingSmaxProvider[index] = isSmax;
      this.providerModified[index] = false;

      this.setupProviderValueChanges(provider, index);
    }
  }

  private setupProviderValueChanges(provider: any, index: number): void {
    const providerForm = this.providersFormArray.at(index);

    providerForm.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => {
          this.providerModified[index] = true;

          if (provider.provider_type === 'STREAMAX' && !this.isExistingSmaxProvider[index]) {
            this.providerModes[index] = 'create';
            this.cdr.detectChanges();
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

  deviceOptionsMap: Map<number, Observable<SelectControl[]>> = new Map();

  createProviderFormGroup(): FormGroup {
    const group = this.fb.group({
      provider_id: null,
      device_id: '',
      order: this.providersFormArray.length + 1,
      transmit_ip: ['', Validators.required],
      transmit_port: [null, Validators.required]
    });

    const index = this.providersFormArray.length;
    this.showSmaxOptions[index] = false;
    this.providerModes[index] = 'assign';

    group.get('transmit_ip')?.clearValidators();
    group.get('transmit_port')?.clearValidators();
    group.get('transmit_ip')?.updateValueAndValidity();
    group.get('transmit_port')?.updateValueAndValidity();

    group
      .get('provider_id')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(providerId => {
        if (providerId) {
          const isSmax = providerId === 1;
          this.showSmaxOptions[index] = isSmax;

          if (isSmax) {
            group.get('transmit_ip')?.setValidators(Validators.required);
            group.get('transmit_port')?.setValidators(Validators.required);
          } else {
            group.get('transmit_ip')?.clearValidators();
            group.get('transmit_port')?.clearValidators();
          }

          group.get('transmit_ip')?.updateValueAndValidity();
          group.get('transmit_port')?.updateValueAndValidity();

          this.loadDevicesForProvider(providerId, index);
          this.cdr.detectChanges();
        }
      });

    return group;
  }

  getTransmitIpControl(provider: FormGroup): FormControl {
    return provider.get('transmit_ip') as FormControl;
  }

  getTransmitPortControl(provider: FormGroup): FormControl {
    return provider.get('transmit_port') as FormControl;
  }

  setProviderMode(index: number, mode: 'assign' | 'create'): void {
    this.providerModes[index] = mode;
    this.cdr.detectChanges();
  }

  handleChannelCheckboxChange(value: boolean, controlId: number) {
    this.channelEnabled[controlId] = value;

    const channelGroup = this.channelSetForm.get(controlId.toString()) as FormGroup;
    if (value) {
      channelGroup?.enable();
    } else {
      channelGroup?.disable();
    }

    const allEnabled = this.channelEnabled.every(enabled => enabled);
    const someEnabled = this.channelEnabled.some(enabled => enabled);

    if (allEnabled) {
      this.allChannels = true;
    } else if (someEnabled) {
      this.allChannels = null;
    } else {
      this.allChannels = false;
    }

    this.cdr.detectChanges();
  }

  handleAllChannelsClick(eventOrValue: Event | boolean): void {
    let value: boolean;
    if (typeof eventOrValue === 'boolean') {
      value = eventOrValue;
    } else {
      const checkbox = eventOrValue.target as HTMLInputElement;
      value = checkbox.checked;
    }

    this.allChannels = value;
    this.channelEnabled = this.channelEnabled.map(() => value);

    for (let i = 0; i < 5; i++) {
      const channelGroup = this.channelSetForm.get(i.toString()) as FormGroup;
      if (value) {
        channelGroup?.enable();
      } else {
        channelGroup?.disable();
      }
    }

    this.cdr.detectChanges();
  }

  checkAllChannels(): boolean | null {
    for (let i = 0; i < 5; i++) {
      const control = this.channelSetForm.get(i.toString());
      this.channelEnabled[i] = control?.enabled ?? false;
    }

    const allEnabled = this.channelEnabled.every(enabled => enabled);
    const someEnabled = this.channelEnabled.some(enabled => enabled);

    if (allEnabled) {
      return true;
    }
    if (someEnabled) {
      return null;
    }
    return false;
  }

  getBody(): CreateVehicleBody {
    const formValue = this.bodyGroup.value;
    const providers = this.providersFormArray.controls.map((control, index) => {
      const values = control.value;
      const providerId = values.provider_id;
      const isSmax = providerId === 1;
      const mode = isSmax ? this.providerModes[index] : 'assign';

      return {
        provider_id: values.provider_id,
        vehicle_device_id: values.device_id,
        mode: mode,
        order: index + 1
      };
    });

    const channels: { [key: string]: string } = {};
    const camera_channels: { channel: number; name: string; active: boolean }[] = [];

    for (let i = 0; i < 5; i++) {
      const control = this.channelSetForm.get(i.toString());

      if (control?.enabled && this.channelEnabled[i]) {
        const channelValue = control.value ?? '';
        const channelNumber = i + 1;

        channels[channelNumber] = channelValue;

        camera_channels.push({
          channel: channelNumber,
          name: channelValue,
          active: true
        });
      }
    }

    return {
      ...formValue,
      providers,
      channels,
      camera_channels: camera_channels,
      ...this.simCardForm.value,
      ...this.equipmentFileForm.value,
      ...this.vehicleFileForm.value
    } as unknown as CreateVehicleBody;
  }

  getDeviceOptions(providerIndex: number): Observable<SelectControl[]> {
    return this.deviceOptionsMap.get(providerIndex) ?? of([]);
  }

  private loadProviderDevices(vehicle: any): void {
    const observables: Observable<any>[] = [];
    const deviceIds: { index: number; id: any }[] = [];

    const providers = Array.isArray(vehicle.providers) ? vehicle.providers : [];

    providers.forEach((provider: any, index: number) => {
      if (!provider.provider_id) {
        if (provider.id) {
          provider.provider_id = provider.id;
        } else {
          return;
        }
      }

      let deviceId: string | null = null;
      if (provider.details?.vehicle_device_id) {
        deviceId = provider.details.vehicle_device_id;
      } else if (provider.vehicle_device_id) {
        deviceId = provider.vehicle_device_id;
      } else if (provider.device_id && provider.device_id !== '') {
        deviceId = provider.device_id;
      }

      if (deviceId) {
        deviceIds.push({ index, id: deviceId });
        observables.push(this.processProviderWithDeviceId(provider, index));
      } else {
        this.loadDevicesForProvider(provider.provider_id, index);
      }
    });

    if (observables.length > 0) {
      forkJoin(observables)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          setTimeout(() => {
            deviceIds.forEach(({ index, id }) => {
              if (this.providersFormArray.at(index)) {
                this.providersFormArray.at(index).get('device_id')?.setValue(id);
              }
            });
            this.cdr.markForCheck();
          }, 200);
        });
    }
  }

  private processDeviceResponse(response: any, index: number): void {
    const deviceOptions = response.data.map((device: any) => ({
      value: device.id,
      label: device.name
    }));
    this.deviceOptionsMap.set(index, of(deviceOptions));
  }

  private processProviderWithDeviceId(provider: any, index: number): Observable<any> {
    let deviceId: string | null = null;

    if (provider.details?.vehicle_device_id) {
      deviceId = provider.details.vehicle_device_id;
    } else if (provider.vehicle_device_id) {
      deviceId = provider.vehicle_device_id;
    } else if (provider.device_id && provider.device_id !== '') {
      deviceId = provider.device_id;
    }

    this.deviceOptionsLoading.set(index, true);
    this.cdr.detectChanges();

    const formControl = this.providersFormArray.at(index)?.get('device_id');
    if (formControl && deviceId) {
      formControl.setValue(deviceId);
    }

    return this.commonObjectsService.fetchVehicleDevices(provider.provider_id).pipe(
      tap(response => {
        this.processDeviceResponse(response, index);

        this.deviceOptionsLoading.set(index, false);
        this.cdr.detectChanges();

        setTimeout(() => {
          const formControl = this.providersFormArray.at(index)?.get('device_id');
          if (formControl && deviceId) {
            formControl.setValue(deviceId);
            this.cdr.detectChanges();
          }
        }, 100);
      })
    );
  }

  moveProviderUp(index: number): void {
    if (index <= 0) {
      return;
    }

    setTimeout(() => {
      const tempProvider = this.providersFormArray.at(index);
      const tempDeviceId = tempProvider.get('device_id')?.value ?? null;

      const upperProvider = this.providersFormArray.at(index - 1);
      const upperDeviceId = upperProvider.get('device_id')?.value ?? null;

      this.providersFormArray.setControl(index, upperProvider);
      this.providersFormArray.setControl(index - 1, tempProvider);

      if (this.providersFormArray.at(index)?.get('device_id')) {
        this.providersFormArray.at(index).get('device_id')?.setValue(upperDeviceId);
      }

      if (this.providersFormArray.at(index - 1)?.get('device_id')) {
        this.providersFormArray
          .at(index - 1)
          .get('device_id')
          ?.setValue(tempDeviceId);
      }

      const tempLoading = this.deviceOptionsLoading.get(index);
      const upperLoading = this.deviceOptionsLoading.get(index - 1);

      this.deviceOptionsLoading.delete(index);
      this.deviceOptionsLoading.delete(index - 1);

      if (tempLoading !== undefined) {
        this.deviceOptionsLoading.set(index - 1, tempLoading);
      }
      if (upperLoading !== undefined) {
        this.deviceOptionsLoading.set(index, upperLoading);
      }

      [this.showSmaxOptions[index], this.showSmaxOptions[index - 1]] = [this.showSmaxOptions[index - 1], this.showSmaxOptions[index]];
      [this.providerModes[index], this.providerModes[index - 1]] = [this.providerModes[index - 1], this.providerModes[index]];
      [this.isExistingSmaxProvider[index], this.isExistingSmaxProvider[index - 1]] = [this.isExistingSmaxProvider[index - 1], this.isExistingSmaxProvider[index]];
      [this.providerModified[index], this.providerModified[index - 1]] = [this.providerModified[index - 1], this.providerModified[index]];

      const tempDeviceOptions = this.deviceOptionsMap.get(index);
      const upperDeviceOptions = this.deviceOptionsMap.get(index - 1);

      this.deviceOptionsMap.delete(index);
      this.deviceOptionsMap.delete(index - 1);

      if (tempDeviceOptions) this.deviceOptionsMap.set(index - 1, tempDeviceOptions);
      if (upperDeviceOptions) this.deviceOptionsMap.set(index, upperDeviceOptions);

      if (this.activeProviderIndex === index) {
        this.activeProviderIndex = index - 1;
      } else if (this.activeProviderIndex === index - 1) {
        this.activeProviderIndex = index;
      }

      this.updateProviderOrders(index, index - 1);

      this.cdr.markForCheck();
    });
  }

  moveProviderDown(index: number): void {
    if (index >= this.providersFormArray.controls.length - 1) {
      return;
    }

    setTimeout(() => {
      const tempProvider = this.providersFormArray.at(index);
      const tempDeviceId = tempProvider.get('device_id')?.value ?? null;

      const lowerProvider = this.providersFormArray.at(index + 1);
      const lowerDeviceId = lowerProvider.get('device_id')?.value ?? null;

      this.providersFormArray.setControl(index, lowerProvider);
      this.providersFormArray.setControl(index + 1, tempProvider);

      if (this.providersFormArray.at(index)?.get('device_id')) {
        this.providersFormArray.at(index).get('device_id')?.setValue(lowerDeviceId);
      }

      if (this.providersFormArray.at(index + 1)?.get('device_id')) {
        this.providersFormArray
          .at(index + 1)
          .get('device_id')
          ?.setValue(tempDeviceId);
      }

      const tempLoading = this.deviceOptionsLoading.get(index);
      const lowerLoading = this.deviceOptionsLoading.get(index + 1);

      this.deviceOptionsLoading.delete(index);
      this.deviceOptionsLoading.delete(index + 1);

      if (tempLoading !== undefined) {
        this.deviceOptionsLoading.set(index + 1, tempLoading);
      }
      if (lowerLoading !== undefined) {
        this.deviceOptionsLoading.set(index, lowerLoading);
      }

      [this.showSmaxOptions[index], this.showSmaxOptions[index + 1]] = [this.showSmaxOptions[index + 1], this.showSmaxOptions[index]];
      [this.providerModes[index], this.providerModes[index + 1]] = [this.providerModes[index + 1], this.providerModes[index]];
      [this.isExistingSmaxProvider[index], this.isExistingSmaxProvider[index + 1]] = [this.isExistingSmaxProvider[index + 1], this.isExistingSmaxProvider[index]];
      [this.providerModified[index], this.providerModified[index + 1]] = [this.providerModified[index + 1], this.providerModified[index]];

      const tempDeviceOptions = this.deviceOptionsMap.get(index);
      const lowerDeviceOptions = this.deviceOptionsMap.get(index + 1);

      this.deviceOptionsMap.delete(index);
      this.deviceOptionsMap.delete(index + 1);

      if (tempDeviceOptions) this.deviceOptionsMap.set(index + 1, tempDeviceOptions);
      if (lowerDeviceOptions) this.deviceOptionsMap.set(index, lowerDeviceOptions);

      if (this.activeProviderIndex === index) {
        this.activeProviderIndex = index + 1;
      } else if (this.activeProviderIndex === index + 1) {
        this.activeProviderIndex = index;
      }

      this.updateProviderOrders(index, index + 1);

      this.cdr.markForCheck();
    });
  }

  private updateProviderOrders(previousIndex?: number, currentIndex?: number): void {
    this.providersFormArray.controls.forEach((control, index) => {
      control.patchValue({ order: index + 1 }, { emitEvent: false });
    });
  }

  removeProvider(index: number): void {
    this.providersFormArray.removeAt(index);

    this.showSmaxOptions.splice(index, 1);
    this.providerModes.splice(index, 1);
    this.isExistingSmaxProvider.splice(index, 1);
    this.providerModified.splice(index, 1);

    this.deviceOptionsMap.delete(index);
    this.deviceOptionsLoading.delete(index);

    const tempDeviceOptionsMap = new Map<number, Observable<SelectControl[]>>();
    const tempDeviceOptionsLoading = new Map<number, boolean>();

    this.deviceOptionsMap.forEach((options, mapIndex) => {
      if (mapIndex > index) {
        tempDeviceOptionsMap.set(mapIndex - 1, options);
      } else if (mapIndex < index) {
        tempDeviceOptionsMap.set(mapIndex, options);
      }
    });

    this.deviceOptionsLoading.forEach((loading, mapIndex) => {
      if (mapIndex > index) {
        tempDeviceOptionsLoading.set(mapIndex - 1, loading);
      } else if (mapIndex < index) {
        tempDeviceOptionsLoading.set(mapIndex, loading);
      }
    });

    this.deviceOptionsMap = tempDeviceOptionsMap;
    this.deviceOptionsLoading = tempDeviceOptionsLoading;

    if (this.activeProviderIndex === index) {
      if (this.providersFormArray.length > 0) {
        this.activeProviderIndex = Math.min(index, this.providersFormArray.length - 1);
      } else {
        this.activeProviderIndex = null;
      }
    } else if (this.activeProviderIndex !== null && this.activeProviderIndex > index) {
      this.activeProviderIndex--;
    }

    this.updateProviderOrders();
    this.cdr.detectChanges();
  }

  addProvider(): void {
    setTimeout(() => {
      const newIndex = this.providersFormArray.length;

      this.providersFormArray.push(this.createProviderFormGroup());
      this.showSmaxOptions[newIndex] = false;
      this.providerModes[newIndex] = 'assign';
      this.isExistingSmaxProvider[newIndex] = false;
      this.providerModified[newIndex] = true;
      this.setActiveProvider(newIndex);
      this.cdr.markForCheck();
    });
  }

  isDeviceOptionsLoading(index: number): boolean {
    return this.deviceOptionsLoading.get(index) === true;
  }

  loadDevicesForProvider(providerId: number | string, providerIndex: number): void {
    if (typeof providerId === 'number') {
      this.deviceOptionsLoading.set(providerIndex, true);
      this.cdr.detectChanges();

      const deviceOptions$ = this.commonObjectsService.fetchVehicleDevices(providerId).pipe(
        map(response => {
          return response.data.map((device: any) => ({
            value: device.id,
            label: device.name
          }));
        }),
        tap(() => {
          this.deviceOptionsLoading.set(providerIndex, false);
          this.cdr.detectChanges();
        }),
        shareReplay(1)
      );

      this.deviceOptionsMap.set(providerIndex, deviceOptions$);
      this.providersFormArray.at(providerIndex).get('device_id')?.reset();
      this.cdr.detectChanges();
    }
  }

  private setupChannelForm(vehicle: any): void {
    for (let i = 0; i < 5; i++) {
      this.channelSetForm.get(i.toString())?.setValue('');
      this.channelSetForm.get(i.toString())?.disable();
      this.channelEnabled[i] = false;
    }

    if (vehicle.camera_channels && vehicle.camera_channels.length > 0) {
      vehicle.camera_channels.forEach((channelData: any) => {
        const channelNum = parseInt(channelData.channel);
        const index = channelNum - 1;

        if (index >= 0 && index < 5) {
          const control = this.channelSetForm.get(index.toString());
          if (control) {
            let channelName = channelData.name;
            if (!channelName && vehicle.channels?.[channelNum]) {
              channelName = vehicle.channels[channelNum];
            }

            control.setValue(channelName ?? '');
            if (channelData.active !== false) {
              control.enable();
              this.channelEnabled[index] = true;
            }
          }
        }
      });
    } else if (vehicle.channels && (Array.isArray(vehicle.channels) ?? typeof vehicle.channels === 'object')) {
      if (Array.isArray(vehicle.channels)) {
        vehicle.channels.forEach((name: string, index: number) => {
          if (index < 5 && name) {
            const control = this.channelSetForm.get(index.toString());
            if (control) {
              control.setValue(name);
              control.enable();
              this.channelEnabled[index] = true;
            }
          }
        });
      } else {
        Object.entries(vehicle.channels).forEach(([channel, name]) => {
          const index = parseInt(channel) - 1;
          if (index >= 0 && index < 5 && name) {
            const control = this.channelSetForm.get(index.toString());
            if (control) {
              control.setValue(name);
              control.enable();
              this.channelEnabled[index] = true;
            }
          }
        });
      }
    }

    this.allChannels = this.checkAllChannels();
  }

  private setupOtherForms(vehicle: any): void {
    this.simCardForm.patchValue({
      sim_no: vehicle.sim_no,
      imei: vehicle.imei,
      imsi: vehicle.imsi,
      network_module_type: vehicle.network_module_type
    });

    this.vehicleFileForm.patchValue({
      vehicle_class: vehicle.vehicle_class,
      factory_grade: vehicle.factory_grade,
      loading_capacity: vehicle.loading_capacity,
      engine_number: vehicle.engine_number,
      chassis_number: vehicle.chassis_number,
      fuel_type: vehicle.fuel_type,
      road_transport_certificate: vehicle.road_transport_certificate,
      technical_grade: vehicle.technical_grade,
      validity_period: vehicle.validity_period,
      fuel_consumption: vehicle.fuel_consumption,
      province: vehicle.province,
      city: vehicle.city
    });

    this.equipmentFileForm.patchValue({
      device_username: vehicle.device_username,
      device_password: vehicle.device_password,
      factory_lot_number: vehicle.factory_lot_number,
      factory_lot_time: vehicle.factory_lot_time,
      installer: vehicle.installer,
      peripheral_description: vehicle.peripheral_description
    });
  }

  private setupFormsWithVehicleData(vehicle: any): void {
    this.bodyGroup.patchValue({
      fleet_id: vehicle.fleet_id,
      bus_id: vehicle.bus_id,
      brand_name: vehicle.brand_name,
      channel_count: vehicle.channel_count,
      model_name: vehicle.model_name,
      mot_expiry_due: vehicle.mot_expiry_due,
      registration_plate: vehicle.registration_plate,
      service_due: vehicle.service_due,
      type: vehicle.type,
      protocol: vehicle.protocol,
      transmit_ip: vehicle.transmit_ip,
      transmit_port: vehicle.transmit_port,
      route: vehicle.route
    });

    const providerArray = this.bodyGroup.get('providers') as unknown as FormArray;
    providerArray.clear();

    this.showSmaxOptions = [];
    this.providerModes = [];
    this.isExistingSmaxProvider = [];
    this.providerModified = [];

    if (vehicle.providers && Array.isArray(vehicle.providers) && vehicle.providers.length > 0) {
      vehicle.providers.forEach((provider: any, index: number) => {
        this.addProviderFromData(provider, index, vehicle);
      });
      this.loadProviderDevices(vehicle);
    } else if (this.data.type !== 'edit') {
      setTimeout(() => {
        this.addProvider();
      });
    }

    this.setupChannelForm(vehicle);
    this.setupOtherForms(vehicle);

    this.cdr.markForCheck();
  }

  handleChannelAliasClick(): void {
    const newState = this.allChannels !== true;
    this.handleAllChannelsClick(newState);
  }

  getProviderLabel(providerId: number | null | undefined): string | undefined {
    if (!providerId) return undefined;

    let result: string | undefined;
    this.providerOptions$
      .pipe(
        take(1),
        map(options => options.find(opt => opt.value === providerId)?.label),
        takeUntil(this.destroy$)
      )
      .subscribe(label => {
        result = label;
      });

    return result;
  }

  getDeviceLabel(providerIndex: number, deviceId: string | null | undefined): string | undefined {
    if (!deviceId) return undefined;

    const deviceOptions$ = this.deviceOptionsMap.get(providerIndex);
    if (!deviceOptions$) return undefined;

    let result: string | undefined;
    deviceOptions$
      .pipe(
        take(1),
        map(options => options.find(opt => opt.value === deviceId)?.label),
        takeUntil(this.destroy$)
      )
      .subscribe(label => {
        result = label;
      });

    return result;
  }

  getCameraChannels(): { channel: number; name: string; active: boolean }[] {
    const camera_channels: { channel: number; name: string; active: boolean }[] = [];

    for (let i = 0; i < 5; i++) {
      const control = this.channelSetForm.get(i.toString());

      if (control?.enabled && this.channelEnabled[i]) {
        const channelValue = control.value ?? '';
        const channelNumber = i + 1;

        camera_channels.push({
          channel: channelNumber,
          name: channelValue,
          active: true
        });
      }
    }

    return camera_channels;
  }
}
