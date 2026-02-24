import { ChangeDetectionStrategy, Component } from '@angular/core';

type Mode = 'events' | 'alarms' | 'checks' | 'accidents';

@Component({
  selector: 'app-vehicles-core-tabs',
  templateUrl: './vehicles-core-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreTabsComponent {
  mode: Mode = 'events';

  handleModeClick(mode: Mode): void {
    this.mode = mode;
  }
}
