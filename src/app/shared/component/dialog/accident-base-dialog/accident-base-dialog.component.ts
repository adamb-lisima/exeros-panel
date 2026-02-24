import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { MapMarkerData } from 'src/app/model/map.model';
import { Accident } from 'src/app/service/http/accidents/accidents.model';

@Component({
  selector: 'app-accident-base-dialog',
  templateUrl: './accident-base-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccidentBaseDialogComponent {
  @Input() accident: Accident | null | undefined = null;
  @Input() markers: MapMarkerData[] = [];
  @Output() closeDialog = new EventEmitter<void>();

  handleCloseClick(): void {
    this.closeDialog.emit();
  }
}
