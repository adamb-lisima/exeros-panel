import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { Role } from 'src/app/model/role.model';

@Component({
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  @HostBinding('class.h-full') hostClassHFull = true;
  @HostBinding('class.overflow-auto') hostClassOverflowAuto = true;

  readonly ROLE = Role;
}
