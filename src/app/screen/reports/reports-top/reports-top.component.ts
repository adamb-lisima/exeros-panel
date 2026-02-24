import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { map, pairwise, startWith, Subject, Subscription, takeUntil, tap } from 'rxjs';
import DateConst from '../../../const/date';
import { RANGES } from '../../../const/ranges';
import { CommonObjectsSelectors } from '../../../store/common-objects/common-objects.selectors';
import { DEFAULT_FLEET_ID } from '../../../store/common-objects/common-objects.service';
import ControlUtil from '../../../util/control';
import { ReportsActions } from '../reports.actions';
import { ReportsSelectors } from '../reports.selectors';

@Component({
  templateUrl: './reports-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsTopComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'w-full';

  readonly DateConst = DateConst;
  readonly RANGES = RANGES;
  rangeFilterControl = this.fb.control<string[]>([]);
  selectedRangeMessage$ = this.store.select(ReportsSelectors.rangeFilter).pipe(map(params => this.RANGES.find(range => range.getFrom() === params.from && range.getTo() === params.to)?.text ?? 'Custom'));
  sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => ControlUtil.mapFleetsTreeToTreeControls(fleetsTree)));
  bodyGroup = this.fb.group({
    fleet_id: DEFAULT_FLEET_ID
  });

  constructor(private readonly store: Store, private readonly fb: NonNullableFormBuilder) {}

  ngOnInit(): void {
    this.loadSavedFleetId();

    this.sub.add(
      this.store
        .select(ReportsSelectors.rangeFilter)
        .pipe(
          tap(({ from, to }) => this.rangeFilterControl.setValue([from, to], { emitEvent: false })),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.rangeFilterControl.valueChanges
        .pipe(
          tap(([from, to]) => this.store.dispatch(ReportsActions.setRangeFilter({ rangeFilter: { from, to } }))),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.bodyGroup.valueChanges
        .pipe(
          startWith(this.bodyGroup.value),
          pairwise(),
          tap(([, curr]) => {
            if (curr.fleet_id !== undefined) {
              localStorage.setItem('exeros-fleet-id', String(curr.fleet_id ?? ''));
            }
            this.store.dispatch(ReportsActions.setFleetId({ fleetId: curr.fleet_id || DEFAULT_FLEET_ID }));
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

  handleDaysClick(id: number): void {
    const from = this.RANGES.find(range => range.id === id)?.getFrom();
    if (from) {
      const to = DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat);
      this.store.dispatch(ReportsActions.setRangeFilter({ rangeFilter: { from, to } }));
    }
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

        this.store.dispatch(ReportsActions.setFleetId({ fleetId }));
      }
    }
  }
}
