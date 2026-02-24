import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyElement, DriverElement, DriversResponse } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-driver-list',
  templateUrl: './settings-core-driver-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreDriverListComponent {
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

  handleDeleteDriverClick(user: DriverElement): void {
    this.deleteDriver.emit(user);
  }

  handleAddVehicleClick(user: DriverElement): void {
    this.addVehicle.emit(user);
  }

  handleReleaseVehicleClick(user: DriverElement): void {
    this.releaseVehicle.emit(user);
  }

  handleEditDriverClick(user: DriverElement) {
    this.editDriver.emit(user);
  }

  handleResetPasswordClick(user: DriverElement): void {
    this.resetPassword.emit(user);
  }
}
