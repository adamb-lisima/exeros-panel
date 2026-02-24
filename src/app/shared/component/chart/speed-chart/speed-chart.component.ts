import { FlexibleConnectedPositionStrategyOrigin } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { scaleLinear, scaleTime } from 'd3-scale';
import { curveLinear, line } from 'd3-shape';
import { max, maxBy, minBy } from 'lodash-es';
import { DateTime } from 'luxon';
import { combineLatest, map, of, ReplaySubject, Subject, Subscription, tap, withLatestFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from 'src/app/service/theme/theme.service';
import { filterNullish } from 'src/app/util/operators';

interface PointRect {
  data: {
    x: Date;
    y: number;
    unit: string;
  };
  point: {
    x: number;
    y: number;
    id: number;
    unit: string;
  };
  rect: {
    x: number;
    y: number;
    width: number;
    height: string;
  };
}

interface EventStart {
  startTime: Date;
  type: string | null;
}

@Component({
  selector: 'app-speed-chart',
  templateUrl: './speed-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeedChartComponent implements OnInit, OnDestroy {
  @Input() event: {
    is_overlimit: boolean;
    speed: number;
  } | null = null;

  @Output() positionChange = new EventEmitter<Date | undefined>();

  @Input() set position(v: Date | null | undefined) {
    this._positionSubject.next(v);
  }

  @Input() set data(v: { x: Date; y: number; unit: string }[] | null | undefined) {
    this._seriesDataSubject.next(v ?? []);
  }

  @Input() set eventStart(v: EventStart | null) {
    this._eventStartSubject.next(v);
  }

  private sub?: Subscription;

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
        width: entries[0].target.clientWidth,
        height: entries[0].target.clientHeight - 32
      })
    );
  });

  private readonly _seriesDataSubject = new ReplaySubject<{ x: Date; y: number; unit: string }[]>(1);
  private readonly _seriesData$ = this._seriesDataSubject.asObservable();
  private readonly _positionSubject = new ReplaySubject<Date | undefined | null>(1);
  private readonly _selectedPointSubject = new Subject<
    | {
        x: number;
        y: number;
        date: Date;
        id: number;
      }
    | undefined
  >();
  private readonly _svgContainerSizeSubject = new ReplaySubject<{ width: number; height: number } | undefined>(1);
  private readonly _svgContainerSize$ = this._svgContainerSizeSubject.asObservable();
  private readonly _eventStartSubject = new ReplaySubject<EventStart | null>(1);

  private readonly _mappedData$ = combineLatest([this._seriesData$]).pipe(
    map(([data]) => ({
      points: data,
      maxY: maxBy(data, 'y')?.y,
      minY: minBy(data, 'y')?.y
    }))
  );
  private readonly _minY$ = combineLatest([this._mappedData$]).pipe(map(([mappedData]) => mappedData.minY));
  private readonly _maxY$ = combineLatest([this._mappedData$]).pipe(map(([mappedData]) => mappedData.maxY));
  private readonly _yAxisWidth$ = of(75);
  private readonly _xLabelWidth$ = of(120);
  private readonly _xScale$ = combineLatest([this._mappedData$, this._yAxisWidth$, this._svgContainerSize$]).pipe(
    map(([mappedData, yAxisWidth, svgContainerSize]) => {
      if (svgContainerSize == null || yAxisWidth == null) {
        return undefined;
      }
      const minDate: Date | undefined = minBy(mappedData.points, 'x')?.x;
      const maxDate: Date | undefined = maxBy(mappedData.points, 'x')?.x;
      if (minDate == null || maxDate == null) {
        return undefined;
      }
      const chartWidth = DateTime.fromJSDate(maxDate).diff(DateTime.fromJSDate(minDate), 'seconds').seconds * 15;
      const range = [16, chartWidth];
      const domain = [minDate, maxDate];
      return scaleTime(domain, range);
    })
  );
  private readonly _yScale$ = combineLatest([this._minY$, this._maxY$, this._svgContainerSize$]).pipe(
    map(([minY, maxY, svgContainerSize]) => {
      if (svgContainerSize == null || minY == null || maxY == null) {
        return undefined;
      }
      const domain = [minY, maxY];
      const range = [svgContainerSize.height, 16]; // 32 is to allow space for final tick
      return scaleLinear(domain, range).nice();
    })
  );
  private readonly _line$ = combineLatest([this._mappedData$, this._xScale$, this._yScale$, this._svgContainerSize$]).pipe(
    map(([mappedData, xScale, yScale, svgContainerSize]) => {
      if (xScale == null || yScale == null || svgContainerSize == null) {
        return undefined;
      }

      const lineData = line<{ x: Date; y: number }>(
        point => xScale(point.x),
        point => yScale(point.y)
      ).curve(curveLinear)(mappedData.points ?? []);

      const pointRects = mappedData.points.map((point, i) => ({
        data: point,
        point: {
          x: xScale(point.x),
          y: yScale(point.y),
          id: i,
          unit: point.unit
        },
        rect: {
          x: i === 0 ? xScale(point.x) : xScale(point.x) - (xScale(point.x) - xScale(mappedData.points[i - 1].x)) / 2,
          y: 0,
          width: i === mappedData.points.length - 1 ? (xScale(point.x) - xScale(mappedData.points[i - 1].x)) / 2 : i === 0 ? (xScale(mappedData.points[i + 1].x) - xScale(point.x)) / 2 : (xScale(mappedData.points[i + 1].x) - xScale(mappedData.points[i - 1].x)) / 2,
          height: '100%'
        }
      }));

      return {
        lineData,
        pointRects
      };
    })
  );

  private readonly destroy$ = new Subject<void>();

  _yAxisColor: string;
  _overlayData?: {
    overlayOrigin: FlexibleConnectedPositionStrategyOrigin;
    data: any;
  };

  _yAxis$ = combineLatest([this._yAxisWidth$, this._svgContainerSize$, this._yScale$]).pipe(
    map(([yAxisWidth, svgContainerSize, yScale]) => {
      if (svgContainerSize == null) {
        return undefined;
      }
      const x = 0;
      const y = 0;
      const width: number = yAxisWidth;
      const height = svgContainerSize;
      const ticks = yScale?.ticks(4).map(tick => ({ y: yScale(tick), text: `${tick}` }));
      return { x, y, width, height, ticks };
    })
  );

  _xAxis$ = combineLatest([this._xScale$.pipe(filterNullish()), this._xLabelWidth$]).pipe(
    map(([xScale, xLabelWidth]) => {
      const [start, end] = xScale.range();
      const ticks = Math.floor((end - start) / xLabelWidth);

      return xScale.ticks(ticks).map(tick => ({ x: xScale(tick), date: tick }));
    })
  );

  _chart$ = combineLatest([this._line$, this._yAxisWidth$, this._svgContainerSize$]).pipe(
    map(([line, yAxisWidth, svgContainerSize]) => {
      if (svgContainerSize == null || yAxisWidth == null) {
        return undefined;
      }
      const width = max([svgContainerSize.width - yAxisWidth, (maxBy(line?.pointRects, 'rect.x')?.rect.x ?? 0) + (maxBy(line?.pointRects, 'rect.x')?.rect.width ?? 0) + 16]);
      return {
        x: yAxisWidth,
        y: 0,
        width,
        height: svgContainerSize.height,
        lineData: line?.lineData,
        points: line?.pointRects
      };
    })
  );
  _position$ = combineLatest([this._line$, this._positionSubject]).pipe(
    map(([line, position]) => {
      if (line == null || position == null) {
        return undefined;
      }
      for (let i = 0; i < line.pointRects.length - 1; i++) {
        const curr = line?.pointRects[i];
        const next = line?.pointRects[i + 1];
        if (position >= curr.data.x && position <= next.data.x) {
          return curr;
        }
      }
      return line.pointRects[line.pointRects.length - 1];
    })
  );

  _smoothPosition$ = combineLatest([this._positionSubject, this._xScale$, this._line$]).pipe(
    map(([position, xScale, line]) => {
      if (xScale == null || position == null || line == null) {
        return undefined;
      }
      const [min, max] = xScale.domain();
      if (position < min || position > max) {
        return undefined;
      }
      return { x: xScale(position), y: this.getYPosition(position, line.pointRects), time: position };
    })
  );

  _eventStart$ = combineLatest([this._xScale$, this._eventStartSubject]).pipe(
    map(([xScale, eventStart]) => {
      if (xScale == null || eventStart == null) {
        return undefined;
      }
      const { startTime, type } = eventStart;
      return {
        pos: xScale(startTime),
        type
      };
    })
  );

  private getYPosition(position: Date, pointRects: PointRect[]): number {
    for (let i = 0; i < pointRects.length - 1; i++) {
      const prev = pointRects[i];
      const next = pointRects[i + 1];
      if (position >= prev.data.x && position <= next.data.x) {
        const domain = [prev.point.x, next.point.x];
        const range = [prev.point.y, next.point.y];
        const scale = scaleLinear(domain, range).nice();
        return scale(position);
      }
    }
    return 0;
  }

  private readonly centerChart$ = combineLatest([this._smoothPosition$, this._yAxisWidth$]).pipe(
    tap(([position, yAxisWidth]) => {
      if (position == null || !this.chartContainer) {
        return;
      }
      const clientWidth = this.chartContainer.nativeElement.clientWidth;
      const center = position.x - (clientWidth - yAxisWidth) / 2;
      this.chartContainer.nativeElement.scrollLeft = center < 0 ? 0 : center;
    })
  );

  _selectedPoint$ = this._selectedPointSubject.asObservable().pipe(
    withLatestFrom(this._line$, this._yScale$),
    map(([point, lineData, yScale]) => {
      if (point == null || yScale == null) {
        return null;
      }

      let position: 'first' | 'last' | 'default' = 'default';
      const isFirst = point?.id === lineData?.pointRects[0].point.id;
      const isLast = point?.id === lineData?.pointRects[lineData.pointRects.length - 1].point.id;

      if (isFirst) {
        position = 'first';
      } else if (isLast) {
        position = 'last';
      }
      return {
        ...point,
        position,
        speed: yScale.invert(point.y)
      };
    })
  );

  constructor(private readonly _zone: NgZone, _theme: ThemeService) {
    this._yAxisColor = _theme.currentTheme === 'dark' ? '#3f4045' : '#f4f4f4';
  }

  ngOnInit(): void {
    this.sub = this.centerChart$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this._chartContainerObserver.disconnect();

    this.destroy$.next();
    this.destroy$.complete();

    this.sub?.unsubscribe();
  }

  _showPointHover(point: any) {
    this._overlayData = {
      overlayOrigin: {
        x: point.point.x,
        y: point.point.y
      },
      data: point.data
    };
    this._selectedPointSubject.next({
      x: point.point.x,
      y: point.point.y,
      id: point.point.id,
      date: point.data.x
    });
  }

  _hidePointHover() {
    this._overlayData = undefined;
    this._selectedPointSubject.next(undefined);
  }

  _selectPoint(data: { x: Date; y: number; unit: string }) {
    this.positionChange.emit(data.x);
  }

  _chartContainerWheel(e: Event) {
    if (!this.chartContainer || !(e instanceof WheelEvent)) {
      return;
    }
    this.chartContainer.nativeElement.scrollLeft += e.deltaX + e.deltaY;
    e.preventDefault();
  }
}
