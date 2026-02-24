import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, map, startWith, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartOptions } from 'src/app/model/chart.model';
import { DashboardSelectors } from 'src/app/screen/dashboard/dashboard.selectors';
import ArrayUtil from 'src/app/util/array';
import { ConfigSelectors } from '../../../../store/config/config.selectors';

const DASHBOARD_ALARM_TYPES = 'dashboard-alarm-types';

@Component({
  selector: 'app-dashboard-core-events',
  templateUrl: './dashboard-core-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCoreEventsComponent implements OnInit, OnDestroy {
  private readonly sub?: Subscription;
  private readonly destroy$ = new Subject<void>();

  alarmTypeControl = this.fb.control<string[]>(JSON.parse(localStorage.getItem(DASHBOARD_ALARM_TYPES) ?? '[]'));
  alarmTypesOptions$ = this.store.select(ConfigSelectors.data).pipe(map(data => data?.alarm_types.map(type => ({ value: type, label: type }))));
  chartOptions$ = combineLatest([this.store.select(DashboardSelectors.dashboard), this.alarmTypeControl.valueChanges.pipe(startWith(this.alarmTypeControl.value))]).pipe(
    map(([dashboard, alarmTypes]): ChartOptions | undefined => {
      if (!dashboard) {
        return undefined;
      }
      const dates = dashboard.event_chart.map(chart => chart.date);
      const options: ChartOptions = {
        series: Array.from(
          ArrayUtil.groupBy(
            dashboard.event_chart.flatMap(chart => chart.events).filter(event => (alarmTypes?.length ? alarmTypes.includes(event.name) : true)),
            event => event.name
          )
        ).map(([name, events]) => ({
          name,
          data: dates.map(date => {
            const event = events.find(event => event.date === date);
            return { x: date, y: event?.value ?? 0, name: event?.name };
          })
        }))
      };
      return options.series.length ? options : undefined;
    })
  );

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.alarmTypeControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(value => localStorage.setItem(DASHBOARD_ALARM_TYPES, JSON.stringify(value ?? [])))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
