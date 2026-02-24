import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EventInformation } from '../../mocks';

@Component({
  selector: 'app-telematics-core-event-infos',
  templateUrl: './telematics-core-event-infos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsCoreEventInfosComponent {
  @Input() eventInfos: EventInformation[] = [];
}
