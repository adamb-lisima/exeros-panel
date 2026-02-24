import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, finalize } from 'rxjs';
import { RangeFilter } from 'src/app/model/range-filter.model';
import { TopDriversElement } from 'src/app/screen/reports/reports.model';
import { LeaderboardService } from '../../leaderboard.service';

@Component({
  selector: 'app-leaderboard-drivers',
  templateUrl: './leaderboard-drivers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaderboardDriversComponent implements OnInit, OnDestroy, OnChanges {
  @Input() title: string = '';
  @Input() rangeFilter!: RangeFilter;
  @Input() fleetId: number | null = null;

  loading = false;
  topDrivers: TopDriversElement[] = [];
  showAll = false;
  readonly defaultLimit = 10;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly leaderboardService: LeaderboardService, private readonly store: Store, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchDrivers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fleetId'] && !changes['fleetId'].isFirstChange()) {
      this.fetchDrivers();
    }
    if (changes['rangeFilter'] && !changes['rangeFilter'].isFirstChange()) {
      this.fetchDrivers();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  get displayedDrivers(): TopDriversElement[] {
    return this.showAll ? this.topDrivers : this.topDrivers.slice(0, this.defaultLimit);
  }

  get canShowMore(): boolean {
    return !this.showAll && this.topDrivers.length > this.defaultLimit;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.cdr.detectChanges();
  }

  private fetchDrivers(): void {
    if (this.rangeFilter == null || this.fleetId == null) return;

    this.loading = true;
    this.showAll = false;
    this.cdr.detectChanges();

    this.leaderboardService
      .fetchTopDrivers({ fleet_id: this.fleetId }, this.rangeFilter)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          this.topDrivers = response.data ?? [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.topDrivers = [];
          this.cdr.detectChanges();
        }
      });
  }
}
