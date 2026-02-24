import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { DashboardActions } from '../../dashboard.actions';
import { DashboardSelectors } from '../../dashboard.selectors';

export interface DashboardCoreVehiclesChecksDialogData {
  id: number;
}

@Component({
  selector: 'app-dashboard-core-vehicles-checks-dialog',
  templateUrl: './dashboard-core-vehicles-checks-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCoreVehiclesChecksDialogComponent implements OnInit, OnDestroy {
  vehicleCheck$ = this.store.select(DashboardSelectors.vehicleCheck);
  constructor(@Inject(DIALOG_DATA) public data: DashboardCoreVehiclesChecksDialogData, private readonly dialogRef: DialogRef, private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.fetchVehicleCheck({ id: this.data.id }));
    this.store.dispatch(DashboardActions.fetchVehicleChecks({ params: {} }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(DashboardActions.resetVehicleCheck());
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }
}
