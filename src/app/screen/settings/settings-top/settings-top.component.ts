import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  templateUrl: './settings-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsTopComponent {
  @HostBinding('class') hostClass = 'w-full';
}
