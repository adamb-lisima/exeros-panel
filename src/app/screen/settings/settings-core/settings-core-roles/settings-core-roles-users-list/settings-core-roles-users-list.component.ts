import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { UserElement, UsersResponse } from '../../../settings.model';
import { SettingsCoreRolesUsersListLoginHistoryModalComponent } from './settings-core-roles-users-list-login-history/settings-core-roles-users-list-login-history-modal.component';

@Component({
  selector: 'app-settings-core-roles-users-list',
  templateUrl: './settings-core-roles-users-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreRolesUsersListComponent {
  @Output() deleteUser = new EventEmitter<UserElement>();
  @Output() resetPassword = new EventEmitter<UserElement>();
  @Output() editUser = new EventEmitter<UserElement>();
  @Output() resetMFA = new EventEmitter<UserElement>();

  @Input() data$?: Observable<UsersResponse | undefined>;

  constructor(private readonly dialog: MatDialog) {}

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

  openLoginHistory(user: UserElement): void {
    this.dialog.open(SettingsCoreRolesUsersListLoginHistoryModalComponent, {
      width: '700px',
      data: { user }
    });
  }
}
