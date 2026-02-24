import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DriverReview } from '../../../../screen/events/events.model';

export interface ReasonRejectDialogData {
  driverReview: DriverReview | undefined;
  eventId: string;
}

export interface ReasonRejectDialogResult {
  confirmed: boolean;
  reason: string;
}

@Component({
  selector: 'app-reason-reject-dialog',
  templateUrl: './reason-reject-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReasonRejectDialogComponent {
  reason: string = '';

  constructor(@Inject(DIALOG_DATA) public data: ReasonRejectDialogData, private readonly dialogRef: DialogRef<ReasonRejectDialogResult>) {}

  handleRejectClick(): void {
    this.dialogRef.close({
      confirmed: true,
      reason: this.reason
    });
  }

  handleCancelClick(): void {
    this.dialogRef.close({
      confirmed: false,
      reason: ''
    });
  }
}
