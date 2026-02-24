import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';
import RouteConst from '../../../../const/route';
import { AccessGroup } from '../../../settings/settings.model';
import { VehiclesActions } from '../../vehicles.actions';
import { VehiclesElement } from '../../vehicles.model';
import { VehiclesSelectors } from '../../vehicles.selectors';
import {
  VehiclesLeftEditCameraChannelsDialogComponent,
  VehiclesLeftEditCameraChannelsDialogData
} from '../vehicles-left-edit-camera-channels-dialog/vehicles-left-edit-camera-channels-dialog.component';

type SortOption = 'name' | 'status' | 'last-activity';

@Component({
  selector: 'app-vehicles-left-list',
  templateUrl: './vehicles-left-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesLeftListComponent {
  @Output() clearFilters = new EventEmitter<void>();

  vehicles$ = this.store.select(VehiclesSelectors.vehicles);
  vehiclesMeta$ = this.store.select(VehiclesSelectors.vehiclesMeta);
  vehiclesLoading$ = this.store.select(VehiclesSelectors.vehiclesLoading);
  selectedId$ = this.store.select(VehiclesSelectors.selectedId);
  accessGroup = AccessGroup;

  sortBy: SortOption = 'name';
  sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'last-activity', label: 'Last Activity' }
  ];

  sortedVehicles$ = combineLatest([this.vehicles$]).pipe(
    map(([vehicles]) => this.applySorting(vehicles))
  );

  constructor(
    private readonly dialog: Dialog,
    private readonly store: Store,
    private readonly router: Router
  ) {}

  handleVehicleClick(vehicle: VehiclesElement): void {
    this.store.dispatch(VehiclesActions.resetTrip());
    this.router.navigate(['/', RouteConst.vehicles, vehicle.id]);
  }

  handleEditCameraChannelsClick(vehicle: VehiclesElement): void {
    this.dialog.open<void, VehiclesLeftEditCameraChannelsDialogData>(
      VehiclesLeftEditCameraChannelsDialogComponent,
      { data: { vehicleId: vehicle.id } }
    );
  }

  trackById(_index: number, vehicle: VehiclesElement): number {
    return vehicle.id;
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  onSortChange(value: SortOption): void {
    this.sortBy = value;
    this.sortedVehicles$ = combineLatest([this.vehicles$]).pipe(
      map(([vehicles]) => this.applySorting(vehicles))
    );
  }

  getVehicleStatus(vehicle: VehiclesElement): 'online' | 'offline' | 'warning' {
    if (vehicle.status === 'Active') return 'online';
    if (vehicle.inactive_since) return 'warning';
    return 'offline';
  }

  getStatusLabel(vehicle: VehiclesElement): string {
    if (vehicle.status === 'Active') return 'Online';
    if (vehicle.inactive_since) {
      return 'Offline ' + this.offlineSince(vehicle.inactive_since);
    }
    return 'Offline';
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

  private applySorting(vehicles: VehiclesElement[]): VehiclesElement[] {
    const sorted = [...vehicles];
    switch (this.sortBy) {
      case 'name':
        sorted.sort((a, b) =>
          a.registration_plate.localeCompare(b.registration_plate)
        );
        break;
      case 'status':
        sorted.sort((a, b) => {
          const order = { Active: 0, Inactive: 1, Available: 2 };
          return (
            (order[a.status] ?? 3) - (order[b.status] ?? 3)
          );
        });
        break;
      case 'last-activity':
        sorted.sort((a, b) => {
          const aTime = a.inactive_since
            ? new Date(a.inactive_since).getTime()
            : Date.now();
          const bTime = b.inactive_since
            ? new Date(b.inactive_since).getTime()
            : Date.now();
          return bTime - aTime;
        });
        break;
    }
    return sorted;
  }
}
