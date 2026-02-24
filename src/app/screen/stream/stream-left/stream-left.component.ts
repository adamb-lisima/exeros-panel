import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AccessGroup } from '../../settings/settings.model';

@Component({
  templateUrl: './stream-left.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamLeftComponent {
  constructor() {}

  accessGroup = AccessGroup;
}
