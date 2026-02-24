import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, first, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { AccidentsElement } from '../../../../service/http/accidents/accidents.model';
import { AccessGroup } from '../../../settings/settings.model';
import { ReportsActions } from '../../reports.actions';
import { reportsInitialState } from '../../reports.reducer';
import { ReportsSelectors } from '../../reports.selectors';
import { ReportsCoreAccidentsDialogComponent, ReportsCoreAccidentsDialogData } from '../reports-core-accidents-dialog/reports-core-accidents-dialog.component';

@Component({
  selector: 'app-reports-core-accidents',
  templateUrl: './reports-core-accidents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreAccidentsComponent implements OnInit, OnDestroy {
  accessGroup = AccessGroup;
  accidentsLoading$ = this.store.select(ReportsSelectors.accidentsLoading);
  accidents$ = this.store.select(ReportsSelectors.accidents);
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly dialog: Dialog) {}

  handleRowClick(accident: AccidentsElement): void {
    this.dialog.open<void, ReportsCoreAccidentsDialogData>(ReportsCoreAccidentsDialogComponent, { data: { id: accident.id } });
  }

  handleExportItemClick(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.store.dispatch(ReportsActions.exportAccident({ id }));
  }

  handleExportItemKeyDown(id: string): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.handleExportItemClick(syntheticMouseEvent, id);
  }

  ngOnInit(): void {
    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        first(),
        tap(fleetId => {
          this.store.dispatch(
            ReportsActions.fetchAccidents({
              params: {
                page: reportsInitialState.accidentsParams.page,
                per_page: reportsInitialState.accidentsParams.per_page,
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
        .select(ReportsSelectors.fleetId)
        .pipe(
          distinctUntilChanged(),
          tap(fleetId => {
            this.store.dispatch(
              ReportsActions.fetchAccidents({
                params: {
                  page: reportsInitialState.accidentsParams.page,
                  per_page: reportsInitialState.accidentsParams.per_page,
                  fleet_id: fleetId
                }
              })
            );
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

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
                    ReportsActions.fetchAccidents({
                      params: {
                        page: reportsInitialState.accidentsParams.page,
                        per_page: reportsInitialState.accidentsParams.per_page,
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
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
