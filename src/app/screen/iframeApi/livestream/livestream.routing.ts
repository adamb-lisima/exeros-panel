import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from '../../../guard/authorized.guard';
import { RouteData } from '../../../model/route.models';
import { LivestreamCoreComponent } from './livestream-core/livestream-core.component';
import { LivestreamGuard } from './livestream.guard';

const data: RouteData = { hideTopBar: true, hideNavBar: true, removeContainerMargin: true };

export const LivestreamRouting: Routes = [
  {
    path: RouteConst.iframeApiLiveStream,
    canActivate: [AuthorizedGuard, LivestreamGuard],
    canDeactivate: [LivestreamGuard],
    children: [{ path: '', component: LivestreamCoreComponent, data }]
  }
];
