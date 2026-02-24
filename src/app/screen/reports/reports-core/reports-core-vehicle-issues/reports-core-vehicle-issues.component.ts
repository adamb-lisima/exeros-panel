import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, first, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { ReportsActions } from '../../reports.actions';
import { VehicleIssuesElement, VehicleIssuesParams } from '../../reports.model';
import { reportsInitialState } from '../../reports.reducer';
import { ReportsSelectors } from '../../reports.selectors';
import { ReportsCoreVehiclesChecksDialogComponent, ReportsCoreVehiclesChecksDialogData } from '../reports-core-vehicles-checks-dialog/reports-core-vehicles-checks-dialog.component';

@Component({
  selector: 'app-reports-core-vehicle-issues',
  templateUrl: './reports-core-vehicle-issues.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreVehicleIssuesComponent implements OnInit, OnDestroy {
  vehicleIssuesLoading$ = this.store.select(ReportsSelectors.vehicleIssuesLoading);
  vehicleIssues$ = this.store.select(ReportsSelectors.vehicleIssues);
  vehicleIssuesMeta$ = this.store.select(ReportsSelectors.vehicleIssuesMeta);
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly dialog: Dialog) {}

  handleNextPageRequest(page: VehicleIssuesParams['page']): void {
    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        first(),
        tap(fleetId => {
          this.store.dispatch(
            ReportsActions.fetchVehicleIssues({
              params: {
                page,
                per_page: reportsInitialState.vehicleIssuesParams.per_page,
                fleet_id: fleetId
              }
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  handleRowClick(vehicleIssue: VehicleIssuesElement): void {
    this.dialog.open<void, ReportsCoreVehiclesChecksDialogData>(ReportsCoreVehiclesChecksDialogComponent, { data: { id: vehicleIssue.vehicle_check_id }, autoFocus: 'dialog' });
  }

  ngOnInit(): void {
    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        first(),
        tap(fleetId => {
          this.store.dispatch(
            ReportsActions.fetchVehicleIssues({
              params: {
                page: reportsInitialState.vehicleIssuesParams.page,
                per_page: reportsInitialState.vehicleIssuesParams.per_page,
                fleet_id: fleetId
              }
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.sub.add(
      this.store
        .select(ReportsSelectors.rangeFilter)
        .pipe(
          tap(() => {
            this.store
              .select(ReportsSelectors.fleetId)
              .pipe(
                first(),
                tap(fleetId => {
                  this.store.dispatch(
                    ReportsActions.fetchVehicleIssues({
                      params: {
                        page: reportsInitialState.vehicleIssuesParams.page,
                        per_page: reportsInitialState.vehicleIssuesParams.per_page,
                        fleet_id: fleetId
                      }
                    })
                  );
                }),
                takeUntil(this.destroy$)
              )
              .subscribe();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(ReportsSelectors.fleetId)
        .pipe(
          distinctUntilChanged(),
          tap(fleetId => {
            this.store.dispatch(
              ReportsActions.fetchVehicleIssues({
                params: {
                  page: reportsInitialState.vehicleIssuesParams.page,
                  per_page: reportsInitialState.vehicleIssuesParams.per_page,
                  fleet_id: fleetId
                }
              })
            );
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
