import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from 'src/app/service/theme/theme.service';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';
import NotificationUtil from 'src/app/util/notification';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';
import { AccessGroup, NotificationType } from '../../settings.model';
import { SettingsCoreProfileEditDialogComponent } from './settings-core-profile-edit-dialog/settings-core-profile-edit-dialog.component';
import { SettingsCoreProfileMFADialogComponent } from './settings-core-profile-mfa-dialog/settings-core-profile-mfa-dialog.component';
import { SettingsCoreProfilePasswordDialogComponent } from './settings-core-profile-password-dialog/settings-core-profile-password-dialog.component';

interface AllowedNotification {
  name: string;
  src: string;
}

@Component({
  selector: 'app-settings-core-profile',
  templateUrl: './settings-core-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreProfileComponent implements OnInit, OnDestroy {
  readonly themes: SelectControl<string>[] = [
    { value: 'default', label: 'Light mode' },
    { value: 'dark', label: 'Dark mode' }
  ];
  private readonly destroy$ = new Subject<void>();

  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  notifications$ = this.loggedInUser$.pipe(
    map(notifications => notifications?.allowed_notifications),
    map(notifications =>
      notifications
        ?.filter(notification => Object.values(NotificationType).includes(notification))
        .map(
          (notification): AllowedNotification => ({
            src: NotificationUtil.getIcon(notification),
            name: NotificationUtil.getName(notification)
          })
        )
    )
  );
  themeControl = this.fb.control(this.themeService.currentTheme);
  accessGroup = AccessGroup;

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly themeService: ThemeService, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.themeControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(mode => (this.themeService.currentTheme = mode!)),
        tap(() => this.themeService.loadTheme())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleChangePasswordClick(): void {
    this.dialog.open(SettingsCoreProfilePasswordDialogComponent);
  }

  handleMFAClick(isMfaEnabled: boolean): void {
    this.dialog.open<void, { is_mfa_enabled: boolean }>(SettingsCoreProfileMFADialogComponent, { data: { is_mfa_enabled: isMfaEnabled } });
  }

  handleEditClick(): void {
    this.dialog.open(SettingsCoreProfileEditDialogComponent);
  }
}
