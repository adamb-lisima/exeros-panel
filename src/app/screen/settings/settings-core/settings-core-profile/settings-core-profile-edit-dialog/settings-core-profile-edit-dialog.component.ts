import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { first, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthSelectors } from 'src/app/store/auth/auth.selectors';
import NotificationUtil from 'src/app/util/notification';
import { waitOnceForActions } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { NotificationType, UpdateAuthBody } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-profile-edit-dialog',
  templateUrl: './settings-core-profile-edit-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreProfileEditDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  bodyGroup = this.fb.group<any>({
    name: [{ value: undefined, disabled: false }, [Validators.required]]
  });

  email = '';
  role = '';

  notificationsForm = this.fb.group<{ [key in NotificationType]: boolean }>({
    ACCIDENTS: false,
    VEHICLE_CHECKS: false,
    VEHICLE_ISSUES: false,
    EVENT_ESCALATED: false,
    EVENT_OCCURRED: false
  });

  file?: File;
  emailNotifications: { src: string; name: string; type: NotificationType }[] = [NotificationType.VEHICLE_CHECKS, NotificationType.ACCIDENTS, NotificationType.EVENT_OCCURRED, NotificationType.EVENT_ESCALATED, NotificationType.VEHICLE_ISSUES].map(type => ({
    src: NotificationUtil.getIcon(type),
    name: NotificationUtil.getName(type),
    type: type
  }));

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialogRef: DialogRef, private readonly actions$: Actions) {}

  ngOnInit(): void {
    this.store
      .select(AuthSelectors.loggedInUser)
      .pipe(
        first(),
        tap(loggedInUser => {
          this.bodyGroup.reset({
            name: loggedInUser?.name
          });
          this.email = loggedInUser?.email ?? '';
          this.role = loggedInUser?.role ?? '';
          const allowedNotifications = (loggedInUser?.allowed_notifications ?? []).reduce((prev, type) => ({ ...prev, [type]: true }), {});
          this.notificationsForm.patchValue(allowedNotifications);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleAvatarChange(file: File): void {
    this.file = file;
  }

  handleSaveChanges(): void {
    const waitingActions = [];
    if (this.file) {
      this.store.dispatch(SettingsActions.updateAvatar({ file: this.file }));
      waitingActions.push(SettingsActions.updateAvatarSuccess);
    }
    if (this.bodyGroup.valid) {
      const allowed_notifications = Object.entries(this.notificationsForm.value)
        .filter(([_, value]) => value)
        .map(([key]) => key.toUpperCase());
      const body = {
        ...this.bodyGroup.value,
        email: this.email,
        allowed_notifications
      } as UpdateAuthBody;
      this.store.dispatch(SettingsActions.updateAuthUser({ body }));
      waitingActions.push(SettingsActions.updateAuthUserSuccess);
    }
    this.actions$
      .pipe(
        waitOnceForActions(waitingActions),
        tap(() => this.dialogRef.close()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
