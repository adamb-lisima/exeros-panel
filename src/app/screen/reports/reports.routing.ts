import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from 'src/app/guard/authorized.guard';
import { ReportsCoreComponent } from './reports-core/reports-core.component';
import { ReportsTopComponent } from './reports-top/reports-top.component';
import { ReportsGuard } from './reports.guard';

export const ReportsRouting: Routes = [
  {
    path: RouteConst.reports,
    canActivate: [AuthorizedGuard, ReportsGuard],
    canDeactivate: [ReportsGuard],
    children: [
      { path: '', component: ReportsCoreComponent },
      { path: '', component: ReportsTopComponent, outlet: 'top-menu' }
    ]
  }
];
