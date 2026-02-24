import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { VehicleElement } from '../../../../settings.model';

@Component({
  selector: 'app-settings-core-fleets-commission-no-event-dialog',
  templateUrl: './settings-core-fleets-commission-no-event-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreFleetsCommissionNoEventDialogComponent {
  vehicleId: number = 0;

  constructor(private readonly dialogRef: DialogRef<boolean>, @Inject(DIALOG_DATA) public data: { vehicle?: VehicleElement }) {
    if (data?.vehicle) {
      this.vehicleId = data.vehicle.id;
    }
  }

  handleCloseClick(): void {
    this.dialogRef.close(false);
  }

  handleCompleteClick(): void {
    this.dialogRef.close(true);
  }
}
