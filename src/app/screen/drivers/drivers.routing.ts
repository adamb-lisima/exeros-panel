import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from '../../guard/authorized.guard';
import { DriversCoreComponent } from './drivers-core/drivers-core.component';
import { DriversLeftComponent } from './drivers-left/drivers-left.component';
import { DriversTopComponent } from './drivers-top/drivers-top.component';
import { DriversGuard } from './drivers.guard';

export const DriversRouting: Routes = [
  {
    path: RouteConst.drivers,
    canActivate: [AuthorizedGuard, DriversGuard],
    canDeactivate: [DriversGuard],
    children: [
      { path: '', component: DriversCoreComponent },
      { path: '', component: DriversLeftComponent, outlet: 'left-menu' },
      { path: '', component: DriversTopComponent, outlet: 'top-menu' },
      { path: ':id', component: DriversCoreComponent },
      { path: ':id', component: DriversLeftComponent, outlet: 'left-menu' },
      { path: ':id', component: DriversTopComponent, outlet: 'top-menu' }
    ]
  }
];
