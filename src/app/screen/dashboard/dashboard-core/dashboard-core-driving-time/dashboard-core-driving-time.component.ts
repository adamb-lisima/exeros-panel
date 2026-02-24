import { AfterViewInit, ChangeDetectionStrategy, Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { map, Subject, take } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import { ChartOptions } from 'src/app/model/chart.model';
import { DashboardSelectors } from 'src/app/screen/dashboard/dashboard.selectors';
import { LineChartComponent } from '../../../../shared/component/chart/line-chart/line-chart.component';

@Component({
  selector: 'app-dashboard-core-driving-time',
  templateUrl: './dashboard-core-driving-time.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCoreDrivingTimeComponent implements OnInit, AfterViewInit {
  @ViewChild(LineChartComponent) lineChart!: LineChartComponent;
  @HostBinding('class') hostClass = 'h-full';

  private readonly destroy$ = new Subject<void>();

  chartOptions$ = this.store.select(DashboardSelectors.dashboard).pipe(
    map((dashboard): ChartOptions | undefined => {
      if (!dashboard) {
        return undefined;
      }
      const sortedDrivingTime = [...dashboard.driving_time].sort((a, b) => {
        const aMillis = DateTime.fromFormat(a.date, DateConst.serverDateFormat).toMillis();
        const bMillis = DateTime.fromFormat(b.date, DateConst.serverDateFormat).toMillis();
        return aMillis - bMillis;
      });
      return {
        series: [{ name: '', data: sortedDrivingTime.map(time => ({ x: time.date, y: time.value, unit: time.unit })) }]
      };
    })
  );

  constructor(private readonly store: Store) {}

  ngOnInit() {
    this.chartOptions$.pipe(take(1), takeUntil(this.destroy$)).subscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.lineChart?.chart) {
        const customOptions = {
          yaxis: {
            labels: {
              formatter: (val: number) => `${val.toFixed(0)} hours`
            }
          }
        };

        this.lineChart.chart.updateOptions(customOptions);
      }
    }, 100);
  }
}
