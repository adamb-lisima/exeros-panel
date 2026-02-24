import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from 'src/app/guard/authorized.guard';
import { TelematicsCoreComponent } from './telematics-core/telematics-core.component';
import { TelematicsLeftComponent } from './telematics-left/telematics-left.component';
import { TelematicsTopComponent } from './telematics-top/telematics-top.component';
import { TelematicsGuard } from './telematics.guard';

export const TelematicsRouting: Routes = [
  {
    path: RouteConst.telematics,
    canActivate: [AuthorizedGuard, TelematicsGuard],
    canDeactivate: [TelematicsGuard],
    children: [
      { path: '', component: TelematicsCoreComponent },
      { path: '', component: TelematicsLeftComponent, outlet: 'left-menu' },
      { path: '', component: TelematicsTopComponent, outlet: 'top-menu' }
    ]
  }
];
