import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';

@Component({
  templateUrl: './settings-core-driver-reset-password-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreDriverResetPasswordDialogComponent implements OnDestroy {
  constructor(private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: { id: number; name: string }, private readonly dialogRef: DialogRef) {}
  private readonly destroy$ = new Subject<void>();

  handleResetClick() {
    this.store.dispatch(SettingsActions.resetPassword({ id: this.data.id }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.resetPasswordSuccess]),
        takeUntil(this.destroy$),
        tap(() => this.dialogRef.close())
      )
      .subscribe();
  }
  handleCloseClick() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
