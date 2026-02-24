import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent {
  @Input() step = 1;
  @Input() type: 'create' | 'edit' = 'create';
}
