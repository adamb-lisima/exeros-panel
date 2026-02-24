import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DriverReview } from 'src/app/screen/events/events.model';

export interface ReviewConfirmData {
  driverReview: DriverReview | undefined;
  eventId: string;
}

@Component({
  selector: 'app-review-confirm',
  templateUrl: './review-confirm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewConfirmComponent {
  constructor(@Inject(DIALOG_DATA) public data: ReviewConfirmData, private readonly dialogRef: DialogRef<boolean>) {}

  handleReviewClick(): void {
    this.dialogRef.close(true);
  }

  handleCloseClick(): void {
    this.dialogRef.close(false);
  }
}
