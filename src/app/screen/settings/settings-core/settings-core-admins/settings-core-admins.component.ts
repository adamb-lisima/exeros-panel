import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { SettingsActions } from '../../settings.actions';
import { SettingsSelectors } from '../../settings.selectors';
import { AdminDialogData, SettingsCoreAdminsCreateDialogComponent } from './settings-core-admins-create-admin-dialog/settings-core-admins-create-dialog.component';

@Component({
  selector: 'app-settings-core-admins',
  templateUrl: './settings-core-admins.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreAdminsComponent implements OnInit {
  admins$ = this.store.select(SettingsSelectors.adminsResponse);
  perPage$ = this.store.select(SettingsSelectors.adminResponseParams).pipe(map(params => params.per_page));
  currentPage = 1;

  ngOnInit() {
    this.loadAdmins();
  }

  constructor(private readonly store: Store, private readonly dialog: Dialog) {}

  loadAdmins() {
    this.store.dispatch(
      SettingsActions.fetchAdminsList({
        params: {
          page: 1
        }
      })
    );
  }

  handleCreateAdminClick(): void {
    this.dialog.open<void, AdminDialogData>(SettingsCoreAdminsCreateDialogComponent, {
      data: {}
    });
  }

  handleUpdateAdmin(adminId: number): void {
    this.dialog.open<void, AdminDialogData>(SettingsCoreAdminsCreateDialogComponent, {
      data: { adminId }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.store.dispatch(
      SettingsActions.fetchAdminsList({
        params: {
          page
        }
      })
    );
  }
}
