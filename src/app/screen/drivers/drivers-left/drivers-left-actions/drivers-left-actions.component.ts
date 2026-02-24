import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import RouteConst from '../../../../const/route';
import { AccessGroup } from '../../../settings/settings.model';

@Component({
  selector: 'app-drivers-left-actions',
  templateUrl: './drivers-left-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversLeftActionsComponent {
  driversViewerAccess = AccessGroup.DRIVERS_VIEWER;
  vehiclesViewerAccess = AccessGroup.VEHICLES_VIEWER;
  constructor(private readonly router: Router) {}

  handleVehiclesClick(): void {
    this.router.navigate(['/', RouteConst.vehicles]);
  }

  handleFleetsClick(): void {
    this.router.navigate(['/', RouteConst.fleets]);
  }
}
