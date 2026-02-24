import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { VehiclesActions } from '../../../vehicles.actions';
import { VehiclesSelectors } from '../../../vehicles.selectors';

export interface VehiclesCoreTabsChecksDialogData {
  id: number;
}

@Component({
  selector: 'app-vehicles-core-tabs-checks-dialog',
  templateUrl: './vehicles-core-tabs-checks-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreTabsChecksDialogComponent implements OnInit, OnDestroy {
  vehicleCheck$ = this.store.select(VehiclesSelectors.vehicleCheck);

  constructor(@Inject(DIALOG_DATA) public data: VehiclesCoreTabsChecksDialogData, private readonly dialogRef: DialogRef, private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(VehiclesActions.fetchVehicleCheck({ id: this.data.id }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(VehiclesActions.resetVehicleCheck());
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }
}
