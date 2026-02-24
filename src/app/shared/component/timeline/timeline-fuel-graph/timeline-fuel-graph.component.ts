import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, firstValueFrom, map, Observable, of, ReplaySubject, Subject, Subscription, takeUntil } from 'rxjs';
import { FuelDataPoint, HybridDataPoint } from 'src/app/shared/component/timeline/timeline.model';
import { calculateAbsoluteXFromDate, calculateDateFromAbsoluteX, calculateDateFromVisibleX, maxBy, minBy, parseDate } from '../timeline-utils';

@Component({
  selector: 'app-timeline-fuel-graph',
  templateUrl: './timeline-fuel-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineFuelGraphComponent implements OnInit, OnDestroy {
  @Input() get data(): FuelDataPoint[] | null | undefined {
    return this._data;
  }
  @Input() get hybridData(): HybridDataPoint[] | null | undefined {
    return this._hybridData;
  }
  @Input() get maxFuel(): number | null | undefined {
    return this._maxFuel;
  }

  set maxFuel(v: number | null | undefined) {
    this._maxFuel = v;
  }

  set data(v: FuelDataPoint[] | null | undefined) {
    this._data = v;
    this._dataSubject.next(v?.map(x => ({ ...x, time: parseDate(x.time) })));
  }
  set hybridData(v: HybridDataPoint[] | null | undefined) {
    this._hybridData = v;
    this._hybridDataSubject.next(v?.map(x => ({ ...x, time: parseDate(x.time) })));
  }

  @Input() get position(): Date | null | undefined {
    return this._position;
  }

  set position(v: Date | null | undefined) {
    this._position = v;
    this._positionSubject.next(v);
    void this._scrollToPosition();
  }

  @Output() positionChange = new EventEmitter<Date | undefined>();

  @Input() get marker(): Date | null | undefined {
    return this._marker;
  }

  set marker(v: Date | null | undefined) {
    this._marker = v;
    this._markerSubject.next(v);
  }

  set playbackDownloadActive(v: boolean | null | undefined) {
    this._playbackDownloadActive = v;
  }

  @Input() get playbackDownloadActive(): boolean | null | undefined {
    return this._playbackDownloadActive;
  }

  @Output() markerChange = new EventEmitter<Date | undefined>();

  @ViewChild('pointsScrollContainer', { static: true }) get pointsScrollContainer(): ElementRef<HTMLDivElement> | undefined {
    return this._pointsScrollContainer;
  }

  @Input() clipToEventActive: boolean | null | undefined = false;
  @Input() playbackShareActive: boolean | null | undefined = false;

  set pointsScrollContainer(v: ElementRef<HTMLDivElement> | undefined) {
    this._pointsScrollContainer = v;
    if (v) {
      this._pointsScrollContainerWidthSubject.next(v.nativeElement.getBoundingClientRect().width);
      this._pointsScrollContainerScrollXSubject.next(0);
      this._pointsScrollContainerObserver.disconnect();
      this._pointsScrollContainerObserver.observe(v.nativeElement);
    } else {
      this._pointsScrollContainerObserver.disconnect();
      this._pointsScrollContainerWidthSubject.next(0);
      this._pointsScrollContainerWidthSubject.next(0);
    }
  }

  private _pointsScrollContainer?: ElementRef<HTMLDivElement>;

  readonly padding = 16;
  readonly chartHeightZeroToMax = 96;
  private readonly _positionSubject = new ReplaySubject<Date | null | undefined>(1);
  private readonly _position$ = this._positionSubject.asObservable();
  private _position: Date | null | undefined;
  private _marker: Date | null | undefined;
  private _playbackDownloadActive: boolean | null | undefined;
  private readonly _millisecondsPerPixel: number = (1 / 192) /* hours */ * (60 * 60 * 1000) /* milliseconds per hour */;
  private _data: FuelDataPoint[] | null | undefined;
  private _maxFuel: number | null | undefined;
  private readonly _dataSubject = new ReplaySubject<(FuelDataPoint & { time: Date })[] | null | undefined>(1);
  private _hybridData: HybridDataPoint[] | null | undefined;
  private readonly _hybridDataSubject = new ReplaySubject<(HybridDataPoint & { time: Date })[] | null | undefined>(1);
  private readonly _data$ = this._dataSubject.asObservable();
  private readonly _hybridData$ = this._hybridDataSubject.asObservable();
  private readonly _padding$ = of(this.padding);
  private readonly _millisecondsPerPixel$ = of(this._millisecondsPerPixel);
  private readonly _pointsScrollContainerScrollXSubject = new ReplaySubject<number>(1);
  private readonly _pointsScrollContainerScrollX$ = this._pointsScrollContainerScrollXSubject.asObservable();
  private readonly _pointsScrollContainerWidthSubject = new ReplaySubject<number>(1);
  private readonly _pointsScrollContainerWidth$ = this._pointsScrollContainerWidthSubject.asObservable();
  private readonly _pointsScrollContainerObserver: ResizeObserver = new ResizeObserver(entries => {
    this._zone.run(() => this._pointsScrollContainerWidthSubject.next(entries[0].target.getBoundingClientRect().width));
  });
  private readonly _pointsScrollContainerMousePositionSubject = new ReplaySubject<number | undefined>(1);
  private readonly _pointsScrollContainerMousePosition$ = this._pointsScrollContainerMousePositionSubject.asObservable();
  private readonly _hoveredEventSubject = new BehaviorSubject<{ x1: number } | undefined>(undefined);
  private readonly _hoveredEvent$ = this._hoveredEventSubject.asObservable();
  private readonly _markerSubject = new ReplaySubject<Date | null | undefined>(1);
  private readonly _pointsScrollContainerClickSubject = new Subject<MouseEvent>();
  private readonly _pointsScrollContainerClick$ = this._pointsScrollContainerClickSubject.pipe(debounceTime(250));
  private readonly _subscriptions = new Subscription();

  private readonly _destroy$ = new Subject<void>();

  scrollX$ = this._pointsScrollContainerScrollXSubject.asObservable();

  fuelGraphData$: Observable<{ minDate: Date; maxDate: Date; yAxis: { y: number }[]; data: { position: { x: number; y: number }; line?: { length: number; angle: number } }[] } | undefined> = this._data$.pipe(
    map(data => {
      if (data == null || !data.length) {
        return undefined;
      }
      data.sort((a, b) => (a.time as Date).valueOf() - (b.time as Date).valueOf());

      const result: { position: { x: number; y: number }; line?: { length: number; angle: number } }[] = [];
      const calculatePosition = (point: FuelDataPoint & { time: Date }) => {
        let fuelPercentage = 0;

        if (point.fuelLevel > 0) {
          fuelPercentage = point.fuelLevel;
        } else if (point.fuelVolume > 0 && this._maxFuel) {
          fuelPercentage = (point.fuelVolume / this._maxFuel) * 100;
        }

        return {
          x: calculateAbsoluteXFromDate(point.time, minBy(data, i => i.time)?.time ?? new Date(), this._millisecondsPerPixel, this.padding),
          y: this.padding + (fuelPercentage / 100) * this.chartHeightZeroToMax
        };
      };

      const calculateLine = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        const opposite = p2.y - p1.y;
        const hypoteneuse = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(opposite, 2));
        return { length: hypoteneuse, angle: Math.asin(opposite / hypoteneuse) };
      };

      result.push({ position: calculatePosition(data[0]) });

      for (let index = 0; index < data.length - 1; index++) {
        const position = calculatePosition(data[index + 1]);
        result[index].line = calculateLine(position, result[index].position);
        result.push({ position });
      }

      return {
        yAxis: [{ y: 25 }, { y: 50 }, { y: 75 }],
        minDate: data[0].time,
        maxDate: data[data.length - 1].time,
        data: result
      };
    })
  );

  hybridGraphData$: Observable<{ minDate: Date; maxDate: Date; yAxis: { y: number }[]; data: { position: { x: number; y: number }; line?: { length: number; angle: number } }[] } | undefined> = this._hybridData$.pipe(
    map(data => {
      if (data == null || !data.length) {
        return undefined;
      }
      data.sort((a, b) => (a.time as Date).valueOf() - (b.time as Date).valueOf());

      const result: { position: { x: number; y: number }; line?: { length: number; angle: number } }[] = [];
      const calculatePosition = (point: HybridDataPoint & { time: Date }) => {
        const fuelPercentage = point.hybridLevel;

        return {
          x: calculateAbsoluteXFromDate(point.time, minBy(data, i => i.time)?.time ?? new Date(), this._millisecondsPerPixel, this.padding),
          y: this.padding + (fuelPercentage / 100) * this.chartHeightZeroToMax
        };
      };

      const calculateLine = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        const opposite = p2.y - p1.y;
        const hypoteneuse = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(opposite, 2));
        return { length: hypoteneuse, angle: Math.asin(opposite / hypoteneuse) };
      };

      result.push({ position: calculatePosition(data[0]) });

      for (let index = 0; index < data.length - 1; index++) {
        const position = calculatePosition(data[index + 1]);
        result[index].line = calculateLine(position, result[index].position);
        result.push({ position });
      }

      return {
        yAxis: [{ y: 25 }, { y: 50 }, { y: 75 }],
        minDate: data[0].time,
        maxDate: data[data.length - 1].time,
        data: result
      };
    })
  );

  visibleStartDate$: Observable<Date | undefined> = combineLatest([this._padding$, this._millisecondsPerPixel$, this._pointsScrollContainerScrollX$, this.fuelGraphData$]).pipe(map(([padding, scale, pointsScrollContainerScrollX, data]) => (data == null ? undefined : calculateDateFromVisibleX(padding - 64, scale, pointsScrollContainerScrollX, padding, data.minDate))));

  visibleEndDate$: Observable<Date | undefined> = combineLatest([this._padding$, this._pointsScrollContainerWidth$, this._millisecondsPerPixel$, this._pointsScrollContainerScrollX$, this.fuelGraphData$]).pipe(map(([padding, width, scale, pointsScrollContainerScrollX, data]) => (data == null ? undefined : calculateDateFromVisibleX(-64 + width - padding, scale, pointsScrollContainerScrollX, padding, data.minDate))));

  timelinePixelWidth$ = combineLatest([this._padding$, this.fuelGraphData$]).pipe(map(([padding, data]) => 64 + padding + (maxBy(data?.data ?? [], d => d.position.x)?.position.x ?? 0)));

  markerPositionDate$ = this._markerSubject.asObservable();

  markerPositionX$ = combineLatest([this.markerPositionDate$, this.fuelGraphData$, this._millisecondsPerPixel$, this._padding$]).pipe(map(([position, data, millisecondsPerPixel]) => (position == null || data == null ? undefined : 64 + calculateAbsoluteXFromDate(position, data.minDate, millisecondsPerPixel, this.padding))));

  positionDate$ = combineLatest([this._position$, this.fuelGraphData$]).pipe(
    map(([position, data]) => {
      if (!data || !position) {
        return undefined;
      }
      if (position > data.maxDate) {
        return data.maxDate;
      }
      return position < data.minDate ? data.minDate : position;
    })
  );

  positionX$ = combineLatest([this.positionDate$, this.fuelGraphData$, this._millisecondsPerPixel$, this._padding$]).pipe(map(([position, data, millisecondsPerPixel]) => (position == null || data == null ? undefined : 64 + calculateAbsoluteXFromDate(position, data.minDate, millisecondsPerPixel, this.padding))));

  scrubberX$ = combineLatest([this._pointsScrollContainerMousePosition$, this._pointsScrollContainerScrollX$, this._hoveredEvent$]).pipe(
    map(([mousePosition, scrollX, hoveredEvent]) => {
      if (this.position && this.marker) {
        return undefined;
      }
      if (hoveredEvent) {
        return hoveredEvent.x1;
      }
      if (mousePosition != null) {
        return scrollX + mousePosition;
      }
      return undefined;
    })
  );

  markerRectangle$ = combineLatest([this.positionX$, this.markerPositionX$]).pipe(
    map(([markerX, positionX]) => {
      if (markerX == null || positionX == null) {
        return undefined;
      }
      if (markerX < positionX) {
        return { x: markerX, width: positionX - markerX };
      }
      return { x: positionX, width: markerX - positionX };
    })
  );

  scrubberDate$ = combineLatest([this.scrubberX$, this.fuelGraphData$, this._padding$, this._millisecondsPerPixel$]).pipe(
    map(([scrubberX, data, padding, millisecondsPerPixel]) => {
      if (scrubberX == null || data == null) {
        return undefined;
      }
      return calculateDateFromAbsoluteX(scrubberX - 64, data.minDate, padding, millisecondsPerPixel);
    })
  );

  scrubberInfo$ = combineLatest([this.scrubberDate$, this._data$, this._hybridData$]).pipe(
    map(([date, fuelData, hybridData]) => {
      if (date == null) {
        return null;
      }

      let fuelPercentage: number | null = null;
      if (fuelData && fuelData.length > 0) {
        fuelData.sort((a, b) => (a.time as Date).valueOf() - (b.time as Date).valueOf());
        const fuelIndex = fuelData.findIndex(v => v.time >= date);

        if (fuelIndex > 0 && fuelIndex < fuelData.length) {
          const prevData = fuelData[fuelIndex - 1];
          const nextData = fuelData[fuelIndex];
          const prevTime = prevData.time.getTime();
          const nextTime = nextData.time.getTime();
          const currTime = date.getTime();

          const getFuelPercentage = (point: FuelDataPoint & { time: Date }) => {
            if (point.fuelLevel > 0) {
              return point.fuelLevel;
            } else if (point.fuelVolume > 0 && this._maxFuel) {
              return (point.fuelVolume / this._maxFuel) * 100;
            }

            return 0;
          };

          const prevFuel = getFuelPercentage(prevData);
          const nextFuel = getFuelPercentage(nextData);

          const timeRatio = (currTime - prevTime) / (nextTime - prevTime);
          const fuelResult = (nextFuel - prevFuel) * timeRatio;
          fuelPercentage = prevFuel + fuelResult;
        }
      }

      // Calculate hybrid percentage
      let hybridPercentage: number | null = null;
      if (hybridData && hybridData.length > 0) {
        hybridData.sort((a, b) => (a.time as Date).valueOf() - (b.time as Date).valueOf());
        const hybridIndex = hybridData.findIndex(v => v.time >= date);

        if (hybridIndex > 0 && hybridIndex < hybridData.length) {
          const prevData = hybridData[hybridIndex - 1];
          const nextData = hybridData[hybridIndex];
          const prevTime = prevData.time.getTime();
          const nextTime = nextData.time.getTime();
          const currTime = date.getTime();

          const prevHybrid = prevData.hybridLevel;
          const nextHybrid = nextData.hybridLevel;

          const timeRatio = (currTime - prevTime) / (nextTime - prevTime);
          const hybridResult = (nextHybrid - prevHybrid) * timeRatio;
          hybridPercentage = prevHybrid + hybridResult;
        }
      }

      if (fuelPercentage !== null && hybridPercentage !== null) {
        return `Fuel: ${fuelPercentage.toFixed(1)}% | Battery: ${hybridPercentage.toFixed(1)}%`;
      } else if (fuelPercentage !== null) {
        return `Fuel: ${fuelPercentage.toFixed(1)}%`;
      } else if (hybridPercentage !== null) {
        return `Battery: ${hybridPercentage.toFixed(1)}%`;
      }

      return null;
    })
  );

  constructor(private readonly _zone: NgZone) {}

  ngOnInit(): void {
    this._handlePointsScrollContainerClick();
  }

  ngOnDestroy(): void {
    this._pointsScrollContainerObserver.disconnect();
    this._subscriptions.unsubscribe();

    this._destroy$.next();
    this._destroy$.complete();
  }

  pointsScrollContainerScroll() {
    this._pointsScrollContainerScrollXSubject.next(this.pointsScrollContainer?.nativeElement.scrollLeft ?? 0);
  }

  pointsScrollContainerMouseOver(e: MouseEvent) {
    const rect = this._pointsScrollContainer!.nativeElement.getBoundingClientRect();
    const x = e.pageX - rect.x;
    this._pointsScrollContainerMousePositionSubject.next(x);
  }

  pointsScrollContainerMouseLeave() {
    this._pointsScrollContainerMousePositionSubject.next(undefined);
  }

  pointsScrollContainerWheel(e: Event) {
    if (!this.pointsScrollContainer || !(e instanceof WheelEvent)) {
      return;
    }
    this.pointsScrollContainer.nativeElement.scrollLeft += e.deltaX + e.deltaY;
  }

  async pointsScrollContainerClick(e: MouseEvent) {
    this._pointsScrollContainerClickSubject.next(e);
  }

  private _handlePointsScrollContainerClick() {
    this._subscriptions.add(
      this._pointsScrollContainerClick$.pipe(takeUntil(this._destroy$)).subscribe({
        next: (e: MouseEvent) => {
          this._calculateAbsoluteXFromPageX(e.pageX)
            .then(x => {
              if (!this.position) {
                return this._setPositionFromAbsoluteX(-64 + x);
              }
              if (!this.playbackDownloadActive) {
                return this._setPositionFromAbsoluteX(-64 + x);
              }

              if (!this.marker) {
                return this._setMarkerToAbsoluteX(x);
              }

              return this._setPositionFromAbsoluteX(-64 + x).then(() => {
                this.marker = undefined;
                this.markerChange.next(this.marker);
              });
            })
            .catch(error => console.error('Error handling click:', error));
        },
        error: (err: unknown) => console.error('Error in pointsScrollContainerClick$:', err)
      })
    );
  }

  private async _setMarkerToAbsoluteX(x: number) {
    if (this.position == null) {
      this._markerSubject.next(undefined);
      return;
    }
    const minDate = (await firstValueFrom(this.fuelGraphData$))?.minDate;
    const padding = await firstValueFrom(this._padding$);
    const millisecondsPerPixel = await firstValueFrom(this._millisecondsPerPixel$);

    if (minDate == null) {
      this._markerSubject.next(undefined);
      return;
    }

    this.marker = calculateDateFromAbsoluteX(x - 64, minDate, padding, millisecondsPerPixel);
    this.markerChange.next(this.marker);
  }

  private async _calculateAbsoluteXFromPageX(x: number) {
    const rect = this._pointsScrollContainer!.nativeElement.getBoundingClientRect();

    const scrollX = await firstValueFrom(this._pointsScrollContainerScrollX$);

    return x - rect.x + scrollX;
  }

  private async _setPositionFromAbsoluteX(x: number) {
    const data = await firstValueFrom(this.fuelGraphData$);
    const padding = await firstValueFrom(this._padding$);
    const millisecondsPerPixel = await firstValueFrom(this._millisecondsPerPixel$);

    if (data == null) {
      return;
    }

    const position = calculateDateFromAbsoluteX(x, data.minDate, padding, millisecondsPerPixel);
    this.position = position;
    this.positionChange.next(position);
  }

  private async _scrollToPosition() {
    const position = await firstValueFrom(this.positionX$);
    if (this.pointsScrollContainer == null || position == null) {
      return;
    }
    const width = await firstValueFrom(this._pointsScrollContainerWidth$);
    const scrollX = await firstValueFrom(this._pointsScrollContainerScrollX$);
    if (position > scrollX + width) {
      this.pointsScrollContainer.nativeElement.scrollBy({ left: width });
    }
  }

  combinedGraphData$ = combineLatest([this.fuelGraphData$, this.hybridGraphData$]).pipe(
    map(([fuelData, hybridData]) => ({
      fuelData,
      hybridData,
      hasAny: !!fuelData || !!hybridData
    }))
  );
}
