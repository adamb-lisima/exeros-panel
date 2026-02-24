import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FleetsTreeElement } from 'src/app/store/common-objects/common-objects.model';
import { SettingsActions } from '../../../settings.actions';
import { AccessGroup, VehicleElement, VehicleResponse } from '../../../settings.model';
import { SettingsCoreFleetsVehicleEventStrategiesListModalComponent } from '../settings-core-fleets-vehicle-event-strategies-list-modal/settings-core-fleets-vehicle-event-strategies-list-modal.component';

@Component({
  selector: 'app-settings-core-fleets-fleet',
  templateUrl: './settings-core-fleets-fleet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreFleetsFleetComponent {
  @Output() deleteVehicle = new EventEmitter<VehicleElement>();
  @Output() addVehicle = new EventEmitter<VehicleElement>();
  @Output() editVehicle = new EventEmitter<VehicleElement>();
  @Output() editFleet = new EventEmitter();
  @Output() manageStrategies = new EventEmitter<VehicleElement>();
  @Output() vehicleCommission = new EventEmitter<VehicleElement>();

  @Input() data?: VehicleResponse | null;
  @Input() fleet?: FleetsTreeElement;

  constructor(private readonly dialog: MatDialog, private readonly store: Store) {}

  handleDeleteVehicleClick(vehicle: VehicleElement): void {
    this.deleteVehicle.emit(vehicle);
  }

  handleEditVehicleClick(vehicle: VehicleElement) {
    this.editVehicle.emit(vehicle);
  }

  handleEditFleetClick() {
    this.editFleet.emit();
  }

  handleAddVehicleClick() {
    this.addVehicle.emit();
  }

  handleVehicleCommissionClick(vehicle: VehicleElement) {
    this.vehicleCommission.emit(vehicle);
  }

  handleManageStrategiesClick(vehicle: VehicleElement) {
    this.dialog.open(SettingsCoreFleetsVehicleEventStrategiesListModalComponent, {
      width: '900px',
      data: { vehicle }
    });
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
