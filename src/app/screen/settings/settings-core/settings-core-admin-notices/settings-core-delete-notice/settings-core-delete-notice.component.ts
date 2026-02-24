import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from '../../../../../util/operators';
import { SettingsActions } from '../../../settings.actions';

export interface DeleteNoticeData {
  id: number;
  title: string;
}

@Component({
  selector: 'app-settings-core-delete-notice',
  templateUrl: './settings-core-delete-notice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreDeleteNoticeComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(@Inject(DIALOG_DATA) public data: DeleteNoticeData, private readonly dialogRef: DialogRef, private readonly store: Store, private readonly actions$: Actions) {}

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleDeleteClick(): void {
    if (this.data && this.data.id) {
      this.store.dispatch(SettingsActions.deleteInfotainment({ id: this.data.id }));

      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.deleteInfotainmentSuccess]),
          takeUntil(this.destroy$),
          tap(() => {
            this.dialogRef.close(true);
            this.store.dispatch(SettingsActions.fetchInfotainments({ params: {} }));
          })
        )
        .subscribe();
    }
  }
}
