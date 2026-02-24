import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { EventsChangeStatusDialogData, EventsChangeStatusDialogReturn } from './events-change-status-dialog.model';

@Component({
  templateUrl: './events-change-status-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsChangeStatusDialogComponent {
  text = '';
  driverFatigueText1 = '';
  driverFatigueText2 = '';
  driverFatigueText3 = '';
  select: string = '';
  countdown: number | null = null;

  driverFatigueSelection1: boolean | null = null;
  driverFatigueSelection2: boolean | null = null;
  driverFatigueSelection3: boolean | null = null;

  constructor(@Inject(DIALOG_DATA) public data: EventsChangeStatusDialogData, private readonly dialogRef: DialogRef<EventsChangeStatusDialogReturn>, private readonly cdr: ChangeDetectorRef) {}

  selectAnswer(questionNumber: number, answer: boolean): void {
    switch (questionNumber) {
      case 1:
        this.driverFatigueSelection1 = answer;
        this.driverFatigueText1 = answer ? 'Yes' : 'No';
        break;
      case 2:
        this.driverFatigueSelection2 = answer;
        this.driverFatigueText2 = answer ? 'Yes' : 'No';
        break;
      case 3:
        this.driverFatigueSelection3 = answer;
        this.driverFatigueText3 = answer ? 'Yes' : 'No';
        break;
    }
    this.cdr.markForCheck();
  }

  handleYesClick(): void {
    this.dialogRef.close({
      confirmed: true,
      text: this.text,
      select: this.select,
      driverFatigueText1: this.driverFatigueText1,
      driverFatigueText2: this.driverFatigueText2,
      driverFatigueText3: this.driverFatigueText3
    });
  }

  handleNoClick(): void {
    this.dialogRef.close({ confirmed: false });
  }
}
