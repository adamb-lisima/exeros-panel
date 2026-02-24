import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-telematics-core-card',
  templateUrl: './telematics-core-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsCoreCardComponent {
  @Input() title: string = '';
}
