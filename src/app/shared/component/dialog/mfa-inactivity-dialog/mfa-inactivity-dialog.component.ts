import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MfaInactivityDialogData, MfaInactivityDialogReturn } from 'src/app/shared/component/dialog/mfa-inactivity-dialog/mfa-inactivity-dialog.model';
import AuthConst from '../../../../const/auth';
import { SettingsActions } from '../../../../screen/settings/settings.actions';
import { MfaExecuteParams } from '../../../../screen/settings/settings.model';
import { AuthActions } from '../../../../store/auth/auth.actions';
import { waitOnceForAction } from '../../../../util/operators';

@Component({
  templateUrl: './mfa-inactivity-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MfaInactivityDialogComponent implements OnDestroy {
  text = '';

  private readonly destroy$ = new Subject<void>();
  private actionSubscription?: Subscription;

  constructor(@Inject(DIALOG_DATA) public data: MfaInactivityDialogData, private readonly actions$: Actions, private readonly dialogRef: DialogRef<MfaInactivityDialogReturn>, private readonly store: Store) {}

  handleYesClick(): void {
    this.store.dispatch(SettingsActions.executeMfa({ body: { type: 'LOCK', code: this.text } as MfaExecuteParams }));

    this.actionSubscription = this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.executeMfaSuccess]),
        tap(() => (this.text = '')),
        tap(() => localStorage.setItem(AuthConst.LAST_ACTIVITY, new Date().getTime().toString())),
        tap(() => localStorage.setItem(AuthConst.INACTIVITY_STATUS, '0')),
        tap(() => this.dialogRef.close({ confirmed: true })),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (err: unknown) => console.error('Error handling MFA execution:', err)
      });
  }

  handleNoClick(): void {
    this.store.dispatch(AuthActions.logOut());
    this.dialogRef.close({ confirmed: false });
  }

  ngOnDestroy(): void {
    if (this.actionSubscription) {
      this.actionSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
