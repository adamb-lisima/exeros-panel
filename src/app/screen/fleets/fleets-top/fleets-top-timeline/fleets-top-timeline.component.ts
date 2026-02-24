import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { combineLatest, map, Subject, Subscription, tap, withLatestFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import { RANGES } from 'src/app/const/ranges';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { DEFAULT_FLEET_ID } from '../../../../store/common-objects/common-objects.service';
import ControlUtil from '../../../../util/control';
import { FleetsActions } from '../../fleets.actions';
import { EventsStatsParams, EventTrendsChartParams } from '../../fleets.model';
import { FleetsSelectors } from '../../fleets.selectors';

@Component({
  templateUrl: './fleets-top-timeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsTopTimelineComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'w-full';

  private readonly destroy$ = new Subject<void>();

  readonly DateConst = DateConst;
  readonly RANGES = RANGES;
  rangeFilterControl = this.fb.control<string[]>([]);
  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(data => ControlUtil.mapFleetsTreeToTreeControls(data)));
  selectedRangeMessage$ = this.store.select(FleetsSelectors.rangeFilter).pipe(map(params => this.RANGES.find(range => range.getFrom() === params.from && range.getTo() === params.to)?.text ?? 'Custom'));
  bodyGroup = this.fb.group<Nullable<Pick<EventsStatsParams, 'fleet_id'>>>({
    fleet_id: DEFAULT_FLEET_ID
  });
  constructor(private readonly store: Store, private readonly fb: NonNullableFormBuilder) {}
  private readonly sub = new Subscription();

  ngOnInit(): void {
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

        this.sub.add(
          this.store
            .select(FleetsSelectors.rangeFilter)
            .pipe(
              takeUntil(this.destroy$),
              tap(({ from, to }) => {
                this.dispatchFetchEventsStats(fleetId, from, to);
              })
            )
            .subscribe()
        );
      }
    }

    this.sub.add(
      this.store
        .select(FleetsSelectors.rangeFilter)
        .pipe(
          takeUntil(this.destroy$),
          tap(({ from, to }) => {
            this.rangeFilterControl.setValue([from, to], { emitEvent: false });
            const fleetId = this.bodyGroup.controls.fleet_id.value ?? DEFAULT_FLEET_ID;
            this.dispatchFetchEventsStats(Number(fleetId), from, to);
          })
        )
        .subscribe()
    );

    this.sub.add(
      combineLatest([this.bodyGroup.controls.fleet_id.valueChanges, this.store.select(FleetsSelectors.rangeFilter)])
        .pipe(
          takeUntil(this.destroy$),
          withLatestFrom(this.store.select(FleetsSelectors.eventTypes), this.store.select(FleetsSelectors.statuses)),
          tap(([[fleetId, { from, to }], event_types, statuses]) => {
            const parsedFleetId = Number(fleetId);

            localStorage.setItem('exeros-fleet-id', String(parsedFleetId));

            this.store.dispatch(FleetsActions.setSelectedFleetId({ fleet_id: parsedFleetId }));
            this.dispatchFetchEventsStats(parsedFleetId, from, to);

            const chartTrendsParams: EventTrendsChartParams = {
              fleet_id: parsedFleetId,
              from,
              to,
              event_types,
              statuses
            };

            this.store.dispatch(FleetsActions.fetchEventChartTrends({ params: chartTrendsParams }));
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.rangeFilterControl.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          tap(([from, to]) => this.store.dispatch(FleetsActions.setRangeFilter({ rangeFilter: { from, to } })))
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sub.unsubscribe();
  }

  private dispatchFetchEventsStats(fleetId: number, from: string, to: string): void {
    const params: EventsStatsParams = { fleet_id: fleetId, from, to };
    this.store.dispatch(FleetsActions.fetchEventsStats({ params }));
  }

  handleDaysClick(id: number): void {
    const from = this.RANGES.find(range => range.id === id)?.getFrom();
    if (from) {
      const to = DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat);
      this.store.dispatch(FleetsActions.setRangeFilter({ rangeFilter: { from, to } }));
    }
  }
}
