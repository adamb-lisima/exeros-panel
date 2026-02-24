import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from 'src/app/guard/authorized.guard';
import { SettingsCoreComponent } from './settings-core/settings-core.component';
import { SettingsTopComponent } from './settings-top/settings-top.component';
import { SettingsGuard } from './settings.guard';

export const SettingsRouting: Routes = [
  {
    path: RouteConst.settings,
    canActivate: [AuthorizedGuard, SettingsGuard],
    canDeactivate: [SettingsGuard],
    children: [
      { path: '', component: SettingsCoreComponent },
      { path: '', component: SettingsTopComponent, outlet: 'top-menu' }
    ]
  }
];
