import { ChangeDetectionStrategy, Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { RangeFilter } from 'src/app/model/range-filter.model';
import { ReportsSelectors } from '../../reports/reports.selectors';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';
import { AccessGroup } from '../../settings/settings.model';

@Component({
  selector: 'app-leaderboard-core',
  templateUrl: './leaderboard-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaderboardCoreComponent implements OnDestroy {
  monthlyRange: RangeFilter = { from: '', to: '' };
  weeklyRange: RangeFilter = { from: '', to: '' };
  yesterdayRange: RangeFilter = this.getYesterdayRange();
  allTimeRange: RangeFilter = this.getAllTimeRange();

  monthControl = new FormControl(this.getCurrentMonthValue());
  weekControl = new FormControl(this.getCurrentWeekValue());
  monthOptions: SelectControl[] = [];
  weekOptions: SelectControl[] = [];
  accessGroup = AccessGroup;

  fleetId$ = this.store.select(ReportsSelectors.fleetId);

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly cdr: ChangeDetectorRef) {
    this.generateMonthOptions();
    this.generateWeekOptions();

    const initialMonthValue = this.monthControl.value;
    if (initialMonthValue) {
      const [year, month] = initialMonthValue.split('-').map(Number);
      this.monthlyRange = this.getMonthRange(year, month);
    }

    const initialWeekValue = this.weekControl.value;
    if (initialWeekValue) {
      const [year, week] = initialWeekValue.split('-W').map(Number);
      this.weeklyRange = this.getWeekRange(year, week);
    }

    this.monthControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        const [year, month] = value.split('-').map(Number);
        this.monthlyRange = this.getMonthRange(year, month);
        this.cdr.detectChanges();
      }
    });

    this.weekControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        const [year, week] = value.split('-W').map(Number);
        this.weeklyRange = this.getWeekRange(year, week);
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getMonthRange(year: number, month: number): RangeFilter {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    return {
      from: start.toLocaleDateString('en-CA'),
      to: end.toLocaleDateString('en-CA')
    };
  }

  private getCurrentWeekValue(): string {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    return `${now.getFullYear()}-W${weekNumber}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  }

  private getWeekRange(year: number, week: number): RangeFilter {
    const jan4 = new Date(year, 0, 4);
    const weekStart = new Date(jan4);
    weekStart.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      from: weekStart.toLocaleDateString('en-CA'),
      to: weekEnd.toLocaleDateString('en-CA')
    };
  }

  private generateWeekOptions(): void {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 8; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i * 7);

      const weekNumber = this.getWeekNumber(date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      options.push({
        value: `${date.getFullYear()}-W${weekNumber}`,
        label: `${weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })} - ${weekEnd.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}`
      });
    }

    this.weekOptions = options;
  }

  private getYesterdayRange(): RangeFilter {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return {
      from: yesterday.toLocaleDateString('en-CA'),
      to: yesterday.toLocaleDateString('en-CA')
    };
  }

  private getAllTimeRange(): RangeFilter {
    const end = new Date();
    const start = new Date('2020-01-01');

    return {
      from: start.toLocaleDateString('en-CA'),
      to: end.toLocaleDateString('en-CA')
    };
  }

  private getCurrentMonthValue(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  }

  private generateMonthOptions(): void {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      });
    }

    this.monthOptions = options;
  }
}
