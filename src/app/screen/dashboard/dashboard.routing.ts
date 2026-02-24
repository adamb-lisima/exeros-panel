import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from 'src/app/guard/authorized.guard';
import { DashboardCoreComponent } from 'src/app/screen/dashboard/dashboard-core/dashboard-core.component';
import { DashboardTopComponent } from 'src/app/screen/dashboard/dashboard-top/dashboard-top.component';
import { DashboardGuard } from 'src/app/screen/dashboard/dashboard.guard';

export const DashboardRouting: Routes = [
  {
    path: RouteConst.dashboard,
    canActivate: [AuthorizedGuard, DashboardGuard],
    canDeactivate: [DashboardGuard],
    children: [
      { path: '', component: DashboardCoreComponent },
      { path: '', component: DashboardTopComponent, outlet: 'top-menu' }
    ]
  }
];
