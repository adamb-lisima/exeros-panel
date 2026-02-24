import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounceTime, filter, map, Subject, take, tap } from 'rxjs';
import { shareReplay, takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import ControlUtil from 'src/app/util/control';
import { AppState } from '../../../../../store/app-store.model';
import { CommonObjectsActions } from '../../../../../store/common-objects/common-objects.actions';
import { CommonObjectsSelectors } from '../../../../../store/common-objects/common-objects.selectors';
import { CommonObjectsService } from '../../../../../store/common-objects/common-objects.service';
import { SettingsActions } from '../../../settings.actions';
import { AccessGroup, CreateVehicleBody, ProviderForm, VehicleElement } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';
import { GeneralInfoComponent } from './add-vehicle/steps/general-info/general-info.component';
import { ProvidersSelectComponent } from './add-vehicle/steps/providers-select/providers-select.component';
import { VehicleLookupComponent } from './add-vehicle/steps/vehicle-lookup/vehicle-lookup.component';

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

enum DialogMode {
  ADD_NEW,
  EDIT_VEHICLE
}

@Component({
  templateUrl: './settings-core-fleets-new-vehicle-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreFleetsNewVehicleDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild(VehicleLookupComponent) vehicleLookupComponent!: VehicleLookupComponent;
  @ViewChild(GeneralInfoComponent) generalInfoComponent!: GeneralInfoComponent;
  @ViewChild(ProvidersSelectComponent) providersSelectComponent!: ProvidersSelectComponent;
  @Output() vehicleCommission = new EventEmitter<VehicleElement>();

  vehicleLookupLoading$ = this.store.select(SettingsSelectors.vehicleLookupLoading);
  vehicleLookupResult$ = this.store.select(SettingsSelectors.vehicleLookupResult);
  createdVehicle$ = this.store.select(SettingsSelectors.createdVehicle);
  createdVehicleId$ = this.store.select(SettingsSelectors.createdVehicleId);

  createdVehicleId: number | null = null;

  private completeVehicleData: any = {};

  dvlaData: any = null;
  selectedVehicles: VehicleChecked[] = [];

  isInitializing = true;

  readonly DateConst = DateConst;
  title = 'Add vehicle';

  searchControl = this.fb.control('');

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(
    map(data => {
      return ControlUtil.mapFleetsTreeToTreeControls(data);
    }),
    shareReplay(1)
  );

  createBodyGroup(): FormGroup {
    return this.fb.group<Nullable<CreateVehicleBody>>({
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
      camera_channels: [],
      driver_mode: undefined
    });
  }

  generalInfoBodyGroup = this.createBodyGroup();
  allVehicles: boolean | null = false;
  tempVehicles: VehicleChecked[] = [];
  vehicles: VehicleChecked[] = [];
  createdVehicle: VehicleElement | null = null;

  constructor(@Inject(DIALOG_DATA) public data: SettingsCoreFleetsNewVehicleDialogData, private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly fb: FormBuilder, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef, private readonly commonObjectsService: CommonObjectsService, private readonly ngZone: NgZone) {
    if (this.data.type === 'edit') {
      this.title = 'Edit vehicle';
      this.currentMode = DialogMode.EDIT_VEHICLE;
      this.currentStep = 1;
      this.totalSteps = 2;
    }
  }
  ngOnInit(): void {
    this.ngZone.run(() => {
      this.store.dispatch(
        SettingsActions.fetchCompaniesTree({
          params: { with_users: true, with_drivers: false, with_score: false }
        })
      );

      this.store.dispatch(CommonObjectsActions.fetchFleetsTree());

      if (this.data.type === 'edit' && 'vehicle' in this.data && this.data.vehicle) {
        this.store.dispatch(SettingsActions.fetchVehicle({ id: this.data.vehicle.id }));
      }

      this.createdVehicle$
        .pipe(
          filter(vehicle => !!vehicle),
          takeUntil(this.destroy$)
        )
        .subscribe(vehicle => {
          this.createdVehicle = vehicle;
          this.createdVehicleId = vehicle?.id ?? null;
          this.cdr.markForCheck();
        });

      this.store.dispatch(SettingsActions.fetchVehicleReset());
    });

    this.cdr.markForCheck();

    this.searchControl.valueChanges
      .pipe(
        filter((value): value is string => value != null),
        debounceTime(200),
        tap(value => {
          this.tempVehicles = this.getTempVehicles(value, this.vehicles);
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTempVehicles(searchValue: string, vehicles: VehicleChecked[]): VehicleChecked[] {
    return this.getFilteredVehicles(searchValue, vehicles).sort(this.sortVehicles);
  }

  private getFilteredVehicles(searchValue: string, vehicles: VehicleChecked[]) {
    if (searchValue != '') {
      const search = searchValue.toLowerCase();
      return vehicles.filter(vehicle => {
        const name = vehicle.brand + ' ' + vehicle.model;
        return name.toLowerCase().includes(search) ?? vehicle.registrationPlate.toLowerCase().includes(search);
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

  DialogMode = DialogMode;
  currentMode = DialogMode.ADD_NEW;

  currentStep = 1;
  totalSteps = 4;

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onStepChange(step: number): void {
    this.currentStep = step;
  }

  handleDvlaDataReceived(data: any): void {
    this.dvlaData = data;
    this.cdr.detectChanges();
  }

  validateCurrentStep(): void {
    const stepData = this.getAllFormData(this.currentStep);
    const validationStep = this.determineValidationStep();

    if (this.data.type === 'create') {
      this.handleCreateTypeValidation(stepData, validationStep);
    } else {
      this.handleEditTypeValidation(stepData, validationStep);
    }
  }

  private determineValidationStep(): number {
    if (this.data.type === 'edit') {
      return this.currentStep === 1 ? 2 : 4;
    }
    return this.currentStep;
  }

  private handleCreateTypeValidation(stepData: any, validationStep: number): void {
    this.updateCompleteVehicleDataForCreate(stepData);

    this.store.dispatch(
      SettingsActions.validateVehicleStep({
        body: {
          ...this.completeVehicleData,
          only_validation: true,
          step: validationStep
        } as CreateVehicleBody,
        step: validationStep
      })
    );
  }

  private updateCompleteVehicleDataForCreate(stepData: any): void {
    if (this.currentStep <= 2) {
      this.completeVehicleData = { ...stepData };
    } else if (this.currentStep === 3) {
      this.completeVehicleData = {
        ...this.completeVehicleData,
        ...stepData
      };
    }
  }

  private handleEditTypeValidation(stepData: any, validationStep: number): void {
    this.updateCompleteVehicleDataForEdit(stepData);

    const validationBody = {
      ...this.completeVehicleData,
      only_validation: true,
      step: validationStep
    };

    this.store.dispatch(
      SettingsActions.validateVehicleEditStep({
        id: (this.data as any).vehicle.id,
        body: validationBody as CreateVehicleBody,
        step: validationStep
      })
    );
  }

  private updateCompleteVehicleDataForEdit(stepData: any): void {
    this.completeVehicleData = {
      ...this.completeVehicleData,
      ...stepData
    };

    if (this.currentStep === 1) {
      this.addGeneralInfoDataIfAvailable();
    } else if (this.currentStep === 2) {
      this.addProvidersIfMissing();
    }
  }

  private addGeneralInfoDataIfAvailable(): void {
    if (this.generalInfoComponent) {
      const generalInfoForm = this.generalInfoComponent.bodyGroup.getRawValue();
      this.completeVehicleData = {
        ...this.completeVehicleData,
        ...generalInfoForm
      };
    }
  }

  private addProvidersIfMissing(): void {
    if ((!this.completeVehicleData.providers || this.completeVehicleData.providers.length === 0) && this.providersSelectComponent) {
      this.completeVehicleData.providers = this.providersSelectComponent.getProviders();
    }
  }

  getAllFormData(currentStep: number): any {
    switch (currentStep) {
      case 1:
        return this.getVehicleLookupData();
      case 2:
        return this.getGeneralInfoData();
      case 3:
        return this.getProvidersData();
      default:
        return {};
    }
  }

  private getVehicleLookupData(): any {
    if (!this.vehicleLookupComponent) {
      return {};
    }

    return {
      registration_plate: this.vehicleLookupComponent.getRegPlateValue()
    };
  }

  private getGeneralInfoData(): any {
    if (!this.generalInfoComponent) {
      return {};
    }

    const formData: any = {};
    const generalInfoForm = this.generalInfoComponent.bodyGroup;

    if (this.completeVehicleData.registration_plate) {
      formData.registration_plate = this.completeVehicleData.registration_plate;
    }

    if (generalInfoForm.get('registration_plate')?.value) {
      formData.registration_plate = generalInfoForm.get('registration_plate')?.value;
    }

    this.extractGeneralInfoValues(formData, generalInfoForm);

    if (!formData.fleet_id && this.data.fleetId) {
      formData.fleet_id = this.data.fleetId;
    }

    return formData;
  }

  private extractGeneralInfoValues(formData: any, generalInfoForm: any): void {
    const fields = ['brand_name', 'model_name', 'type', 'fleet_id', 'bus_id', 'mot_expiry_due', 'service_due', 'colour', 'fuel_type', 'fuel_capacity', 'gross_vehicle_weight', 'channel_count', 'protocol', 'transmit_ip', 'transmit_port', 'route'];

    fields.forEach(field => {
      formData[field] = generalInfoForm.get(field)?.value;
    });
  }

  private getProvidersData(): any {
    if (!this.providersSelectComponent) {
      return {};
    }

    const formData: any = {};

    this.extractProviders(formData);
    this.extractChannels(formData);
    this.extractSimCardData(formData);
    this.extractFileFormsData(formData);

    return formData;
  }

  private extractProviders(formData: any): void {
    if (!this.providersSelectComponent) {
      return;
    }

    const providers = this.providersSelectComponent.getProviders();

    if (providers && providers.length > 0) {
      formData.providers = providers.map(provider => {
        if (provider.provider_type === 'STREAMAX') {
          const result = {
            ...provider,
            transmit_ip: provider.transmit_ip ?? undefined,
            transmit_port: provider.transmit_port ?? undefined
          };
          return result;
        }
        return provider;
      });
    } else if (this.data.type === 'edit' && this.providersSelectComponent.originalProviders.length > 0) {
      formData.providers = this.providersSelectComponent.originalProviders.map((provider: any, index: number) => {
        const providerData: any = {
          provider_id: provider.provider_id,
          vehicle_device_id: provider.details?.vehicle_device_id ?? provider.vehicle_device_id,
          mode: 'assign',
          order: index + 1
        };

        if (provider.provider_type === 'STREAMAX') {
          providerData.transmit_ip = provider.details?.transmit_ip ?? provider.transmit_ip ?? undefined;
          providerData.transmit_port = provider.details?.transmit_port ?? provider.transmit_port ?? undefined;
        }

        return providerData;
      });
    } else {
      formData.providers = [];
    }
  }

  private extractChannels(formData: any): void {
    if (!this.providersSelectComponent?.channelSetForm) {
      return;
    }

    const channels: string[] = [];
    for (let i = 0; i < 5; i++) {
      const control = this.providersSelectComponent.channelSetForm.get(i.toString());

      if (control && !control.disabled && control.value) {
        channels.push(control.value);
      }
    }

    if (channels.length > 0) {
      formData.channels = channels;
    }

    const cameraChannels = this.providersSelectComponent.getCameraChannels();
    if (cameraChannels.length > 0) {
      formData.camera_channels = cameraChannels;
    }
  }

  private extractSimCardData(formData: any): void {
    if (!this.providersSelectComponent.simCardForm) {
      return;
    }

    const simCardForm = this.providersSelectComponent.simCardForm;
    const simFields = ['sim_no', 'imei', 'imsi', 'network_module_type'];

    simFields.forEach(field => {
      if (simCardForm.get(field)?.value) {
        formData[field] = simCardForm.get(field)?.value;
      }
    });
  }

  private extractFileFormsData(formData: any): void {
    this.extractFormControls(formData, this.providersSelectComponent.vehicleFileForm?.controls);

    this.extractFormControls(formData, this.providersSelectComponent.equipmentFileForm?.controls);
  }

  private extractFormControls(formData: any, controls: any): void {
    if (!controls) {
      return;
    }

    Object.entries(controls).forEach(([key, control]: [string, any]) => {
      if (control.value) {
        formData[key] = control.value;
      }
    });
  }

  nextStepWithValidation(): void {
    if ((this.currentStep === 2 && this.currentMode === DialogMode.ADD_NEW) || (this.currentStep === 1 && this.currentMode === DialogMode.EDIT_VEHICLE)) {
      if (!this.generalInfoComponent) {
        return;
      }

      if (!this.generalInfoComponent.validateForm()) {
        return;
      }
    }

    this.validateCurrentStep();

    setTimeout(() => {
      this.currentStep++;
      this.cdr.markForCheck();
    });
  }

  handleGeneralInfoNext(): void {
    if ((this.currentStep === 2 && this.currentMode === DialogMode.ADD_NEW) || (this.currentStep === 1 && this.currentMode === DialogMode.EDIT_VEHICLE)) {
      if (this.generalInfoComponent && !this.generalInfoComponent.validateForm()) {
        return;
      }
    }
    this.nextStep();
  }

  createVehicle(): void {
    this.initializeVehicleDataIfEmpty();

    if (Object.keys(this.completeVehicleData).length === 0) {
      return;
    }

    const { only_validation, step, ...vehicleData } = this.completeVehicleData;

    this.processProvidersIfNeeded(vehicleData);

    this.normalizeProviders(vehicleData);

    this.dispatchCreateVehicleAction(vehicleData);
  }

  private initializeVehicleDataIfEmpty(): void {
    if (Object.keys(this.completeVehicleData).length === 0) {
      const providersData = this.providersSelectComponent ? this.getAllFormData(3) : {};

      this.completeVehicleData = {
        ...this.completeVehicleData,
        ...providersData
      };
    }
  }

  private processProvidersIfNeeded(vehicleData: any): void {
    if (!this.providersSelectComponent || vehicleData.providers?.length > 0) {
      return;
    }

    try {
      const directProviders = this.providersSelectComponent.getProviders();
      if (directProviders?.length > 0) {
        vehicleData.providers = directProviders;
        return;
      }

      if (this.providersSelectComponent.providersFormArray?.length > 0) {
        vehicleData.providers = this.extractProvidersFromFormArray();
        return;
      }

      if (this.providersSelectComponent.originalProviders?.length > 0) {
        vehicleData.providers = this.extractProvidersFromOriginalProviders();
      }
    } catch (error) {
      console.error('Error getting providers from component:', error);
    }
  }

  private extractProvidersFromFormArray(): any[] {
    const formArrayProviders = [];

    for (let i = 0; i < this.providersSelectComponent.providersFormArray.length; i++) {
      const control = this.providersSelectComponent.providersFormArray.at(i);
      const values = control.value;

      if (!values.provider_id) {
        continue;
      }

      const isSmax = this.getProviderTypeById(values.provider_id) === 'STREAMAX';
      const provider = this.createProviderFromFormValues(values, isSmax, i);
      formArrayProviders.push(provider);
    }

    return formArrayProviders;
  }

  private getProviderTypeById(providerId: number): string {
    if (this.providersSelectComponent?.originalProviders) {
      const provider = this.providersSelectComponent.originalProviders.find(p => p.provider_id === providerId);
      if (provider) return provider.provider_type;
    }

    const providers = this.providersSelectComponent?.getProviders() || [];
    const provider = providers.find(p => p.provider_id === providerId);
    return provider?.provider_type ?? '';
  }

  private createProviderFromFormValues(values: any, isSmax: boolean, index: number): any {
    const provider = {
      provider_id: values.provider_id,
      vehicle_device_id: values.device_id ?? null,
      mode: isSmax ? 'create' : 'assign',
      order: index + 1
    } as any;

    if (isSmax) {
      provider.transmit_ip = values.transmit_ip ?? '0.0.0.0';
      provider.transmit_port = values.transmit_port ?? 8080;
    }

    return provider;
  }

  private extractProvidersFromOriginalProviders(): any[] {
    return this.providersSelectComponent.originalProviders.map((provider: any, index: number) => {
      const providerData = {
        provider_id: provider.provider_id,
        vehicle_device_id: provider.details?.vehicle_device_id ?? provider.vehicle_device_id ?? provider.device_id ?? null,
        mode: 'assign',
        order: index + 1
      } as any;

      if (provider.provider_type === 'STREAMAX') {
        providerData.transmit_ip = provider.details?.transmit_ip ?? provider.transmit_ip ?? '0.0.0.0';
        providerData.transmit_port = provider.details?.transmit_port ?? provider.transmit_port ?? 8080;
      }

      return providerData;
    });
  }

  private normalizeProviders(vehicleData: any): void {
    if (!vehicleData.providers || !Array.isArray(vehicleData.providers)) {
      vehicleData.providers = [];
      return;
    }

    vehicleData.providers = vehicleData.providers.map((provider: any) => {
      if (!provider.mode) {
        return this.addDefaultModeToProvider(provider);
      }

      if (provider.provider_type === 'STREAMAX') {
        return this.ensureSmaxProviderFields(provider);
      }

      return provider;
    });
  }

  private addDefaultModeToProvider(provider: any): any {
    const isSmax = provider.provider_type === 'STREAMAX';
    const defaultMode = isSmax ? 'create' : 'assign';

    if (isSmax) {
      return {
        ...provider,
        mode: defaultMode,
        transmit_ip: provider.transmit_ip ?? '0.0.0.0',
        transmit_port: provider.transmit_port ?? 8080
      };
    }

    return {
      ...provider,
      mode: defaultMode
    };
  }

  private ensureSmaxProviderFields(provider: any): any {
    return {
      ...provider,
      transmit_ip: provider.transmit_ip ?? '0.0.0.0',
      transmit_port: provider.transmit_port ?? 8080
    };
  }

  private dispatchCreateVehicleAction(vehicleData: any): void {
    this.store.dispatch(
      SettingsActions.createVehicle({
        body: vehicleData as CreateVehicleBody
      })
    );

    this.actions$
      .pipe(
        ofType(SettingsActions.createVehicleSuccess),
        take(1),
        tap(() => {
          this.store.dispatch(
            SettingsActions.fetchFleetsTree({
              params: {
                show_vehicles: false,
                with_profiles: false,
                fleet_ids: undefined
              }
            })
          );

          this.currentStep = 4;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  handleVehicleCommissionClick(vehicle?: VehicleElement | null): void {
    if (vehicle?.id) {
      this.dialogRef.close({
        action: 'commission',
        vehicle: vehicle
      });
    } else if (this.createdVehicle) {
      this.dialogRef.close({
        action: 'commission',
        vehicle: this.createdVehicle
      });
    } else if (this.createdVehicleId) {
      this.dialogRef.close({
        action: 'commission',
        vehicle: { id: this.createdVehicleId } as VehicleElement
      });
    } else {
      console.error('No valid vehicle found for commission');
    }
  }

  handleLookupAndProceedWithValidation(): void {
    if (this.vehicleLookupComponent?.isFormValid()) {
      const regPlate = this.vehicleLookupComponent.getRegPlateValue();

      this.vehicleLookupComponent.isLoading = true;
      this.vehicleLookupComponent.vehicleNotFound = false;

      this.store.dispatch(SettingsActions.lookupVehicle({ regPlate }));

      this.completeVehicleData = {
        registration_plate: regPlate
      };

      const timeoutId1 = setTimeout(() => {
        this.vehicleLookupResult$.pipe(take(1), takeUntil(this.destroy$)).subscribe(result => {
          this.vehicleLookupComponent.isLoading = false;

          if (result) {
            this.dvlaData = result;
          } else {
            this.vehicleLookupComponent.vehicleNotFound = true;
            this.dvlaData = null;
          }

          this.validateCurrentStep();
          this.nextStep();
          this.cdr.detectChanges();
        });
      }, 1000);

      const timeoutId2 = setTimeout(() => {
        if (this.currentStep === 1) {
          this.vehicleLookupComponent.isLoading = false;
          this.vehicleLookupComponent.vehicleNotFound = true;

          this.validateCurrentStep();
          this.nextStep();
          this.cdr.detectChanges();
        }
      }, 5000);

      this.destroy$.pipe(take(1), takeUntil(this.destroy$)).subscribe(() => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
      });
    } else if (this.vehicleLookupComponent) {
      this.vehicleLookupComponent.lookupForm.markAllAsTouched();
    }
  }

  updateVehicle(): void {
    if (this.data.type !== 'edit') {
      return;
    }

    this.prepareVehicleData();

    if (Object.keys(this.completeVehicleData).length === 0) {
      return;
    }

    const { only_validation, step, ...vehicleData } = this.completeVehicleData;

    this.processChannelsIfNeeded(vehicleData);
    this.processProvidersIfNeeded(vehicleData);
    this.processCameraChannelsIfNeeded(vehicleData);

    this.dispatchUpdateAction(vehicleData);
  }

  private prepareVehicleData(): void {
    const generalInfoData = this.generalInfoComponent ? this.getAllFormData(1) : {};

    const providersData = this.providersSelectComponent ? this.getAllFormData(2) : {};

    this.completeVehicleData = {
      ...this.completeVehicleData,
      ...generalInfoData,
      ...providersData
    };
  }

  private processChannelsIfNeeded(vehicleData: any): void {
    if (this.providersSelectComponent && !vehicleData.channels) {
      const channels: string[] = [];

      Object.keys(this.providersSelectComponent.channelSetForm.controls).forEach(key => {
        const control = this.providersSelectComponent.channelSetForm.get(key);
        if (control && !control.disabled && control.value) {
          channels[parseInt(key)] = control.value;
        }
      });

      const nonEmptyChannels = channels.filter(Boolean);
      if (nonEmptyChannels.length > 0) {
        vehicleData.channels = nonEmptyChannels;
      }
    }
  }

  private setProvidersFromComponent(vehicleData: any): void {
    if (this.providersSelectComponent) {
      vehicleData.providers = this.providersSelectComponent.getProviders();

      if (!vehicleData.providers || vehicleData.providers.length === 0) {
        this.setProvidersFromOriginalProviders(vehicleData);
      }
    }
  }

  private setProvidersFromOriginalProviders(vehicleData: any): void {
    if (this.providersSelectComponent?.originalProviders.length > 0) {
      vehicleData.providers = this.providersSelectComponent.originalProviders.map((provider: any, index: number) => this.createProviderData(provider, index));
    }
  }

  private createProviderData(provider: any, index: number): any {
    const providerData: any = {
      provider_id: provider.provider_id,
      vehicle_device_id: this.getFirstNonEmptyValue(provider.details?.vehicle_device_id, provider.vehicle_device_id),
      mode: 'assign',
      order: index + 1
    };

    if (provider.provider_type === 'STREAMAX') {
      providerData.transmit_ip = this.getFirstNonEmptyValue(provider.details?.transmit_ip, provider.transmit_ip, '0.0.0.0');

      providerData.transmit_port = this.getFirstNonEmptyValue(provider.details?.transmit_port, provider.transmit_port, 8080);
    }

    return providerData;
  }

  private getFirstNonEmptyValue(...values: any[]): any {
    for (const val of values) {
      if (val !== '' && val !== null && val !== undefined) {
        return val;
      }
    }
    return values[values.length - 1];
  }

  private updateExistingProviders(vehicleData: any): void {
    vehicleData.providers = vehicleData.providers.map((provider: { provider_id: number; provider_type: string; transmit_ip?: string; transmit_port?: number }) => {
      if (provider.provider_type === 'STREAMAX') {
        return {
          ...provider,
          transmit_ip: provider.transmit_ip ?? '0.0.0.0',
          transmit_port: provider.transmit_port ?? 8080
        };
      }
      return provider;
    });
  }

  private processCameraChannelsIfNeeded(vehicleData: any): void {
    if (this.providersSelectComponent && !vehicleData.camera_channels) {
      const cameraChannels = this.providersSelectComponent.getCameraChannels();
      if (cameraChannels.length > 0) {
        vehicleData.camera_channels = cameraChannels;
      }
    }
  }

  private dispatchUpdateAction(vehicleData: any): void {
    if (this.data.type !== 'edit' || !('vehicle' in this.data)) {
      return;
    }

    this.store.dispatch(
      SettingsActions.updateVehicle({
        id: this.data.vehicle.id,
        body: vehicleData as CreateVehicleBody
      })
    );

    this.actions$
      .pipe(
        ofType(SettingsActions.updateVehicleSuccess),
        take(1),
        tap(() => {
          this.store.dispatch(SettingsActions.fetchVehicleResponse({ params: {} }));
          this.store.dispatch(
            SettingsActions.fetchFleetsTree({
              params: {
                show_vehicles: false,
                with_profiles: false,
                fleet_ids: undefined
              }
            })
          );

          this.dialogRef.close();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  onVehicleSelectionChange(event: { allVehicles: boolean | null; checkedVehicles: VehicleChecked[] }) {
    this.allVehicles = event.allVehicles;
    this.selectedVehicles = event.checkedVehicles;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  protected readonly accessGroup = AccessGroup;
}
