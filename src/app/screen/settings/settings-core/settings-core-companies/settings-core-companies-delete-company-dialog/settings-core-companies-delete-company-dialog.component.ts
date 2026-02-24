import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';

@Component({
  selector: 'app-settings-core-companies-delete-company-dialog',
  templateUrl: './settings-core-companies-delete-company-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreCompaniesDeleteCompanyDialogComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  constructor(private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: { id: number; name: string }, private readonly dialogRef: DialogRef) {}

  handleCloseClick() {
    this.dialogRef.close();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleDeleteCompanyClick() {
    this.store.dispatch(SettingsActions.deleteCompany({ id: this.data.id }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.deleteCompanySuccess]),
        tap(() => this.dialogRef.close()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
