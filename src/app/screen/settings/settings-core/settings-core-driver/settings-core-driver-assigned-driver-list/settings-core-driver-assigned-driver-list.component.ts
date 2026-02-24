import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyElement, DriverElement, DriversResponse } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-driver-assigned-driver-list',
  templateUrl: './settings-core-driver-assigned-driver-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreDriverAssignedDriverListComponent {
  @Output() createNewDriver = new EventEmitter<void>();
  @Output() deleteDriver = new EventEmitter<DriverElement>();
  @Output() resetPassword = new EventEmitter<DriverElement>();
  @Output() editDriver = new EventEmitter<DriverElement>();
  @Output() releaseVehicle = new EventEmitter<DriverElement>();
  @Output() addVehicle = new EventEmitter<DriverElement>();

  @Input() data$?: Observable<DriversResponse | undefined>;
  @Input() company?: CompanyElement;

  handleCreateDriverClick() {
    this.createNewDriver.emit();
  }
  handleResetPasswordClick(driver: DriverElement): void {
    this.resetPassword.emit(driver);
  }

  handleAddVehicleClick(user: DriverElement): void {
    this.addVehicle.emit(user);
  }

  handleReleaseVehicleClick(user: DriverElement): void {
    this.releaseVehicle.emit(user);
  }

  handleDeleteDriverClick(driver: DriverElement): void {
    this.deleteDriver.emit(driver);
  }

  handleEditDriverClick(driver: DriverElement) {
    this.editDriver.emit(driver);
  }
}
