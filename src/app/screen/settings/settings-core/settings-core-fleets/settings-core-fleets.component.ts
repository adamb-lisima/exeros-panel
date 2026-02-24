import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounceTime, first, map, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthSelectors } from 'src/app/store/auth/auth.selectors';
import { FleetsTreeElement } from 'src/app/store/common-objects/common-objects.model';
import { waitOnceForAction } from 'src/app/util/operators';
import MapUtil from '../../../../util/map';
import { SettingsActions } from '../../settings.actions';
import { VehicleElement } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { SettingsCoreFleetsDeleteVehicleDialogComponent } from './settings-core-fleets-delete-vehicle-dialog/settings-core-fleets-delete-vehicle-dialog.component';
import { EditFleetData, SettingsCoreFleetsNewBranchDialogComponent } from './settings-core-fleets-new-branch-dialog/settings-core-fleets-new-branch-dialog.component';
import { SettingsCoreFleetsNewVehicleDialogComponent, SettingsCoreFleetsNewVehicleDialogData } from './settings-core-fleets-new-vehicle-dialog/settings-core-fleets-new-vehicle-dialog.component';
import { SettingsCoreFleetsVehicleCommissionComponent } from './settings-core-fleets-vehicle-commission/settings-core-fleets-vehicle-commission.component';

