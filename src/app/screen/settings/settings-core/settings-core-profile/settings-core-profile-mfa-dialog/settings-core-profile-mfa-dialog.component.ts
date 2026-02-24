import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { MfaExecuteParams, MfaParams } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-profile-mfa-dialog',
  templateUrl: './settings-core-profile-mfa-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreProfileMFADialogComponent implements OnDestroy, OnInit {
  private readonly destroy$ = new Subject<void>();

  bodyGroup = this.fb.group<Nullable<MfaExecuteParams>>({
    code: '',
    type: this.data.is_mfa_enabled ? 'DISABLE' : 'ENABLE'
  });

  constructor(private readonly fb: FormBuilder, private readonly actions$: Actions, private readonly store: Store, private readonly dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: { is_mfa_enabled: boolean }) {}

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.sendMfa({ body: this.bodyGroup.value as MfaParams }));
  }

  handleSendCodeClick(): void {
    if (this.bodyGroup.dirty) {
      this.store.dispatch(SettingsActions.executeMfa({ body: this.bodyGroup.value as MfaExecuteParams }));
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.executeMfaSuccess]),
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
