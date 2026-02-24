import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-vehicle-mode-selection',
  templateUrl: './vehicle-mode-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleModeSelectionComponent {
  @Output() modeSelected = new EventEmitter<'add' | 'assign'>();

  selectAddMode(): void {
    this.modeSelected.emit('add');
  }

  selectAssignMode(): void {
    this.modeSelected.emit('assign');
  }
}
