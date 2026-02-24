import { Routes } from '@angular/router';
import RouteConst from '../../const/route';
import { UnauthorizedGuard } from '../../guard/unauthorized.guard';
import { WatchClipCoreComponent } from './watch-clip-core/watch-clip-core.component';

export const WatchClipRouting: Routes = [
  {
    path: `${RouteConst.clip}/:slug`,
    canActivate: [UnauthorizedGuard],
    component: WatchClipCoreComponent
  }
];
// http://localhost:4200/#/clip/3bD4cgR7oiuIAFkG
