import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleElement, UserElement, UsersResponse } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-roles-assigned-users-list',
  templateUrl: './settings-core-roles-assigned-users-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreRolesAssignedUsersListComponent {
  @Output() createNewUser = new EventEmitter<void>();
  @Output() deleteUser = new EventEmitter<UserElement>();
  @Output() resetPassword = new EventEmitter<UserElement>();
  @Output() editUser = new EventEmitter<UserElement>();
  @Output() editRole = new EventEmitter<RoleElement>();
  @Output() resetMFA = new EventEmitter<UserElement>();

  @Input() data$?: Observable<UsersResponse | undefined>;
  @Input() role?: RoleElement;

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

  handleEditRoleClick() {
    this.editRole.emit(this.role);
  }
}
