import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ConfirmationDialogData, ConfirmationDialogReturn } from 'src/app/shared/component/dialog/confirmation-dialog/confirmation-dialog.model';

@Component({
  templateUrl: './confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent implements OnInit {
  text = '';
  countdown: number | null = null;

  constructor(@Inject(DIALOG_DATA) public data: ConfirmationDialogData, private readonly dialogRef: DialogRef<ConfirmationDialogReturn>, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.data.countdownTime) {
      this.startCountdown(this.data.countdownTime);
    }
  }

  startCountdown(seconds: number): void {
    this.countdown = seconds;

    const intervalId = setInterval(() => {
      if (this.countdown !== null) {
        this.countdown--;

        if (this.countdown <= 0) {
          clearInterval(intervalId);
          this.countdown = 0;
        }
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  handleYesClick(): void {
    this.dialogRef.close({ confirmed: true, text: this.text });
  }

  handleNoClick(): void {
    this.dialogRef.close({ confirmed: false });
  }
}
