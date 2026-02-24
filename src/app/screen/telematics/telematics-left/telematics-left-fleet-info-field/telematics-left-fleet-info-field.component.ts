import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-telematics-left-fleet-info-field',
  templateUrl: './telematics-left-fleet-info-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsLeftFleetInfoFieldComponent {
  @Input() title: string = '';
}
