import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { DriversActions } from '../../../drivers.actions';
import { DriversSelectors } from '../../../drivers.selectors';

export interface DriversCoreTabsChecksDialogData {
  id: number;
}

@Component({
  selector: 'app-drivers-core-tabs-checks-dialog',
  templateUrl: './drivers-core-tabs-checks-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreTabsChecksDialogComponent implements OnInit, OnDestroy {
  vehicleCheck$ = this.store.select(DriversSelectors.vehicleCheck);

  constructor(@Inject(DIALOG_DATA) public data: DriversCoreTabsChecksDialogData, private readonly dialogRef: DialogRef, private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(DriversActions.fetchVehicleCheck({ id: this.data.id }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(DriversActions.resetVehicleCheck());
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }
}
