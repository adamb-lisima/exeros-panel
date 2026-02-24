import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { crashEvents, eventInformations, tripInfos } from '../mocks';

@Component({
  templateUrl: './telematics-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'h-full' }
})
export class TelematicsCoreComponent implements OnDestroy {
  private readonly sub?: Subscription;

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  eventInformations = eventInformations;
  crashEvents = crashEvents;
  tripInfos = tripInfos;
  idleTime = '3.5 Hrs';
  maxSpeed = '90 Mph';
}
