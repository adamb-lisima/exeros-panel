import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './telematics-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'w-full' }
})
export class TelematicsTopComponent {}
