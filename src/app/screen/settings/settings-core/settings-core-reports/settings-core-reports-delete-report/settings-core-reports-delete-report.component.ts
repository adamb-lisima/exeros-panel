import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from '../../../../../util/operators';
import { SettingsActions } from '../../../settings.actions';

@Component({
  selector: 'app-settings-core-reports-delete-report',
  templateUrl: './settings-core-reports-delete-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreReportsDeleteReportComponent implements OnDestroy {
  constructor(private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: { id: number; name: string; company: string }, private readonly dialogRef: DialogRef) {}
  private readonly destroy$ = new Subject<void>();

  handleCloseClick() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleDeleteReportClick() {
    this.store.dispatch(SettingsActions.deleteReport({ id: this.data.id }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.deleteReportSuccess]),
        takeUntil(this.destroy$),
        tap(() => this.dialogRef.close()),
        tap(() => this.store.dispatch(SettingsActions.fetchReportResponse({ params: {} })))
      )
      .subscribe();
  }
}
