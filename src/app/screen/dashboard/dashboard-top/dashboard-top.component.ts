import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { map, pairwise, startWith, Subject, Subscription, take, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import { DashboardActions } from 'src/app/screen/dashboard/dashboard.actions';
import { DashboardSelectors } from 'src/app/screen/dashboard/dashboard.selectors';
import { DEFAULT_FLEET_ID } from 'src/app/store/common-objects/common-objects.service';
import { RANGES } from '../../../const/ranges';
import { AuthSelectors } from '../../../store/auth/auth.selectors';
import { CommonObjectsActions } from '../../../store/common-objects/common-objects.actions';
import { CommonObjectsSelectors } from '../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../util/control';
import { AccessGroup } from '../../settings/settings.model';
import { dashboardInitialState } from '../dashboard.reducer';

@Component({
  templateUrl: './dashboard-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardTopComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'w-full';

  private readonly destroy$ = new Subject<void>();
  private readonly sub = new Subscription();
  private hasDashboardAccess = false;

  readonly accessGroup = AccessGroup;
  readonly DateConst = DateConst;
  readonly RANGES = RANGES;
  rangeFilterControl = this.fb.control<string[]>([]);
  selectedRangeMessage$ = this.store.select(DashboardSelectors.rangeFilter).pipe(map(params => this.RANGES.find(range => range.getFrom() === params.from && range.getTo() === params.to)?.text ?? 'Custom'));

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => ControlUtil.mapFleetsTreeToTreeControls(fleetsTree)));
  bodyGroup = this.fb.group({
    fleet_id: DEFAULT_FLEET_ID
  });

  @ViewChild('menu') sad?: TemplateRef<any>;

  constructor(private readonly store: Store, private readonly fb: NonNullableFormBuilder) {}

  ngOnInit(): void {
    this.store
      .select(AuthSelectors.loggedInUser)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(user => {
        const accessGroups = user?.access_groups ?? [];
        this.hasDashboardAccess = accessGroups.includes(AccessGroup.DASHBOARD_VIEWER) ? true : user?.role === 'SUPER_ADMIN';
        if (this.hasDashboardAccess) {
          this.initializeDashboard();
        }
      });
  }

  private initializeDashboard(): void {
    this.loadSavedFleetId();

    this.sub.add(
      this.store
        .select(DashboardSelectors.rangeFilter)
        .pipe(
          takeUntil(this.destroy$),
          tap(({ from, to }) => this.rangeFilterControl.setValue([from, to], { emitEvent: false }))
        )
        .subscribe()
    );

    this.sub.add(
      this.rangeFilterControl.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          tap(([from, to]) => this.store.dispatch(DashboardActions.setRangeFilter({ rangeFilter: { from, to } })))
        )
        .subscribe()
    );

    this.sub.add(
      this.bodyGroup.valueChanges
        .pipe(
          startWith(this.bodyGroup.value),
          pairwise(),
          takeUntil(this.destroy$),
          tap(([, curr]) => {
            if (curr.fleet_id !== undefined) {
              localStorage.setItem('exeros-fleet-id', String(curr.fleet_id ?? ''));
            }
            this.fetchData();
          })
        )
        .subscribe()
    );
  }

  private loadSavedFleetId(): void {
    const savedFleetId = localStorage.getItem('exeros-fleet-id');
    if (savedFleetId) {
      const fleetId = parseInt(savedFleetId, 10);
      if (!isNaN(fleetId)) {
        this.bodyGroup.patchValue(
          {
            fleet_id: fleetId
          },
          { emitEvent: false }
        );

        this.fetchData();
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchData(): void {
    if (this.bodyGroup.value.fleet_id) {
      this.store.dispatch(DashboardActions.fetchDashboard({ params: { fleet_id: this.bodyGroup.value.fleet_id as number } }));
      this.store.dispatch(CommonObjectsActions.fetchMapVehicles({ params: { fleet_id: this.bodyGroup.value.fleet_id as number } }));
      this.store.dispatch(DashboardActions.fetchVehicleChecks({ params: { fleet_id: this.bodyGroup.value.fleet_id as number } }));
      this.store.dispatch(DashboardActions.fetchAccidents({ params: { fleet_id: this.bodyGroup.value.fleet_id as number, page: dashboardInitialState.accidentsParams.page, per_page: dashboardInitialState.accidentsParams.per_page } }));
    }
  }

  handleDaysClick(id: number): void {
    const from = this.RANGES.find(range => range.id === id)?.getFrom();
    if (from) {
      const to = DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat);
      this.store.dispatch(DashboardActions.setRangeFilter({ rangeFilter: { from, to } }));
    }
  }
}
