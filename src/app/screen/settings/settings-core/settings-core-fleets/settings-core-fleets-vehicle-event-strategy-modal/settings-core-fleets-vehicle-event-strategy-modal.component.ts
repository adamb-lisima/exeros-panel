import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { SettingsActions } from '../../../settings.actions';
import { CreateVehicleEventStrategySimpleRequest, EventStrategy, getAlarmTypeName, VehicleElement } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';

@Component({
  selector: 'app-settings-core-fleets-vehicle-event-strategy-modal',
  templateUrl: './settings-core-fleets-vehicle-event-strategy-modal.component.html'
})
export class SettingsCoreFleetsVehicleEventStrategyModalComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  availableStrategies: EventStrategy[] = [];
  selectedStrategy: EventStrategy | undefined;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<SettingsCoreFleetsVehicleEventStrategyModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      vehicle: VehicleElement;
    },
    private readonly store: Store
  ) {}

  private _selectOptions: SelectControl[] = [];

  get selectOptions(): SelectControl[] {
    if (this._selectOptions.length !== this.availableStrategies.length) {
      this._selectOptions = this.availableStrategies.map(strategy => ({
        value: strategy.id,
        label: `${strategy.name} - ${this.getAlarmTypeName(strategy.alarm_type_id)}`
      }));
    }
    return this._selectOptions;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadStrategies();
    this.subscribeToData();
    this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = this.fb.group({
      event_strategy_id: new FormControl<number | undefined>(undefined, Validators.required)
    });
  }

  private loadStrategies(): void {
    this.loading = true;
    this.store.dispatch(
      SettingsActions.fetchEventStrategiesResponse({
        params: { page: 1, per_page: 200 }
      })
    );
  }

  private subscribeToData(): void {
    this.store
      .select(SettingsSelectors.eventStrategiesResponse)
      .pipe(
        filter(response => !!response && !!response.data),
        takeUntil(this.destroy$)
      )
      .subscribe(response => {
        if (response && Array.isArray(response.data)) {
          this.availableStrategies = response.data;
          this._selectOptions = [];
          this.loading = false;
        }
      });
  }

  private subscribeToFormChanges(): void {
    this.form
      .get('event_strategy_id')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(strategyId => {
        if (strategyId) {
          this.selectedStrategy = this.availableStrategies.find(s => s.id === strategyId);
        } else {
          this.selectedStrategy = undefined;
        }
      });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const body: CreateVehicleEventStrategySimpleRequest = {
        vehicle_id: this.data.vehicle.id,
        event_strategy_id: this.form.value.event_strategy_id
      };

      this.store.dispatch(SettingsActions.createVehicleEventStrategySimple({ body }));
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getAlarmTypeName = getAlarmTypeName;
}
