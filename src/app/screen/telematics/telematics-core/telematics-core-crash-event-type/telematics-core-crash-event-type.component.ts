import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CrashType } from '../../mocks';

@Component({
  selector: 'app-telematics-core-crash-event-type',
  templateUrl: './telematics-core-crash-event-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsCoreCrashEventTypeComponent {
  @Input() type?: CrashType;
}
