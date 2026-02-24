import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from '../../guard/authorized.guard';
import { VehiclesCoreComponent } from './vehicles-core/vehicles-core.component';
import { VehiclesLeftComponent } from './vehicles-left/vehicles-left.component';
import { VehiclesTopComponent } from './vehicles-top/vehicles-top.component';
import { VehiclesGuard } from './vehicles.guard';

export const VehiclesRouting: Routes = [
  {
    path: RouteConst.vehicles,
    canActivate: [AuthorizedGuard, VehiclesGuard],
    canDeactivate: [VehiclesGuard],
    children: [
      { path: '', component: VehiclesCoreComponent },
      { path: '', component: VehiclesLeftComponent, outlet: 'left-menu' },
      { path: '', component: VehiclesTopComponent, outlet: 'top-menu' },
      { path: ':id', component: VehiclesCoreComponent },
      { path: ':id', component: VehiclesLeftComponent, outlet: 'left-menu' },
      { path: ':id', component: VehiclesTopComponent, outlet: 'top-menu' }
    ]
  }
];
