import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import RouteConst from '../../../../const/route';
import { AccessGroup } from '../../../settings/settings.model';
import { VehiclesActions } from '../../vehicles.actions';
import { VehiclesElement } from '../../vehicles.model';
import { VehiclesSelectors } from '../../vehicles.selectors';
import { VehiclesLeftEditCameraChannelsDialogComponent, VehiclesLeftEditCameraChannelsDialogData } from '../vehicles-left-edit-camera-channels-dialog/vehicles-left-edit-camera-channels-dialog.component';

@Component({
  selector: 'app-vehicles-left-list',
  templateUrl: './vehicles-left-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesLeftListComponent {
  vehicles$ = this.store.select(VehiclesSelectors.vehicles);
  vehiclesMeta$ = this.store.select(VehiclesSelectors.vehiclesMeta);
  vehiclesLoading$ = this.store.select(VehiclesSelectors.vehiclesLoading);
  selectedId$ = this.store.select(VehiclesSelectors.selectedId);
  accessGroup = AccessGroup;

  constructor(private readonly dialog: Dialog, private readonly store: Store, private readonly router: Router) {}

  handleVehicleClick(vehicle: VehiclesElement): void {
    this.store.dispatch(VehiclesActions.resetTrip());
    this.router.navigate(['/', RouteConst.vehicles, vehicle.id]);
  }

  handleEditCameraChannelsClick(vehicle: VehiclesElement): void {
    this.dialog.open<void, VehiclesLeftEditCameraChannelsDialogData>(VehiclesLeftEditCameraChannelsDialogComponent, { data: { vehicleId: vehicle.id } });
  }

  offlineSince(inactiveSince: string): string {
    const inactiveDate = new Date(inactiveSince);
    const currentDate = new Date();
    const diffMs = currentDate.getTime() - inactiveDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes}m`;
      }
      return `${diffHours}h`;
    }

    return `${diffDays}D`;
  }
}
