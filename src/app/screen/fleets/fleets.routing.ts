import { Routes } from '@angular/router';
import RouteConst from '../../const/route';
import { AuthorizedGuard } from '../../guard/authorized.guard';
import { FleetsCoreComponent } from './fleets-core/fleets-core.component';
import { FleetsTopTimelineComponent } from './fleets-top/fleets-top-timeline/fleets-top-timeline.component';
import { FleetsGuard } from './fleets.guard';

export const FleetsRouting: Routes = [
  {
    path: RouteConst.fleets,
    canActivate: [AuthorizedGuard, FleetsGuard],
    canDeactivate: [FleetsGuard],
    children: [
      { path: '', component: FleetsCoreComponent },
      { path: '', component: FleetsTopTimelineComponent, outlet: 'top-menu' }
    ]
  }
];
