import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';
import { VehicleChecksElement, VehicleChecksParams } from '../../../../../service/http/vehicle-checks/vehicle-checks.model';
import { DriversActions } from '../../../drivers.actions';
import { DriversSelectors } from '../../../drivers.selectors';
import { DriversCoreTabsChecksDialogComponent, DriversCoreTabsChecksDialogData } from '../drivers-core-tabs-checks-dialog/drivers-core-tabs-checks-dialog.component';

@Component({
  selector: 'app-drivers-core-tabs-checks',
  templateUrl: './drivers-core-tabs-checks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreTabsChecksComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly statusOptions: SelectControl<NonNullable<VehicleChecksParams['status']>>[] = [
    { value: 'All', label: 'All' },
    { value: 'Passed', label: 'Passed' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Complete', label: 'Complete' },
    { value: 'Incomplete', label: 'Incomplete' }
  ];
  private readonly sub?: Subscription;
  vehicleChecksLoading$ = this.store.select(DriversSelectors.vehicleChecksLoading);
  vehicleChecks$ = this.store.select(DriversSelectors.vehicleChecks);
  formParams = this.fb.group<Nullable<VehicleChecksParams>>({
    status: this.statusOptions[0].value
  });

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.store
      .select(DriversSelectors.vehicleChecksParams)
      .pipe(
        first(),
        takeUntil(this.destroy$),
        tap(data => this.formParams.patchValue({ status: data.status }, { emitEvent: false }))
      )
      .subscribe();

    this.formParams.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(value => this.store.dispatch(DriversActions.fetchVehicleChecks({ params: value as Partial<VehicleChecksParams> })))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  handleRowClick(vehicleCheck: VehicleChecksElement): void {
    if (vehicleCheck.vehicle_check_status) {
      this.dialog.open<void, DriversCoreTabsChecksDialogData>(DriversCoreTabsChecksDialogComponent, { data: { id: vehicleCheck.id }, autoFocus: 'dialog' });
    }
  }

  handleExportItemClick(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.store.dispatch(DriversActions.exportVehicleCheck({ id }));
  }

  handleExportItemKeyDown(id: number): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.handleExportItemClick(syntheticMouseEvent, id);
  }
}
