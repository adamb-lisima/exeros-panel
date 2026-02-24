import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from 'src/app/guard/authorized.guard';
import { RouteData } from 'src/app/model/route.models';
import { StreamCoreComponent } from 'src/app/screen/stream/stream-core/stream-core.component';
import { StreamLeftComponent } from 'src/app/screen/stream/stream-left/stream-left.component';
import { StreamTopComponent } from 'src/app/screen/stream/stream-top/stream-top.component';
import { StreamGuard } from 'src/app/screen/stream/stream.guard';
import { StreamMainComponent } from './stream-core/stream-main/stream-main.component';
import { StreamTopMainComponent } from './stream-top/stream-top-main/stream-top-main.component';

const data: RouteData = { hideNavBar: false, hideTopBar: true, removeContainerMargin: true };

export const StreamRouting: Routes = [
  {
    path: RouteConst.stream,
    canActivate: [AuthorizedGuard, StreamGuard],
    canDeactivate: [StreamGuard],
    children: [
      { path: '', component: StreamCoreComponent, data },
      { path: '', component: StreamLeftComponent, outlet: 'left-menu' },
      { path: '', component: StreamTopComponent, outlet: 'top-menu' }
    ]
  },
  {
    path: RouteConst.liveVideo,
    canActivate: [AuthorizedGuard, StreamGuard],
    canDeactivate: [StreamGuard],
    children: [
      { path: '', component: StreamMainComponent },
      { path: '', component: StreamTopMainComponent, outlet: 'top-menu' }
    ]
  }
];
