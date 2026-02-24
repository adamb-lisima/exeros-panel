import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import RouteConst from '../../../../const/route';
import { AccessGroup } from '../../../settings/settings.model';
import { DriversActions } from '../../drivers.actions';
import { DriversElement } from '../../drivers.model';
import { DriversSelectors } from '../../drivers.selectors';
import { DriversLeftMessageDialogComponent } from '../drivers-left-message-dialog/drivers-left-message-dialog.component';

@Component({
  selector: 'app-drivers-left-list',
  templateUrl: './drivers-left-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversLeftListComponent {
  readonly AccessGroup = AccessGroup;
  drivers$ = this.store.select(DriversSelectors.drivers);
  driversMeta$ = this.store.select(DriversSelectors.driversMeta);
  driversLoading$ = this.store.select(DriversSelectors.driversLoading);
  selectedId$ = this.store.select(DriversSelectors.selectedId);

  constructor(private readonly dialog: Dialog, private readonly store: Store, private readonly router: Router) {}

  handleDriverClick(driver: DriversElement) {
    this.store.dispatch(DriversActions.resetTrip());
    this.router.navigate(['/', RouteConst.drivers, driver.id]);
  }

  handleMessageClick(driver: DriversElement): void {
    const fleetId = localStorage.getItem('exeros-fleet-id');
    this.dialog.open(DriversLeftMessageDialogComponent, { data: { driver: driver, fleetId: fleetId ? parseInt(fleetId, 10) : 1 } });
  }
}
