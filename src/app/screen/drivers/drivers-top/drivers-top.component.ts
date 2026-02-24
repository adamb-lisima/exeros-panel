import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, Subject, Subscription, switchMap, take, tap, takeUntil } from 'rxjs';
import DateConst from 'src/app/const/date';
import { CALENDAR_RANGES } from 'src/app/const/ranges';
import { AccessGroup } from '../../settings/settings.model';
import { DriversActions } from '../drivers.actions';
import { DriversSelectors } from '../drivers.selectors';
import { DriversService } from '../drivers.service';

@Component({
  templateUrl: './drivers-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversTopComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'w-full';

  readonly DateConst = DateConst;
  readonly RANGES = CALENDAR_RANGES;
  driver$ = this.store.select(DriversSelectors.driver);
  rangeFilterControl = this.fb.control<string[]>([]);
  selectedRangeMessage$ = this.store.select(DriversSelectors.rangeFilter).pipe(map(params => this.RANGES.find(range => range.getFrom() === params.from && range.getTo() === params.to)?.text ?? 'Custom'));
  sub?: Subscription;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly fb: NonNullableFormBuilder, private readonly driversService: DriversService) {}

  ngOnInit(): void {
    this.store
      .select(DriversSelectors.rangeFilter)
      .pipe(
        tap(({ from, to }) => this.rangeFilterControl.setValue([from, to], { emitEvent: false })),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.rangeFilterControl.valueChanges
      .pipe(
        tap(([from, to]) => this.store.dispatch(DriversActions.setRangeFilter({ rangeFilter: { from, to } }))),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleDaysClick(id: number): void {
    const range = this.RANGES.find(range => range.id === id);
    if (range) {
      const from = range.getFrom();
      const to = range.getTo();
      this.store.dispatch(DriversActions.setRangeFilter({ rangeFilter: { from, to } }));
    }
  }

  handleExportClick(): void {
    this.driver$
      .pipe(
        take(1),
        switchMap(driver =>
          this.store.select(DriversSelectors.rangeFilter).pipe(
            take(1),
            switchMap(rangeFilter => {
              if (driver) {
                return this.driversService.exportDriverPdf(driver.id, rangeFilter);
              }
              return [];
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  protected readonly accessGroup = AccessGroup;
}
