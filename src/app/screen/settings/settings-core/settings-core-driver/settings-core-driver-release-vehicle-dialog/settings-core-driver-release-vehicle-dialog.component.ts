import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { AddVehicleBody } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-driver-release-vehicle-dialog',
  templateUrl: './settings-core-driver-release-vehicle-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreDriverReleaseVehicleDialogComponent implements OnDestroy {
  constructor(private readonly fb: FormBuilder, private readonly actions$: Actions, private readonly store: Store, private readonly dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: { id: number }) {}

  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  handleReleaseVehicleClick(): void {
    this.store.dispatch(SettingsActions.addVehicle({ id: this.data.id, body: { vehicle_id: undefined } as AddVehicleBody }));
    const sub = this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.addVehicleSuccess]),
        takeUntil(this.destroy$),
        tap(() => this.store.dispatch(SettingsActions.fetchDriverResponse({ params: {} }))),
        tap(() => this.dialogRef.close())
      )
      .subscribe();
    this.sub.add(sub);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
