import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-telematics-left-from-to',
  templateUrl: './telematics-left-from-to.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsLeftFromToComponent {
  @Input() from: string = '';
  @Input() to: string = '';
}
