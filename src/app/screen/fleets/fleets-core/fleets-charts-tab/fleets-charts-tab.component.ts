import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexTitleSubtitle, ApexXAxis, ChartComponent, ApexTooltip } from 'ng-apexcharts';
import { ApexGrid, ApexLegend, ApexMarkers, ApexYAxis } from 'ng-apexcharts/lib/model/apex-types';
import { combineLatest, first, map, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DEFAULT_FLEET_ID } from '../../../../store/common-objects/common-objects.service';
import { FleetsActions } from '../../fleets.actions';
import { ChartDataPerDay, EventTrendsChart } from '../../fleets.model';
import { FleetsSelectors } from '../../fleets.selectors';
import { FleetsColorMapService } from '../fleets-charts-filters/fleets-color-map.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  colors: string[];
  yaxis: ApexYAxis;
  legend: ApexLegend;
  markers: ApexMarkers;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-fleets-charts-tab',
  templateUrl: './fleets-charts-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsChartsTabComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly sub = new Subscription();

  eventsTrendsLoading$ = this.store.select(FleetsSelectors.eventsTrendsLoading);
  bodyGroup = new FormGroup({
    event_types: new FormControl<string[]>([]),
    statuses: new FormControl<string[]>(['NEW'])
  });
  bodyRange = new FormControl<string[]>([]);

  public eventsPerDay: ChartOptions;
  public eventsPerWeek: ChartOptions;
  public hourOfTheDay: ChartOptions;
  public hourOfTheDayBus: ChartOptions;

  @ViewChild('chart', { static: false }) chart: ChartComponent | undefined;
  isPerDayChart: boolean = true;
  isPerHourChart: boolean = true;
  private darkModeObserver: MutationObserver | null = null;

  constructor(private readonly store: Store, private readonly cdr: ChangeDetectorRef, private readonly fb: NonNullableFormBuilder, private readonly color: FleetsColorMapService) {
    this.eventsPerDay = {
      series: [{ name: 'Events', data: [] }],
      chart: { type: 'bar', height: 250, animations: { enabled: false }, toolbar: { show: false }, zoom: { enabled: false } },
      xaxis: { type: 'category', categories: [] },
      title: { text: 'Events Per Day', align: 'left' },
      fill: { colors: ['#FFD693'] },
      grid: { show: false },
      yaxis: { show: false },
      colors: [],
      legend: { show: false },
      markers: {},
      dataLabels: {
        enabled: true,
        style: {
          colors: ['var(--black)'],
          fontSize: '9px',
          fontWeight: '500'
        }
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        intersect: false,
        y: {
          formatter: val => `${val} events`
        }
      }
    };

    this.eventsPerWeek = {
      series: [{ name: 'Events per week', data: [] }],
      chart: { type: 'bar', height: 250, animations: { enabled: false }, toolbar: { show: false }, zoom: { enabled: false } },
      xaxis: { type: 'category', categories: [] },
      title: { text: 'Events Per Day', align: 'left' },
      fill: { colors: ['#FFD693'] },
      grid: { show: false },
      yaxis: { show: false },
      colors: [],
      legend: { show: false },
      markers: {},
      dataLabels: {
        enabled: true,
        style: {
          colors: ['var(--black)'],
          fontSize: '9px'
        }
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        shared: true,
        intersect: false,
        y: {
          formatter: val => `${val} events`
        }
      }
    };

    this.hourOfTheDay = {
      series: [{ name: 'Hour of the day', data: [] }],
      chart: { type: 'line', height: 300, animations: { enabled: true }, toolbar: { show: false }, zoom: { enabled: false } },
      xaxis: { type: 'category', categories: [] },
      title: { text: '', align: 'left' },
      fill: {},
      grid: { show: false },
      markers: { size: 4 },
      yaxis: { show: false },
      colors: [],
      legend: { show: false },
      dataLabels: { enabled: true, style: { colors: ['var(--black)'], fontSize: '12px' } },
      tooltip: {
        enabled: true,
        theme: 'light',
        shared: true,
        intersect: false,
        y: {
          formatter: val => `${val} events`
        }
      }
    };

    this.hourOfTheDayBus = {
      series: [{ name: 'Hour of the day per bus', data: [] }],
      chart: { type: 'line', height: 300, animations: { enabled: true }, toolbar: { show: false }, zoom: { enabled: false } },
      xaxis: { type: 'category', categories: [] },
      title: { text: '', align: 'left' },
      fill: {},
      grid: { show: false },
      markers: { size: 4 },
      yaxis: { show: false },
      colors: ['var(--black)'],
      legend: { show: false },
      dataLabels: { enabled: true, style: { colors: ['var(--black)'], fontSize: '12px' } },
      tooltip: {
        enabled: true,
        theme: 'light',
        shared: true,
        intersect: false,
        y: {
          formatter: val => `${val} events`
        }
      }
    };
  }

  ngOnInit(): void {
    this.sub.add(
      combineLatest([this.store.select(FleetsSelectors.rangeFilter), this.store.select(FleetsSelectors.eventTypes), this.store.select(FleetsSelectors.statuses)])
        .pipe(
          takeUntil(this.destroy$),
          tap(([{ from, to }, event_types, statuses]) => {
            const savedFleetId = localStorage.getItem('exeros-fleet-id');
            let fleetId = DEFAULT_FLEET_ID;

            if (savedFleetId) {
              const parsedId = parseInt(savedFleetId, 10);
              if (!isNaN(parsedId)) {
                fleetId = parsedId;
              }
            }

            const eventTypesArray = Array.isArray(event_types) ? event_types : [];
            const statusesArray = Array.isArray(statuses) ? statuses : ['NEW'];
            const params = {
              fleet_id: fleetId,
              from,
              to,
              event_types: eventTypesArray,
              statuses: statusesArray
            };
            this.store.dispatch(FleetsActions.fetchEventChartTrends(FleetsActions.fetchEventChartTrends({ params })));
            this.updateChart();
            this.cdr.detectChanges();
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(FleetsSelectors.eventsTrendsChartParams)
        .pipe(
          first(),
          takeUntil(this.destroy$),
          tap(() => this.bodyGroup.reset({ event_types: [], statuses: ['NEW'] })),
          tap(params => this.bodyRange.setValue([params.from, params.to], { emitEvent: false }))
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(FleetsSelectors.eventTrendsChart)
        .pipe(
          takeUntil(this.destroy$),
          map(data => {
            const eventsPerDay = data?.events_per_day;
            if (eventsPerDay && Array.isArray(eventsPerDay.data) && Array.isArray(eventsPerDay.y)) {
              this.eventsPerDay.series = [{ name: 'Events', data: eventsPerDay.data }];
              this.eventsPerDay.xaxis = {
                type: 'category',
                categories: eventsPerDay.y
              };
            } else {
              this.eventsPerDay.series = [{ name: 'Events', data: [] }];
              this.eventsPerDay.xaxis.categories = [];
            }
            this.updateChart();
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(FleetsSelectors.eventTrendsChart)
        .pipe(
          takeUntil(this.destroy$),
          map(data => {
            const eventsPerWeek = data?.events_per_day_of_week as ChartDataPerDay | undefined;

            if (eventsPerWeek && Array.isArray(eventsPerWeek.data) && Array.isArray(eventsPerWeek.y)) {
              this.eventsPerWeek.series = [{ name: 'Events per week', data: eventsPerWeek.data }];
              this.eventsPerWeek.xaxis = {
                type: 'category',
                categories: eventsPerWeek.y
              };
            } else {
              this.eventsPerWeek.series = [{ name: 'Events per week', data: [] }];
              this.eventsPerWeek.xaxis.categories = [];
            }
            this.updateChartPerWeek();
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(FleetsSelectors.eventTrendsChart)
        .pipe(
          takeUntil(this.destroy$),
          map((data: EventTrendsChart | undefined) => {
            if (data) {
              if (data.hour_of_the_day) {
                const hourOfDayData = data.hour_of_the_day.data;
                const categories = data.hour_of_the_day.y;

                this.hourOfTheDay.series = Object.keys(hourOfDayData).map(key => ({
                  name: `${key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}`,
                  data: hourOfDayData[key]
                }));
                this.hourOfTheDay.xaxis.categories = categories;
                this.hourOfTheDay.colors = this.hourOfTheDay.series.map(series => {
                  if (series.name) {
                    return this.color.getColor(series.name.replace('Event Type: ', ''));
                  } else {
                    return '#000000';
                  }
                });
              } else {
                this.hourOfTheDay.series = [{ name: 'No Data', data: [] }];
                this.hourOfTheDay.xaxis.categories = [];
              }

              if (data.statuses) {
                const statusData = data.statuses.data;
                const statusSeries = Object.keys(statusData).map(key => ({
                  name: `${key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}`,
                  data: statusData[key]
                }));

                this.hourOfTheDay.series = [...this.hourOfTheDay.series, ...statusSeries];
                this.hourOfTheDay.colors = [...this.hourOfTheDay.colors, ...statusSeries.map(series => this.color.getColor(series.name.replace('Status: ', '')))];
              }

              this.updateChartHourOfTheDay();
            }
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.store
        .select(FleetsSelectors.eventTrendsChart)
        .pipe(
          takeUntil(this.destroy$),
          map((data: EventTrendsChart | undefined) => {
            if (data && data.hour_of_the_day_per_bus) {
              const eventData = data.hour_of_the_day_per_bus.data;
              const categories = data.hour_of_the_day_per_bus.y;

              this.hourOfTheDayBus.series = Object.keys(eventData).map(eventType => ({
                name: eventType,
                data: eventData[eventType]
              }));
              this.hourOfTheDayBus.xaxis.categories = categories;
            } else {
              this.hourOfTheDayBus.series = [{ name: 'Hour of the day per bus', data: [] }];
              this.hourOfTheDayBus.xaxis.categories = [];
            }
            this.updateChartHourOfTheDayBus();
          })
        )
        .subscribe()
    );

    this.darkModeObserver = new MutationObserver(() => {
      this.updateChartsTheme();
      this.cdr.detectChanges();
    });

    this.darkModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    this.updateChartsTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sub.unsubscribe();
  }

  toggleChart(type: string) {
    this.isPerDayChart = type === 'perDay';
  }

  toggleHourChart(type: string) {
    this.isPerHourChart = type === 'perHour';
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.updateOptions({ series: this.eventsPerDay.series, xaxis: this.eventsPerDay.xaxis.categories, tooltip: this.eventsPerDay.tooltip }, false, true);
    }
    this.cdr.detectChanges();
  }

  updateChartPerWeek(): void {
    if (this.chart) {
      this.chart.updateOptions({ series: this.eventsPerWeek.series, xaxis: this.eventsPerWeek.xaxis.categories, tooltip: this.eventsPerWeek.tooltip }, false, true);
    }
    this.cdr.detectChanges();
  }

  updateChartHourOfTheDay(): void {
    if (this.chart) {
      this.chart.updateOptions(
        {
          series: this.hourOfTheDay.series,
          xaxis: { categories: this.hourOfTheDay.xaxis.categories },
          colors: this.hourOfTheDay.colors,
          tooltip: this.hourOfTheDay.tooltip
        },
        false,
        true
      );
    }
    this.cdr.detectChanges();
  }

  updateChartHourOfTheDayBus(): void {
    if (this.chart) {
      this.chart.updateOptions({ series: this.hourOfTheDayBus.series, xaxis: this.hourOfTheDayBus.xaxis.categories, tooltip: this.hourOfTheDayBus.tooltip }, false, true);
    }
    this.cdr.detectChanges();
  }

  private updateChartsTheme(): void {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const tooltipTheme = isDarkMode ? 'dark' : 'light';

    if (this.eventsPerDay.tooltip) {
      this.eventsPerDay.tooltip.theme = tooltipTheme;
    }

    if (this.eventsPerWeek.tooltip) {
      this.eventsPerWeek.tooltip.theme = tooltipTheme;
    }

    if (this.hourOfTheDay.tooltip) {
      this.hourOfTheDay.tooltip.theme = tooltipTheme;
    }

    if (this.hourOfTheDayBus.tooltip) {
      this.hourOfTheDayBus.tooltip.theme = tooltipTheme;
    }

    this.updateChart();
    this.updateChartPerWeek();
    this.updateChartHourOfTheDay();
    this.updateChartHourOfTheDayBus();
  }
}
