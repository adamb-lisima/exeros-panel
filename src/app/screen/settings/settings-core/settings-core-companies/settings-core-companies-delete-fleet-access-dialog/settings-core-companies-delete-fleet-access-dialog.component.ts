import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, tap } from 'rxjs';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';

@Component({
  selector: 'app-settings-core-companies-delete-fleet-access-dialog',
  templateUrl: './settings-core-companies-delete-fleet-access-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreCompaniesDeleteFleetAccessDialogComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: { id: number; fleetAccess: string; company: string; company_id: number }, private readonly dialogRef: DialogRef) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCloseClick() {
    this.dialogRef.close();
  }

  handleDeleteFleetAccessClick() {
    this.store.dispatch(SettingsActions.deleteFleetAccess({ id: this.data.id, company_id: this.data.company_id }));
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.deleteFleetAccessSuccess]),
        tap(() => {
          this.store.dispatch(
            SettingsActions.fetchFleetAccess({
              params: { company_id: this.data.company_id, page: 1, per_page: 100 }
            })
          );

          this.store.dispatch(
            SettingsActions.fetchFleetAccessFilter({
              params: { company_id: this.data.company_id, page: 1, per_page: 100 }
            })
          );

          this.store.dispatch(
            SettingsActions.fetchCompaniesTree({
              params: { with_users: true, with_drivers: false, with_score: false }
            })
          );

          this.dialogRef.close();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
