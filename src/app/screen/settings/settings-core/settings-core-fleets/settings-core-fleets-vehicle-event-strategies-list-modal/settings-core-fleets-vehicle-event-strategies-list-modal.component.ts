import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { SettingsActions } from '../../../settings.actions';
import { getAlarmTypeName, VehicleElement, VehicleEventStrategy } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';
import { SettingsCoreFleetsVehicleEventStrategyModalComponent } from '../settings-core-fleets-vehicle-event-strategy-modal/settings-core-fleets-vehicle-event-strategy-modal.component';

@Component({
  selector: 'app-settings-core-fleets-vehicle-event-strategies-list-modal',
  templateUrl: './settings-core-fleets-vehicle-event-strategies-list-modal.component.html'
})
export class SettingsCoreFleetsVehicleEventStrategiesListModalComponent implements OnInit, OnDestroy {
  strategies$: Observable<VehicleEventStrategy[] | undefined>;
  loading$: Observable<boolean>;
  private readonly destroy$ = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<SettingsCoreFleetsVehicleEventStrategiesListModalComponent>, @Inject(MAT_DIALOG_DATA) public data: { vehicle: VehicleElement }, private readonly store: Store, private readonly dialog: MatDialog) {
    this.strategies$ = this.store.select(SettingsSelectors.vehicleEventStrategies).pipe(map(response => response?.data));
    this.loading$ = this.store.select(SettingsSelectors.vehicleEventStrategiesLoading);
  }

  ngOnInit(): void {
    this.loadStrategies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStrategies(): void {
    this.store.dispatch(
      SettingsActions.fetchVehicleEventStrategies({
        vehicleId: this.data.vehicle.id
      })
    );
  }

  handleAddStrategyClick(): void {
    const dialogRef = this.dialog.open(SettingsCoreFleetsVehicleEventStrategyModalComponent, {
      width: '600px',
      data: { vehicle: this.data.vehicle }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.loadStrategies();
        }
      });
  }

  handleDeleteStrategyClick(strategy: VehicleEventStrategy): void {
    if (confirm(`Are you sure you want to remove this strategy from the vehicle?`)) {
      this.store.dispatch(SettingsActions.deleteVehicleEventStrategy({ id: strategy.id }));
      setTimeout(() => this.loadStrategies(), 500);
    }
  }

  onClose(): void {
    this.dialogRef.close();
    this.store.dispatch(SettingsActions.resetVehicleEventStrategies());
  }

  protected readonly getAlarmTypeName = getAlarmTypeName;
}
