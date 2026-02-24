import { FlexibleConnectedPositionStrategyOrigin } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { scaleLinear, scaleTime } from 'd3-scale';
import { map as ldMap, maxBy, minBy } from 'lodash-es';
import { BehaviorSubject, combineLatest, of, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemeService } from 'src/app/service/theme/theme.service';
import { ChartOptions } from '../../../../model/chart.model';

export type BarChartOptions = {
  overlayTemplate?: TemplateRef<any>;
  barColor?: string;
};

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChartComponent implements OnDestroy {
  @HostBinding('class') hostClass = 'block w-full h-full';

  @Input() set options(v: Partial<BarChartOptions>) {
    this._optionsSubject.next({
      ...v
    });
  }

  @Input() set data(v: ChartOptions['series']) {
    this._seriesDataSubject.next(v ?? []);
  }

  private _chartContainer?: ElementRef<HTMLDivElement>;

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

  private _optionsSubject = new BehaviorSubject<BarChartOptions>({});
  private _options$ = this._optionsSubject.asObservable();
  private _seriesDataSubject = new ReplaySubject<ChartOptions['series']>(1);
  private _seriesData$ = this._seriesDataSubject.asObservable();
  private _svgContainerSizeSubject = new ReplaySubject<{ width: number; height: number } | undefined>(1);
  private _svgContainerSize$ = this._svgContainerSizeSubject.asObservable();

  private _xAxisHeight$ = of(32);
  private _barWidth$ = of(8);

  private _mappedData$ = combineLatest([this._seriesData$]).pipe(
    map(([v]) => {
      const bars = v.flatMap(s => s.data.filter(d => !!Date.parse(d.x)).map(d => ({ name: s.name, x: new Date(d.x), y: d.y, data: d })));

      const maxY = maxBy(bars, 'y')?.y;

      return {
        maxY,
        bars
      };
    })
  );
  private _barDates$ = combineLatest([this._mappedData$]).pipe(map(([bars]) => ldMap(bars.bars, 'x')));
  private _maxY$ = combineLatest([this._mappedData$]).pipe(map(([bars]) => bars.maxY));
  private _yAxisWidth$ = this._maxY$.pipe(map(maxY => (maxY == null ? undefined : 8 * maxY.toString().length + 16)));
  private _xScale$ = combineLatest([this._mappedData$, this._yAxisWidth$, this._svgContainerSize$]).pipe(
    map(([mappedData, yAxisWidth, svgContainerSize]) => {
      if (svgContainerSize == null || yAxisWidth == null) {
        return undefined;
      }
      const range = [32, svgContainerSize.width - yAxisWidth - 32];
      const minDate = minBy(mappedData.bars, 'x')?.x;
      const maxDate = maxBy(mappedData.bars, 'x')?.x;
      if (minDate == null || maxDate == null) {
        return undefined;
      }
      const domain = [minDate, maxDate];
      return scaleTime(domain, range);
    })
  );
  private _yScale$ = combineLatest([this._xAxisHeight$, this._maxY$, this._svgContainerSize$]).pipe(
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
        x: xScale(bar.x),
        width: barWidth,
        y: yScale(bar.y),
        height: yScale(0) - yScale(bar.y),
        data: bar.data
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
  _overlayTemplate$ = combineLatest([this._options$]).pipe(map(([options]) => options.overlayTemplate));

  _yAxisColor: string;

  constructor(private readonly _zone: NgZone, _theme: ThemeService) {
    this._yAxisColor = _theme.currentTheme === 'dark' ? '#3f4045' : '#f4f4f4';
  }

  ngOnDestroy(): void {
    this._chartContainerObserver.disconnect();
  }

  _overlayData?: {
    overlayOrigin: FlexibleConnectedPositionStrategyOrigin;
    data: any;
  };

  showPointOverlay(point: any, rect: HTMLElement) {
    const boundingBox = rect.getBoundingClientRect();
    this._overlayData = {
      overlayOrigin: {
        x: boundingBox.x + boundingBox.width,
        y: boundingBox.y + boundingBox.height / 2
      },
      data: point
    };
  }

  hidePointOverlay() {
    this._overlayData = undefined;
  }

  barColor$ = combineLatest([this._options$]).pipe(map(([options]) => options.barColor ?? 'var(--info-500)'));
}
