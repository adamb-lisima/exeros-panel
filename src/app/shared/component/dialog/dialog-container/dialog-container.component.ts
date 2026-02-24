import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Input, NgZone } from '@angular/core';

@Component({
  selector: 'app-dialog-container',
  templateUrl: './dialog-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogContainerComponent {
  @Input() title = '';

  constructor(private readonly dialogRef: DialogRef, private readonly ngZone: NgZone) {}

  handleCloseClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.ngZone.run(() => {
      this.dialogRef.close();
    });
  }

  handleCloseKeyDown(): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.handleCloseClick(syntheticMouseEvent);
  }
}
