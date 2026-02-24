import { FlexibleConnectedPositionStrategyOrigin } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { groupBy, keys, map as ldMap, maxBy, minBy, uniqBy } from 'lodash-es';
import { combineLatest, of, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartOptions } from 'src/app/model/chart.model';
import { ThemeService } from 'src/app/service/theme/theme.service';

@Component({
  selector: 'app-stacked-bar-chart',
  templateUrl: './stacked-bar-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedBarChartComponent implements OnDestroy {
  @Input() set options(v: ChartOptions) {
    this._seriesDataSubject.next(v.series ?? []);
  }

  private _chartContainer?: ElementRef<HTMLDivElement>;

  @HostBinding('class') hostClass = 'block w-full h-full';

  @ViewChild('chartContainer', { static: true })
  public get chartContainer(): ElementRef<HTMLDivElement> | undefined {
    return this._chartContainer;
  }

  public set chartContainer(v: ElementRef<HTMLDivElement> | undefined) {
    this._chartContainer = v;
    if (v) {
      this._chartContainerObserver.disconnect();
      this._chartContainerObserver.observe(v.nativeElement);
    } else {
      this._chartContainerObserver.disconnect();
      this._svgContainerSizeSubject.next(undefined);
    }
  }

  private readonly _chartContainerObserver: ResizeObserver = new ResizeObserver(entries => {
    this._zone.run(() =>
      this._svgContainerSizeSubject.next({
        width: entries[0].target.getBoundingClientRect().width,
        height: entries[0].target.getBoundingClientRect().height
      })
    );
  });
  private readonly _seriesDataSubject = new ReplaySubject<ChartOptions['series']>(1);
  private readonly _seriesData$ = this._seriesDataSubject.asObservable();
  private readonly _svgContainerSizeSubject = new ReplaySubject<{ width: number; height: number } | undefined>(1);
  private readonly _svgContainerSize$ = this._svgContainerSizeSubject.asObservable();

  private readonly _xAxisHeight$ = of(32);
  private readonly _barWidth$ = of(8);

  private readonly _mappedData$ = combineLatest([this._seriesData$]).pipe(
    map(([v]) => {
      const flattenedData = v.flatMap(s => s.data.map(d => ({ name: s.name, date: new Date(d.x), v1: 0, v2: 0, color: 'black', data: d })));
      const groupedData = groupBy(flattenedData, 'date');
      const colorScale = scaleOrdinal(ldMap(uniqBy(flattenedData, 'name'), 'name'), ['#00E08D', '#ffbf61', '#F4F06E', '#00A6FF']);

      // update the data points for a stacked bar chart
      for (const date in groupedData) {
        if (Object.prototype.hasOwnProperty.call(groupedData, date)) {
          const group = groupedData[date];
          let acc = 0;
          for (const point of group) {
            if (point) {
              point.v1 = acc;
              point.v2 = point.v1 + (point.data.y as number);
              acc = point.v2;
              point.color = colorScale(point.name);
            }
          }
        }
      }

      const maxV2 = maxBy(flattenedData, 'v2')?.v2;

      return {
        maxV2,
        bars: keys(groupedData).map(date => ({
          date: groupedData[date][0].date,
          points: groupedData[date]
        }))
      };
    })
  );
  private readonly _barDates$ = combineLatest([this._mappedData$]).pipe(map(([bars]) => ldMap(bars.bars, 'date')));
  private readonly _maxV2$ = combineLatest([this._mappedData$]).pipe(map(([bars]) => bars.maxV2));
  private readonly _yAxisWidth$ = this._maxV2$.pipe(map(maxV2 => (maxV2 == null ? undefined : 8 * maxV2.toString().length + 16)));
  private readonly _xScale$ = combineLatest([this._mappedData$, this._yAxisWidth$, this._svgContainerSize$]).pipe(
    map(([mappedData, yAxisWidth, svgContainerSize]) => {
      if (svgContainerSize == null || yAxisWidth == null) {
        return undefined;
      }
      const range = [32, svgContainerSize.width - yAxisWidth - 32];
      const minDate = minBy(mappedData.bars, 'date')?.date;
      const maxDate = maxBy(mappedData.bars, 'date')?.date;
      if (minDate == null || maxDate == null) {
        return undefined;
      }
      const domain = [minDate, maxDate];
      return scaleTime(domain, range);
    })
  );
  private _yScale$ = combineLatest([this._xAxisHeight$, this._maxV2$, this._svgContainerSize$]).pipe(
    map(([xAxisHeight, maxV2, svgContainerSize]) => {
      if (svgContainerSize == null || maxV2 == null) {
        return undefined;
      }
      const domain = [0, maxV2];
      const range = [svgContainerSize.height - xAxisHeight, 32]; // 32 is to allow space for final tick
      return scaleLinear(domain, range).nice();
    })
  );
  private _bars$ = combineLatest([this._mappedData$, this._xScale$, this._barWidth$, this._yScale$, this._svgContainerSize$]).pipe(
    map(([mappedData, xScale, barWidth, yScale, svgContainerSize]) => {
      if (xScale == null || yScale == null || svgContainerSize == null) {
        return undefined;
      }

      return mappedData.bars.map(bar => ({
        chartX: xScale(bar.date),
        width: barWidth,
        points: bar.points.map(point => ({
          chartY: yScale(point.v2),
          chartHeight: yScale(point.v1) - yScale(point.v2),
          color: point.color,
          data: point.data
        }))
      }));
    })
  );

  _xAxis$ = combineLatest([this._barDates$, this._xScale$, this._svgContainerSize$, this._xAxisHeight$, this._yAxisWidth$, this._barWidth$]).pipe(
    map(([barDates, xScale, svgContainerSize, xAxisHeight, yAxisWidth, barWidth]) => {
      if (svgContainerSize == null || yAxisWidth == null || xScale == null) {
        return undefined;
      }

      const x: number = yAxisWidth;
      const y = svgContainerSize.height - xAxisHeight;
      const width = svgContainerSize.width - yAxisWidth;
      const height = xAxisHeight;
      const onlyMondays = barDates.length > 25;
      const fmt = Intl.DateTimeFormat(undefined, barDates.length > 8 ? (onlyMondays ? { day: 'numeric', month: 'numeric' } : { day: 'numeric' }) : { weekday: 'short' });
      const ticks = barDates.map(d => ({
        x: xScale(d) + barWidth / 2,
        text: onlyMondays ? (d.getDay() === 1 ? fmt.format(d) : '') : fmt.format(d)
      }));

      return {
        x,
        y,
        width,
        height,
        ticks
      };
    })
  );
  _yAxis$ = combineLatest([this._yAxisWidth$, this._svgContainerSize$, this._yScale$, this._xAxisHeight$]).pipe(
    map(([yAxisWidth, svgContainerSize, yScale]) => {
      if (svgContainerSize == null) {
        return undefined;
      }
      const x = 0;
      const y = 0;
      const width = yAxisWidth;
      const height = '100%';
      const ticks = yScale?.ticks(4).map(tick => ({ y: yScale(tick), text: `${tick}` }));
      return { x, y, width, height, ticks };
    })
  );
  _chart$ = combineLatest([this._bars$, this._yAxisWidth$, this._xAxisHeight$, this._svgContainerSize$]).pipe(
    map(([barLocations, yAxisWidth, xAxisHeight, svgContainerSize]) => {
      if (svgContainerSize == null || yAxisWidth == null) {
        return undefined;
      }
      return {
        x: yAxisWidth,
        y: 0,
        width: svgContainerSize.width - yAxisWidth,
        height: svgContainerSize.height - xAxisHeight,
        bars: barLocations
      };
    })
  );

  _yAxisColor: string;

  constructor(private readonly _zone: NgZone, private readonly _theme: ThemeService) {
    this._yAxisColor = _theme.currentTheme === 'dark' ? '#3f4045' : '#f4f4f4';
  }

  ngOnDestroy(): void {
    this._chartContainerObserver.disconnect();
  }

  _overlayData?: {
    overlayOrigin: FlexibleConnectedPositionStrategyOrigin;
    overlayPoint: any;
  };

  showPointOverlay(point: any, rect: HTMLElement) {
    const boundingBox = rect.getBoundingClientRect();
    this._overlayData = {
      overlayOrigin: {
        x: boundingBox.x + boundingBox.width,
        y: boundingBox.y + boundingBox.height / 2
      },
      overlayPoint: point
    };
  }

  hidePointOverlay() {
    this._overlayData = undefined;
  }
}
