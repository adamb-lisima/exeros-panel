import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { UpdatePasswordBody } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-profile-password-dialog',
  templateUrl: './settings-core-profile-password-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreProfilePasswordDialogComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  bodyGroup = this.fb.group<Nullable<UpdatePasswordBody>>({
    old_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  constructor(private readonly fb: FormBuilder, private readonly actions$: Actions, private readonly store: Store, private readonly dialogRef: DialogRef) {}

  handleChangePasswordClick(): void {
    if (this.bodyGroup.dirty) {
      this.store.dispatch(SettingsActions.updatePassword({ body: this.bodyGroup.value as UpdatePasswordBody }));
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.updatePasswordSuccess]),
          takeUntil(this.destroy$),
          tap(() => this.bodyGroup.reset()),
          tap(() => this.dialogRef.close())
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
