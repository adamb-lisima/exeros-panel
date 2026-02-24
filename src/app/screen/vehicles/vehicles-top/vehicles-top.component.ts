import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { map, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import { RANGES } from 'src/app/const/ranges';
import { VehiclesActions } from '../vehicles.actions';
import { VehiclesSelectors } from '../vehicles.selectors';

@Component({
  templateUrl: './vehicles-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesTopComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'w-full';

  readonly DateConst = DateConst;
  readonly RANGES = RANGES;
  vehicle$ = this.store.select(VehiclesSelectors.vehicle);
  rangeFilterControl = this.fb.control<string[]>([]);
  selectedRangeMessage$ = this.store.select(VehiclesSelectors.rangeFilter).pipe(map(params => this.RANGES.find(range => range.getFrom() === params.from && range.getTo() === params.to)?.text ?? 'Custom'));
  sub?: Subscription;

  private readonly destroy$ = new Subject<void>();
  private subscription = new Subscription();

  constructor(private readonly store: Store, private readonly fb: NonNullableFormBuilder) {}

  ngOnInit(): void {
    this.subscription.add(
      this.store
        .select(VehiclesSelectors.rangeFilter)
        .pipe(
          tap(({ from, to }) => this.rangeFilterControl.setValue([from, to], { emitEvent: false })),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.subscription.add(
      this.rangeFilterControl.valueChanges
        .pipe(
          tap(([from, to]) => this.store.dispatch(VehiclesActions.setRangeFilter({ rangeFilter: { from, to } }))),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleDaysClick(id: number): void {
    const from = this.RANGES.find(range => range.id === id)?.getFrom();
    if (from) {
      const to = DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat);
      this.store.dispatch(VehiclesActions.setRangeFilter({ rangeFilter: { from, to } }));
    }
  }
}
