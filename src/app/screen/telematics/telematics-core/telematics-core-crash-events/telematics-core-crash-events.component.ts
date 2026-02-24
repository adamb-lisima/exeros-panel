import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CrashEvent } from '../../mocks';

@Component({
  selector: 'app-telematics-core-crash-events',
  templateUrl: './telematics-core-crash-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsCoreCrashEventsComponent {
  @Input() crashEvents: CrashEvent[] = [];
}
