import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil, finalize } from 'rxjs';
import { map } from 'rxjs/operators';
import { RangeFilter } from 'src/app/model/range-filter.model';
import { PieChartData } from 'src/app/shared/component/chart/pie-chart/pie-chart.component';
import { ChartOptions } from 'src/app/model/chart.model';
import { LeaderboardService } from '../../leaderboard.service';
import { CHART_COLORS } from '../../../../shared/component/chart/chart-colors';

type PeriodType = 'monthly' | 'weekly' | 'yesterday' | 'alltime';

@Component({
  selector: 'app-leaderboard-safety-trends',
  templateUrl: './leaderboard-safety-trends.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaderboardSafetyTrendsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() monthlyRange!: RangeFilter;
  @Input() weeklyRange!: RangeFilter;
  @Input() yesterdayRange!: RangeFilter;
  @Input() allTimeRange!: RangeFilter;
  @Input() fleetId: number | null = null;

  loading = false;
  selectedPeriod: PeriodType = 'monthly';
  eventsChartData$ = new BehaviorSubject<PieChartData[]>([]);
  ratingsChartData$ = new BehaviorSubject<PieChartData[]>([]);
  positionTrendsData$ = new BehaviorSubject<ChartOptions['series']>([]);
  CHART_COLORS = CHART_COLORS;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly leaderboardService: LeaderboardService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fleetId'] && !changes['fleetId'].isFirstChange()) {
      this.fetchData();
    }
    if (changes['monthlyRange'] || changes['weeklyRange'] || changes['yesterdayRange'] || changes['allTimeRange']) {
      this.fetchData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectPeriod(period: PeriodType): void {
    this.selectedPeriod = period;
    this.fetchData();
  }

  private getCurrentRange(): RangeFilter {
    switch (this.selectedPeriod) {
      case 'monthly':
        return this.monthlyRange;
      case 'weekly':
        return this.weeklyRange;
      case 'yesterday':
        return this.yesterdayRange;
      case 'alltime':
        return this.allTimeRange;
      default:
        return this.monthlyRange;
    }
  }

  private fetchData(): void {
    const rangeFilter = this.getCurrentRange();
    if (!rangeFilter || !this.fleetId) return;

    this.loading = true;
    this.cdr.detectChanges();

    this.leaderboardService
      .fetchSafetyScores({ fleet_id: this.fleetId }, rangeFilter)
      .pipe(
        map(response => {
          const eventsData: PieChartData[] = response?.meta?.by_events
            ? Object.entries(response.meta.by_events).map(([eventType, data]: [string, any]) => ({
                name: eventType,
                value: data.impact_percentage
              }))
            : [];

          const ratingsData: PieChartData[] = response?.meta?.by_star_rating
            ? Object.entries(response.meta.by_star_rating).map(([rating, data]: [string, any]) => ({
                name: rating,
                value: data.percentage
              }))
            : [];

          const positionTrendsData: ChartOptions['series'] = response?.meta?.monthly_position_trends?.drivers
            ? response.meta.monthly_position_trends.drivers
                .filter((driver: any) => driver.monthly_positions.length >= 1)
                .map((driver: any) => ({
                  name: driver.name,
                  data: driver.monthly_positions.map((pos: any) => {
                    const [year, month] = pos.month.split('-');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const monthName = monthNames[parseInt(month) - 1];
                    return {
                      x: `${monthName} ${year}`,
                      y: pos.position
                    };
                  })
                }))
            : [];

          return { eventsData, ratingsData, positionTrendsData };
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ eventsData, ratingsData, positionTrendsData }) => {
          this.eventsChartData$.next(eventsData);
          this.ratingsChartData$.next(ratingsData);
          this.positionTrendsData$.next(positionTrendsData);
        },
        error: () => {
          this.eventsChartData$.next([]);
          this.ratingsChartData$.next([]);
          this.positionTrendsData$.next([]);
        }
      });
  }
}
