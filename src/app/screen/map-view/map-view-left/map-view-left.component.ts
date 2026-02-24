import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AccessGroup } from '../../settings/settings.model';

@Component({
  selector: 'app-map-view-left',
  templateUrl: './map-view-left.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewLeftComponent {
  accessGroup = AccessGroup;
}