@Component({
  selector: 'app-settings-core-fleets',
  templateUrl: './settings-core-fleets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreFleetsComponent implements OnInit, OnDestroy {
  searchControl = this.fb.control('');
  fleetTree$ = this.store.select(SettingsSelectors.fleetsTree);
  canDelete = false;
  openedFleets: number[] = [];
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  vehicleResponse$ = this.store.select(SettingsSelectors.vehicleResponse);
  perPage$ = this.store.select(SettingsSelectors.vehicleResponseParams).pipe(map(params => params.per_page));
  selectedFleet?: FleetsTreeElement;
  userCompanyId?: number;

  private readonly destroy$ = new Subject<void>();
  private sub = new Subscription();

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog, private readonly actions$: Actions, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.store.dispatch(
      SettingsActions.fetchVehicleResponse({
        params: {
          page: 1,
          branch: undefined,
          brand_name: undefined,
          company_name: undefined,
          fleet_id: undefined,
          id: undefined,
          model_name: undefined,
          registration_plate: undefined,
          search: undefined
        }
      })
    );
    this.sub = new Subscription();

    this.sub.add(
      this.loggedInUser$
        .pipe(
          takeUntil(this.destroy$),
          tap(user => {
            const company_id = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? undefined : user?.company_id;
            this.userCompanyId = company_id;
            this.store.dispatch(SettingsActions.fetchFleetsTree({ params: { show_vehicles: true, with_profiles: false, company_id, fleet_ids: undefined } }));
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.fleetTree$
        .pipe(
          takeUntil(this.destroy$),
          tap(fleets => {
            if (!this.selectedFleet || !fleets) return;
            const flatFleets = MapUtil.mapToFlatFleetsElement(fleets);
            setTimeout(() => {
              this.selectedFleet = flatFleets.find(f => f.id === this.selectedFleet?.id);
              this.cdr.markForCheck();
            }, 0);
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.searchControl.valueChanges
        .pipe(
          debounceTime(250),
          takeUntil(this.destroy$),
          tap(value => this.store.dispatch(SettingsActions.fetchVehicleResponse({ params: { search: value ?? '', page: 1 } })))
        )
        .subscribe()
    );

    this.sub.add(
      this.vehicleResponse$
        .pipe(
          takeUntil(this.destroy$),
          tap(vehicleResponse => {
            if (this.selectedFleet) {
              const hasVehicles = (vehicleResponse?.data.length ?? 0) > 0;
              const hasFleets = this.selectedFleet.children.length > 0;
              this.canDelete = !hasVehicles && !hasFleets;
            }
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  handleDeleteClick() {
    this.store.dispatch(SettingsActions.deleteFleet({ id: this.selectedFleet?.id! }));
    this.sub.add(
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.deleteFleetSuccess]),
          takeUntil(this.destroy$),
          tap(() => {
            this.selectedFleet = undefined;
            this.store.dispatch(SettingsActions.fetchFleetsTree({ params: { show_vehicles: true, with_profiles: false, company_id: this.userCompanyId, fleet_ids: undefined } }));
          })
        )
        .subscribe()
    );
  }

  handleEditVehicleClick(vehicle: VehicleElement) {
    const dialogData: SettingsCoreFleetsNewVehicleDialogData = {
      type: 'edit',
      vehicle,
      fleetId: this.selectedFleet?.id!,
      userCompanyId: this.userCompanyId
    };

    this.dialog.open<void, SettingsCoreFleetsNewVehicleDialogData>(SettingsCoreFleetsNewVehicleDialogComponent, {
      data: dialogData
    });
  }

  handleCreateBranchClick(): void {
    this.dialog.open<void, EditFleetData>(SettingsCoreFleetsNewBranchDialogComponent, {
      data: {
        type: 'create',
        parentId: this.selectedFleet?.id
      }
    });
  }

  handleEditFleetClick() {
    this.dialog.open<void, EditFleetData>(SettingsCoreFleetsNewBranchDialogComponent, {
      data: {
        type: 'edit',
        fleet: this.selectedFleet!
      }
    });
  }

  handleAddVehicleClick(): void {
    Promise.resolve().then(() => {
      setTimeout(() => {
        const dialogRef = this.dialog.open<any, SettingsCoreFleetsNewVehicleDialogData>(SettingsCoreFleetsNewVehicleDialogComponent, {
          data: {
            type: 'create',
            fleetId: this.selectedFleet?.id!,
            userCompanyId: this.userCompanyId
          }
        });

        dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
          if (result && result.action === 'commission' && result.vehicle) {
            this.handleVehicleCommissionClick(result.vehicle);
          }
        });
      }, 0);
    });
  }

  handleDeleteVehicleClick(vehicle: VehicleElement): void {
    this.dialog.open<void, { id: number; branch: number; registration_plate: string; fleet_name: string }>(SettingsCoreFleetsDeleteVehicleDialogComponent, {
      data: {
        id: vehicle.id,
        registration_plate: vehicle.registration_plate,
        branch: this.selectedFleet?.id! ?? 'Fleet',
        fleet_name: vehicle.fleet_name ?? 'Fleet'
      }
    });
  }

  handleAllVehiclesClick() {
    this.openedFleets = [];
    this.selectedFleet = undefined;
    this.store.dispatch(
      SettingsActions.fetchVehicleResponse({
        params: {
          page: 1,
          branch: undefined,
          brand_name: undefined,
          company_name: undefined,
          fleet_id: undefined,
          id: undefined,
          model_name: undefined,
          registration_plate: undefined,
          search: this.searchControl.value ?? undefined
        }
      })
    );
  }

  handleFleetClick(fleet: FleetsTreeElement) {
    this.getFleetParentPath(fleet);
    this.selectedFleet = fleet;
    this.store.dispatch(
      SettingsActions.fetchVehicleResponse({
        params: {
          page: 1,
          fleet_id: fleet.id
        }
      })
    );
  }

  handleVehicleCommissionClick(vehicle: VehicleElement): void {
    this.dialog.open<void>(SettingsCoreFleetsVehicleCommissionComponent, {
      data: { vehicle }
    });
  }

  onPageChange(page: number) {
    this.store.dispatch(
      SettingsActions.fetchVehicleResponse({
        params: {
          page
        }
      })
    );
  }

  private getFleetParentPath(fleet: FleetsTreeElement) {
    this.sub.add(
      this.fleetTree$.pipe(first(), takeUntil(this.destroy$)).subscribe(tree => {
        const flatFleets = MapUtil.mapToFlatFleetsElement(tree);
        this.openedFleets = this.getFleetParents(fleet, flatFleets);
      })
    );
  }

  private getFleetParents(selectedFleet: FleetsTreeElement, fleets: FleetsTreeElement[]): number[] {
    const openedFleets: number[] = [selectedFleet.id];
    let parent = fleets.find(fleet => fleet.id === selectedFleet.parent_id);
    while (parent != null) {
      openedFleets.push(parent.id);
      const nextParentId = parent.parent_id;
      parent = fleets.find(fleet => fleet.id === nextParentId);
    }
    return openedFleets;
  }
}
