import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';

@Component({
  selector: 'app-settings-core-event-strategies-delete-dialog',
  templateUrl: './settings-core-event-strategies-delete-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreEventStrategiesDeleteDialogComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: { id: number; strategy: string }, private readonly dialogRef: DialogRef) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  handleDeleteClick(): void {
    this.store.dispatch(SettingsActions.deleteEventStrategy({ id: this.data.id }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.deleteEventStrategySuccess]),
        tap(() => {
          this.store.dispatch(SettingsActions.fetchEventStrategiesResponse({ params: { page: 1 } }));
          this.dialogRef.close(true);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
