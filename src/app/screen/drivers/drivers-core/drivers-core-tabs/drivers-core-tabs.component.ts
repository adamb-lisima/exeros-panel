import { ChangeDetectionStrategy, Component } from '@angular/core';

type Mode = 'events' | 'alarms' | 'checks' | 'accidents';

@Component({
  selector: 'app-drivers-core-tabs',
  templateUrl: './drivers-core-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreTabsComponent {
  mode: Mode = 'events';

  handleModeClick(mode: Mode): void {
    this.mode = mode;
  }
}
