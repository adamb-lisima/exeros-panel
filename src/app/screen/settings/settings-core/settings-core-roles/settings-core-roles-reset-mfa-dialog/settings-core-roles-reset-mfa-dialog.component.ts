import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';

@Component({
  templateUrl: './settings-core-roles-reset-mfa-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreRolesResetMfaDialogComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: { id: number; user: string }, private readonly dialogRef: DialogRef) {}

  handleCloseClick() {
    this.dialogRef.close();
  }

  handleResetClick() {
    this.store.dispatch(SettingsActions.resetMfa({ id: this.data.id }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.resetMfaSuccess]),
        takeUntil(this.destroy$),

        tap(() => this.store.dispatch(SettingsActions.fetchUsersResponse({ params: {} }))),
        tap(() => this.dialogRef.close())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
