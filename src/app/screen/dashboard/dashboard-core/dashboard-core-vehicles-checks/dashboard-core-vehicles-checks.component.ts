import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardActions } from 'src/app/screen/dashboard/dashboard.actions';
import { DashboardSelectors } from 'src/app/screen/dashboard/dashboard.selectors';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';
import { VehicleChecksElement, VehicleChecksParams } from '../../../../service/http/vehicle-checks/vehicle-checks.model';
import { DashboardCoreVehiclesChecksDialogComponent, DashboardCoreVehiclesChecksDialogData } from '../dashboard-core-vehicles-checks-dialog/dashboard-core-vehicles-checks-dialog.component';

@Component({
  selector: 'app-dashboard-core-vehicles-checks',
  templateUrl: './dashboard-core-vehicles-checks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCoreVehiclesChecksComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly statusOptions: SelectControl<NonNullable<VehicleChecksParams['status']>>[] = [
    { value: 'All', label: 'All' },
    { value: 'Passed', label: 'Passed' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Complete', label: 'Complete' },
    { value: 'Incomplete', label: 'Incomplete' }
  ];
  vehicleChecksLoading$ = this.store.select(DashboardSelectors.vehicleChecksLoading);
  vehicleChecks$ = this.store.select(DashboardSelectors.vehicleChecks);
  formParams = this.fb.group<Nullable<VehicleChecksParams>>({
    status: this.statusOptions[0].value
  });

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.formParams.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(value => this.store.dispatch(DashboardActions.fetchVehicleChecks({ params: value as Partial<VehicleChecksParams> })))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleRowClick(vehicleCheck: VehicleChecksElement): void {
    if (vehicleCheck.vehicle_check_status) {
      this.dialog.open<void, DashboardCoreVehiclesChecksDialogData>(DashboardCoreVehiclesChecksDialogComponent, { data: { id: vehicleCheck.id }, autoFocus: 'dialog' });
    }
  }

  handleExportItemClick(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.store.dispatch(DashboardActions.exportVehicleCheck({ id }));
  }

  handleExportItemKeyDown(id: number): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.handleExportItemClick(syntheticMouseEvent, id);
  }
}
