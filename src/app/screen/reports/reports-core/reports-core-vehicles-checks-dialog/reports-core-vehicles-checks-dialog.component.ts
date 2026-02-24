import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ReportsActions } from '../../reports.actions';
import { ReportsSelectors } from '../../reports.selectors';

export interface ReportsCoreVehiclesChecksDialogData {
  id: number;
}

@Component({
  selector: 'app-reports-core-vehicles-checks-dialog',
  templateUrl: './reports-core-vehicles-checks-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreVehiclesChecksDialogComponent implements OnInit, OnDestroy {
  vehicleCheck$ = this.store.select(ReportsSelectors.vehicleCheck);

  constructor(@Inject(DIALOG_DATA) public data: ReportsCoreVehiclesChecksDialogData, private readonly dialogRef: DialogRef, private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.fetchVehicleCheck({ id: this.data.id }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(ReportsActions.resetVehicleCheck());
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }
}
