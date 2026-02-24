import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-success-add-vehicle',
  templateUrl: './success-add-vehicle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessAddVehicleComponent {
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
}
