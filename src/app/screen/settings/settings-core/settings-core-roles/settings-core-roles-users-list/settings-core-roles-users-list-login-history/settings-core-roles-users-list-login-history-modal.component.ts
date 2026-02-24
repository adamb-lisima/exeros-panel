import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserElement } from '../../../../settings.model';

interface LoginHistoryDialogData {
  user: UserElement;
}

@Component({
  templateUrl: './settings-core-roles-users-list-login-history-modal.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreRolesUsersListLoginHistoryModalComponent {
  title = `Login History - ${this.data.user.name}`;

  constructor(@Inject(DIALOG_DATA) public data: LoginHistoryDialogData, private readonly dialogRef: DialogRef) {}

  close(): void {
    this.dialogRef.close();
  }
}
