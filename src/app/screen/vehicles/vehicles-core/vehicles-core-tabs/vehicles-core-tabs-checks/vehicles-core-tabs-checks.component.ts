import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';
import { VehicleChecksElement, VehicleChecksParams } from '../../../../../service/http/vehicle-checks/vehicle-checks.model';
import { VehiclesActions } from '../../../vehicles.actions';
import { VehiclesSelectors } from '../../../vehicles.selectors';
import { VehiclesCoreTabsChecksDialogComponent, VehiclesCoreTabsChecksDialogData } from '../vehicles-core-tabs-checks-dialog/vehicles-core-tabs-checks-dialog.component';

@Component({
  selector: 'app-vehicles-core-tabs-checks',
  templateUrl: './vehicles-core-tabs-checks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreTabsChecksComponent implements OnInit, OnDestroy {
  readonly statusOptions: SelectControl<NonNullable<VehicleChecksParams['status']>>[] = [
    { value: 'All', label: 'All' },
    { value: 'Passed', label: 'Passed' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Complete', label: 'Complete' },
    { value: 'Incomplete', label: 'Incomplete' }
  ];

  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  vehicleChecksLoading$ = this.store.select(VehiclesSelectors.vehicleChecksLoading);
  vehicleChecks$ = this.store.select(VehiclesSelectors.vehicleChecks);
  formParams = this.fb.group<Nullable<VehicleChecksParams>>({
    status: this.statusOptions[0].value
  });

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    const paramsSubscription = this.store
      .select(VehiclesSelectors.vehicleChecksParams)
      .pipe(
        first(),
        tap(data => this.formParams.patchValue({ status: data.status }, { emitEvent: false })),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(paramsSubscription);

    const formChangesSubscription = this.formParams.valueChanges
      .pipe(
        tap(value =>
          this.store.dispatch(
            VehiclesActions.fetchVehicleChecks({
              params: value as Partial<VehicleChecksParams>
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(formChangesSubscription);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleRowClick(vehicleCheck: VehicleChecksElement): void {
    if (vehicleCheck.vehicle_check_status) {
      this.dialog.open<void, VehiclesCoreTabsChecksDialogData>(VehiclesCoreTabsChecksDialogComponent, { data: { id: vehicleCheck.id }, autoFocus: 'dialog' });
    }
  }

  handleExportItemClick(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.store.dispatch(VehiclesActions.exportVehicleCheck({ id }));
  }

  handleExportItemKeyDown(id: number): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.handleExportItemClick(syntheticMouseEvent, id);
  }
}
