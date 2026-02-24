import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FleetAccess, UserElement, UsersResponse } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-companies-fleet-access-assigned-users-list',
  templateUrl: './settings-core-companies-fleet-access-assigned-users-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreCompaniesFleetAccessAssignedUsersListComponent {
  @Output() createNewUser = new EventEmitter<void>();
  @Output() deleteUser = new EventEmitter<UserElement>();
  @Output() resetPassword = new EventEmitter<UserElement>();
  @Output() editUser = new EventEmitter<UserElement>();
  @Output() editFleetAccess = new EventEmitter<FleetAccess>();
  @Output() resetMFA = new EventEmitter<UserElement>();

  @Input() data?: UsersResponse | null;
  @Input() fleetAccess?: FleetAccess;

  handleCreateUserClick() {
    this.createNewUser.emit();
  }

  handleDeleteUserClick(user: UserElement): void {
    this.deleteUser.emit(user);
  }

  handleResetPasswordClick(user: UserElement): void {
    this.resetPassword.emit(user);
  }

  handleResetMFAClick(user: UserElement): void {
    this.resetMFA.emit(user);
  }

  handleEditUserClick(user: UserElement) {
    this.editUser.emit(user);
  }

  handleEditFleetAccessClick() {
    this.editFleetAccess.emit(this.fleetAccess);
  }
}
