import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import RouteConst from '../../../../const/route';
import { AccessGroup } from '../../../settings/settings.model';

@Component({
  selector: 'app-vehicles-left-actions',
  templateUrl: './vehicles-left-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesLeftActionsComponent {
  vehiclesViewerAccess = AccessGroup.VEHICLES_VIEWER;
  driversViewerAccess = AccessGroup.DRIVERS_VIEWER;
  fleetsViewerAccess = AccessGroup.FLEETS_VIEWER;
  constructor(private readonly router: Router) {}

  handleDriversClick(): void {
    this.router.navigate(['/', RouteConst.drivers]);
  }

  handleFleetsClick(): void {
    this.router.navigate(['/', RouteConst.fleets]);
  }
}
