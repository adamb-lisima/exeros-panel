import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from 'src/app/guard/authorized.guard';
import { MapViewCoreComponent } from './map-view-core/map-view-core.component';
import { MapViewLeftComponent } from './map-view-left/map-view-left.component';
import { MapViewTopComponent } from './map-view-top/map-view-top.component';
import { MapViewGuard } from './map-view.guard';

export const MapViewRouting: Routes = [
  {
    path: RouteConst.mapView,
    canActivate: [AuthorizedGuard],
    canDeactivate: [MapViewGuard],
    children: [
      { path: '', component: MapViewCoreComponent },
      { path: '', component: MapViewLeftComponent, outlet: 'left-menu' },
      { path: '', component: MapViewTopComponent, outlet: 'top-menu' }
    ]
  }
];
