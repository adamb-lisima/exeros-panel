import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-vehicle-check-base-dialog',
  templateUrl: './vehicle-check-base-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleCheckBaseDialogComponent {
  @Input() vehicleCheck: any = null;
  @Output() closeDialog = new EventEmitter<void>();

  handleCloseClick(): void {
    this.closeDialog.emit();
  }
}
