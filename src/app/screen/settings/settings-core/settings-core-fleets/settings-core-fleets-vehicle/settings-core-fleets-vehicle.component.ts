import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { SettingsActions } from '../../../settings.actions';
import { AccessGroup, VehicleElement, VehicleResponse } from '../../../settings.model';
import { SettingsCoreFleetsVehicleEventStrategiesListModalComponent } from '../settings-core-fleets-vehicle-event-strategies-list-modal/settings-core-fleets-vehicle-event-strategies-list-modal.component';

@Component({
  selector: 'app-settings-core-fleets-vehicle',
  templateUrl: './settings-core-fleets-vehicle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreFleetsVehicleComponent {
  @Output() deleteVehicle = new EventEmitter<VehicleElement>();
  @Output() editVehicle = new EventEmitter<VehicleElement>();
  @Output() commissionVehicle = new EventEmitter<VehicleElement>();

  @Input() data?: VehicleResponse | null;

  constructor(private readonly dialog: MatDialog, private readonly store: Store) {}

  handleDeleteVehicleClick(vehicle: VehicleElement): void {
    this.deleteVehicle.emit(vehicle);
  }

  handleEditVehicleClick(vehicle: VehicleElement) {
    this.editVehicle.emit(vehicle);
  }

  handleManageStrategiesClick(vehicle: VehicleElement) {
    this.dialog.open(SettingsCoreFleetsVehicleEventStrategiesListModalComponent, {
      width: '900px',
      data: { vehicle }
    });
  }

  handleCommissionClick(vehicle: VehicleElement) {
    this.commissionVehicle.emit(vehicle);
  }

  handleDownloadReportClick(vehicle: VehicleElement): void {
    if (!vehicle?.id) {
      return;
    }

    this.store.dispatch(
      SettingsActions.getVehicleStrategiesReport({
        vehicleId: vehicle.id
      })
    );
  }

  protected readonly accessGroup = AccessGroup;
}
