import { Dialog } from '@angular/cdk/dialog';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, NgZone, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, debounceTime, filter, first, firstValueFrom, map, of, pairwise, ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HighlightMarkers, Icon, IconGroup, TimelineEvent, TimelineIcon } from 'src/app/shared/component/timeline/timeline.model';
import RouteConst from '../../../../const/route';
import { AccessGroup } from '../../../../screen/settings/settings.model';
import { AlarmTimeline } from '../../../../screen/stream/stream.model';
import { StreamState } from '../../../../screen/stream/stream.reducer';
import { TimelineEventVideoComponent } from '../timeline-event-video/timeline-event-video.component';
import { calculateAbsoluteXFromDate, calculateDateFromAbsoluteX, calculateDateFromVisibleX, max, maxBy, min, minBy, parseDate } from '../timeline-utils';

interface AlarmRange {
  x1: number;
  x2: number;
  name: string;
  type: string;
  count?: number;
  width?: number;
  event_icon?: string;
  time?: string;
  event_id?: number | null;
  thumbnail?: string | null;
  alarms?: any[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-timeline-events',
  templateUrl: './timeline-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineEventsComponent implements OnInit, OnDestroy {
  accessGroup = AccessGroup;
  readonly iconSize = 36;
  readonly padding = 16;
  private readonly _millisecondsPerPixel: number = 500;
  private readonly _padding$ = of(this.padding);
  private readonly _millisecondsPerPixel$ = new BehaviorSubject(this._millisecondsPerPixel);
  private readonly _timelineEventsScrollContainerScrollXSubject = new ReplaySubject<number>(1);
  private readonly _timelineEventsScrollContainerScrollX$ = this._timelineEventsScrollContainerScrollXSubject.pipe();
  private readonly _timelineEventsScrollContainerWidthSubject = new ReplaySubject<number>(1);
  private readonly _timelineEventsScrollContainerWidth$ = this._timelineEventsScrollContainerWidthSubject.asObservable();
  private readonly timelineEventsScrollContainerMousePositionSubject = new ReplaySubject<number | undefined>(1);
  private readonly _timelineEventsScrollContainerMousePosition$ = this.timelineEventsScrollContainerMousePositionSubject.asObservable();
  private readonly _hoveredEventSubject = new BehaviorSubject<{ x1: number } | undefined>(undefined);
  private readonly _hoveredEvent$ = this._hoveredEventSubject.asObservable();
  private readonly _dataSubject = new ReplaySubject<{ events: (TimelineEvent & { start_time: Date; end_time: Date })[]; icons: (TimelineIcon & { date: Date })[]; minDate: Date; maxDate: Date } | undefined>(1);
  private readonly _data$ = this._dataSubject.asObservable();
  private readonly _timelineEventsScrollContainerClickSubject = new Subject<MouseEvent>();
  private readonly _timelineEventsScrollContainerClick$ = this._timelineEventsScrollContainerClickSubject.pipe(debounceTime(250));
  private readonly _timelineEventsScrollContainerObserver: ResizeObserver = new ResizeObserver(entries => {
    this._zone.run(() => this._timelineEventsScrollContainerWidthSubject.next(entries[0].target.getBoundingClientRect().width));
  });
  private readonly _zoomSubject$ = new BehaviorSubject<number>(1);
  private readonly _subscriptions = new Subscription();
  private readonly _isOnIconSubject = new BehaviorSubject<boolean>(false);
  private readonly _isOnIcon$ = this._isOnIconSubject.asObservable();
  private readonly _destroy$ = new Subject<void>();

  private _alarmTimeline: AlarmTimeline[] | null | undefined;
  private readonly _alarmHighlightRanges$ = new BehaviorSubject<AlarmRange[]>([]);
  public alarmHighlightRanges$ = this._alarmHighlightRanges$.asObservable();

  @Input() get data(): { events?: TimelineEvent[]; icons?: TimelineIcon[] } | null | undefined {
    return this._data;
  }

  @Input() clipToEventActive: boolean | null | undefined = false;
  @Input() playbackShareActive: boolean | null | undefined = false;

  @Input() set alarmTimeline(value: AlarmTimeline[] | null | undefined) {
    this._alarmTimeline = value;
    this._data$.pipe(first(), takeUntil(this._destroy$)).subscribe(data => {
      if (data) {
        this._processAlarmTimeline();
      }
    });
  }

  get alarmTimeline(): AlarmTimeline[] | null | undefined {
    return this._alarmTimeline;
  }

  set data(v: { events?: TimelineEvent[]; icons?: TimelineIcon[] } | null | undefined) {
    this._data = v;

    if (v == null || (!v?.events?.length && !v.icons?.length)) {
      this._dataSubject.next(undefined);
      return;
    }

    const minEvent = minBy(v?.events ?? [], item => item.startTime)?.startTime;
    const minIcon = minBy(v?.icons ?? [], item => item.date)?.date;
    const maxEvent = maxBy(v?.events ?? [], item => item.endTime)?.endTime;
    const maxIcon = maxBy(v?.icons ?? [], item => item.date)?.date;

    const minEventDate = typeof minEvent === 'string' ? parseDate(minEvent) : minEvent;
    const minIconDate = typeof minIcon === 'string' ? parseDate(minIcon) : minIcon;
    const maxEventDate = typeof maxEvent === 'string' ? parseDate(maxEvent) : maxEvent;
    const maxIconDate = typeof maxIcon === 'string' ? parseDate(maxIcon) : maxIcon;

    const minDate = min(minEventDate, minIconDate);
    const maxDate = max(maxEventDate, maxIconDate);

    if (minDate == null || maxDate == null) {
      this._dataSubject.next(undefined);
      return;
    }

    this._dataSubject.next({
      minDate,
      maxDate,
      events: v.events?.map(event => ({ ...event, start_time: parseDate(event.startTime), end_time: parseDate(event.endTime) })) ?? [],
      icons: v.icons?.map(icon => ({ ...icon, date: parseDate(icon.date) })) ?? []
    });
  }

  @Input() get position(): Date | null | undefined {
    return this._position;
  }

  set position(v: Date | null | undefined) {
    this._position = v;
    this._positionSubject.next(v);
    void this._scrollToPosition();
  }

  @Input() get marker(): Date | null | undefined {
    return this._marker;
  }

  set marker(v: Date | null | undefined) {
    this._marker = v;
    this._markerSubject.next(v);
  }

  _highlightedMarkers: HighlightMarkers | null = null;

  set playbackDownloadActive(v: boolean | null | undefined) {
    this._playbackDownloadActive = v;
  }

  @Input() get playbackDownloadActive(): boolean | null | undefined {
    return this._playbackDownloadActive;
  }

  @Output() markerChange = new EventEmitter<Date | undefined>();
  @Output() positionChange = new EventEmitter<Date | undefined>();

  @ViewChild('timelineEventsScrollContainer', { static: true }) get timelineEventsScrollContainer(): ElementRef<HTMLDivElement> | undefined {
    return this._timelineEventsScrollContainer;
  }

  set timelineEventsScrollContainer(v: ElementRef<HTMLDivElement> | undefined) {
    this._timelineEventsScrollContainer = v;
    if (v) {
      this._timelineEventsScrollContainerWidthSubject.next(v?.nativeElement.getBoundingClientRect().width);
      this._timelineEventsScrollContainerScrollXSubject.next(0);
      this._timelineEventsScrollContainerObserver.disconnect();
      this._timelineEventsScrollContainerObserver.observe(v.nativeElement);
    } else {
      this._timelineEventsScrollContainerObserver.disconnect();
      this._timelineEventsScrollContainerWidthSubject.next(0);
      this._timelineEventsScrollContainerScrollXSubject.next(0);
    }
  }

  isMenuOpen: boolean = false;
  isGroupHovered: boolean = false;

  onGroupHover(state: boolean) {
    this.isGroupHovered = state;
    this._isOnIconSubject.next(state);
  }

  private _data: { events?: TimelineEvent[]; icons?: TimelineIcon[] } | null | undefined;
  private _timelineEventsScrollContainer?: ElementRef<HTMLDivElement>;
  private readonly _positionSubject = new ReplaySubject<Date | null | undefined>(1);
  private readonly _markerSubject = new ReplaySubject<Date | null | undefined>(1);
  private readonly _position$ = this._positionSubject.asObservable();
  private _position: Date | null | undefined;
  private _marker: Date | null | undefined;
  private _playbackDownloadActive: boolean | null | undefined;

  scrubberX$ = combineLatest([this._timelineEventsScrollContainerMousePosition$, this._timelineEventsScrollContainerScrollX$, this._hoveredEvent$, this._isOnIcon$, of(this.playbackDownloadActive), of(this.playbackShareActive), of(this.clipToEventActive), of(this.marker)]).pipe(
    map(([mousePosition, scrollX, hoveredEvent, isOnIcon, playbackDownloadActive, playbackShareActive, clipToEventActive, marker]) => {
      if (playbackDownloadActive || playbackShareActive || clipToEventActive || marker) {
        return undefined;
      }

      if (this.position && this.marker) {
        return undefined;
      }
      if (hoveredEvent) {
        return hoveredEvent.x1;
      }
      if (mousePosition != null && !isOnIcon) {
        return scrollX + mousePosition;
      }
      return undefined;
    })
  );

  zoom$ = combineLatest([this._zoomSubject$, this._millisecondsPerPixel$]).pipe(map(([zoom, milis]) => milis / zoom));

  scrubberDate$ = combineLatest([this.scrubberX$, this._data$, this._padding$, this.zoom$]).pipe(map(([scrubberX, data, padding, zoom]) => (scrubberX == null || data == null ? undefined : calculateDateFromAbsoluteX(scrubberX, data.minDate, padding, zoom))));

  markerPositionDate$ = this._markerSubject.asObservable();

  markerPositionX$ = combineLatest([this.markerPositionDate$, this._data$, this.zoom$]).pipe(map(([position, data, zoom]) => (position == null || data == null ? undefined : calculateAbsoluteXFromDate(position, data.minDate, zoom, this.padding))));

  positionDate$ = combineLatest([this._position$, this._data$]).pipe(
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

  positionX$ = combineLatest([this.positionDate$, this._data$, this.zoom$]).pipe(map(([position, data, zoom]) => (position == null || data == null ? undefined : calculateAbsoluteXFromDate(position, data.minDate, zoom, this.padding))));

  clipRectangle$ = combineLatest([this.positionX$, this.markerPositionX$]).pipe(
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

  scrollX$ = this._timelineEventsScrollContainerScrollX$;

  visibleStartDate$ = combineLatest([this._padding$, this.zoom$, this._timelineEventsScrollContainerScrollX$, this._data$]).pipe(map(([padding, scale, timelineEventsScrollContainerScrollX, data]) => (data == null ? undefined : calculateDateFromVisibleX(padding, scale, timelineEventsScrollContainerScrollX, padding, data.minDate))));

  visibleEndDate$ = combineLatest([this._padding$, this._timelineEventsScrollContainerWidth$, this.zoom$, this._timelineEventsScrollContainerScrollX$, this._data$]).pipe(map(([padding, width, scale, timelineEventsScrollContainerScrollX, data]) => (data == null ? undefined : calculateDateFromVisibleX(width - padding, scale, timelineEventsScrollContainerScrollX, padding, data.minDate))));

  mappedData$ = combineLatest([this._data$, this.zoom$, this._padding$]).pipe(
    map(([data, msPerPx, padding]) => {
      if (!data) return null;

      const iconWidth = 36;
      const minSpacing = iconWidth * 2;
      const MAX_TIME_DIFF = 45 * 1000;

      const events = data?.events.map(event => ({
        x1: calculateAbsoluteXFromDate(event.start_time, data.minDate, msPerPx, padding),
        x2: calculateAbsoluteXFromDate(event.end_time, data.minDate, msPerPx, padding)
      }));

      const sortedIcons = data?.icons
        .map(icon => ({
          x: calculateAbsoluteXFromDate(icon.date, data.minDate, msPerPx, padding),
          icon: icon.icon,
          eventName: icon.eventName,
          eventIcon: icon.eventIcon,
          eventId: icon.eventId,
          date: icon.date,
          speed: icon.speed,
          temperature: icon.temperature,
          thumbnail: icon.thumbnail ?? null
        }))
        .sort((a, b) => {
          const timeA = new Date(a.date).getTime();
          const timeB = new Date(b.date).getTime();
          if (Math.abs(timeA - timeB) <= MAX_TIME_DIFF) {
            return a.x - b.x;
          }
          return timeA - timeB;
        });

      const iconGroups: IconGroup[] = [];
      let currentGroup: Icon[] = [];
      let lastX = -Infinity;
      let groupStartTime = 0;

      sortedIcons.forEach(icon => {
        const iconTime = new Date(icon.date).getTime();
        const xDiff = Math.abs(icon.x - lastX);

        const prevGroup = iconGroups[iconGroups.length - 1];
        const distanceFromPrevGroup = prevGroup ? Math.abs(icon.x - (prevGroup.x + (prevGroup.icons.length > 1 ? iconWidth : 0))) : Infinity;

        if (currentGroup.length === 0) {
          if (prevGroup && distanceFromPrevGroup < minSpacing) {
            prevGroup.icons.push({
              ...icon,
              thumbnail: icon.thumbnail ?? ''
            });
            lastX = icon.x;
          } else {
            currentGroup = [icon];
            lastX = icon.x;
            groupStartTime = iconTime;
          }
        } else {
          const timeDiff = Math.abs(iconTime - groupStartTime);

          if (timeDiff <= MAX_TIME_DIFF && xDiff < minSpacing) {
            currentGroup.push({
              ...icon,
              thumbnail: icon.thumbnail ?? ''
            });
            if (icon.x > lastX) {
              lastX = icon.x;
            }
          } else {
            if (currentGroup.length > 0) {
              if (prevGroup && Math.abs(currentGroup[0].x - prevGroup.x) < minSpacing) {
                prevGroup.icons.push(...currentGroup);
              } else {
                iconGroups.push({
                  x: currentGroup[0].x,
                  icons: currentGroup,
                  isExpanded: false
                });
              }
            }
            currentGroup = [icon];
            lastX = icon.x;
            groupStartTime = iconTime;
          }
        }
      });

      if (currentGroup.length > 0) {
        iconGroups.push({
          x: currentGroup[0].x,
          icons: currentGroup,
          isExpanded: false
        });
      }

      return {
        events,
        iconGroups
      };
    })
  );

  @Input() set isFullscreen(value: boolean) {
    if (value) {
      this._zoomSubject$.next(3);
    } else {
      this._zoomSubject$.next(1);
    }
  }

  timelinePixelWidth$ = combineLatest([this._padding$, this.zoom$, this._data$]).pipe(map(([padding, zoom, data]) => (data == null ? undefined : padding + calculateAbsoluteXFromDate(data?.maxDate, data?.minDate, zoom, padding))));

  constructor(private readonly router: Router, private readonly _zone: NgZone, private readonly store: Store<{ stream: StreamState }>, private readonly dialog: Dialog) {
    this._subscriptions.add(
      this.store
        .select(state => state.stream.isTimelineFullscreen)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: isFullscreen => {
            if (isFullscreen) {
              this._zoomSubject$.next(1.75);
            } else {
              this._zoomSubject$.next(1);
            }
          },
          error: (error: Error) => console.error('Error in isTimelineFullscreen subscription:', error)
        })
    );
  }

  ngOnInit(): void {
    this._handleTimelineEventsScrollContainerClick();
    this._subscriptions.add(
      this.zoom$.pipe(pairwise(), takeUntil(this._destroy$)).subscribe({
        next: ([prevZoom, currZoom]) => {
          this._handleZoomChange(prevZoom, currZoom);
        },
        error: (error: Error) => console.error('Error in zoom$ subscription:', error)
      })
    );

    this._subscriptions.add(
      this._timelineEventsScrollContainerWidth$
        .pipe(
          filter(width => width > 0),
          first(),
          takeUntil(this._destroy$)
        )
        .subscribe({
          next: containerWidth => {
            this._handleContainerWidthInitialized(containerWidth);
          },
          error: (error: Error) => console.error('Error in _timelineEventsScrollContainerWidth$ subscription:', error)
        })
    );

    this._subscriptions.add(
      combineLatest([this._data$, this.zoom$])
        .pipe(
          filter(([data]) => !!data),
          takeUntil(this._destroy$)
        )
        .subscribe({
          next: () => {
            if (this._alarmTimeline?.length) {
              this._calculateAlarmHighlightRanges();
            }
          },
          error: (error: Error) => console.error('Error in data/zoom subscription for alarms:', error)
        })
    );
  }

  private _handleZoomChange(prevZoom: number, currZoom: number): void {
    firstValueFrom(this._timelineEventsScrollContainerWidth$)
      .then(containerWidth => {
        return firstValueFrom(this.timelinePixelWidth$).then(width => {
          return firstValueFrom(this._timelineEventsScrollContainerMousePosition$).then(mousePosition => {
            return firstValueFrom(this._data$).then(data => {
              if (!data || !this.timelineEventsScrollContainer) return;

              const prevScroll = this.timelineEventsScrollContainer.nativeElement.scrollLeft;
              const absoluteX = prevScroll + (mousePosition ?? 0);
              const timeAtCursor = calculateDateFromAbsoluteX(absoluteX, data.minDate, this.padding, prevZoom);

              const newAbsoluteX = calculateAbsoluteXFromDate(timeAtCursor, data.minDate, currZoom, this.padding);
              const newScroll = newAbsoluteX - (mousePosition ?? 0);

              const maxScroll = (width ?? 0) - containerWidth;
              this.timelineEventsScrollContainer.nativeElement.scrollLeft = Math.max(0, Math.min(newScroll, maxScroll));
              this.timelineEventsScrollContainerScroll();
            });
          });
        });
      })
      .catch(error => console.error('Error handling zoom change:', error));
  }

  private _handleContainerWidthInitialized(containerWidth: number): void {
    firstValueFrom(this.timelinePixelWidth$)
      .then(timelineWidth => {
        const newMilis = (this._millisecondsPerPixel * (timelineWidth ?? 0)) / (containerWidth - 2 * this.padding);
        this._millisecondsPerPixel$.next(newMilis);
      })
      .catch(error => console.error('Error handling container width initialization:', error));
  }

  ngOnDestroy(): void {
    this._timelineEventsScrollContainerObserver.disconnect();
    this._subscriptions.unsubscribe();
    this._destroy$.next();
    this._destroy$.complete();
  }

  timelineEventsScrollContainerMouseLeave() {
    this.timelineEventsScrollContainerMousePositionSubject.next(undefined);
  }

  timelineEventsScrollContainerMouseOver(e: MouseEvent) {
    const rect = this._timelineEventsScrollContainer!.nativeElement.getBoundingClientRect();
    const x = e.pageX - rect.x;
    this.timelineEventsScrollContainerMousePositionSubject.next(x);
  }

  timelineEventsScrollContainerScroll() {
    this._timelineEventsScrollContainerScrollXSubject.next(this.timelineEventsScrollContainer?.nativeElement.scrollLeft ?? 0);
  }

  async onWheel(event: WheelEvent) {
    const deltaY = event.deltaY;
    const deltaX = event.deltaX;
    if (deltaY != 0 && deltaX === 0) {
      const zoomFactor = this.calculateZoom(this._zoomSubject$.value, deltaY);
      this._zoomSubject$.next(zoomFactor);
      event.stopPropagation();
    }
  }

  calculateZoom(currentValue: number, deltaY: number): number {
    const zoom = currentValue - deltaY * 0.03;
    const maxZoom = 6;
    const minZoom = 1;

    if (zoom > maxZoom) {
      return maxZoom;
    }
    if (zoom < minZoom) {
      return minZoom;
    }
    return zoom;
  }

  async setPositionFromAbsoluteX(x: number) {
    const data = await firstValueFrom(this._data$);
    const padding = await firstValueFrom(this._padding$);
    const zoom = await firstValueFrom(this.zoom$);

    if (data == null) {
      return;
    }

    const position = calculateDateFromAbsoluteX(x, data.minDate, padding, zoom);

    this.position = position;
    this.positionChange.next(position);
    await this._scrollToPosition();
  }

  timelineEventsScrollContainerClick(e: MouseEvent) {
    this._timelineEventsScrollContainerClickSubject.next(e);
  }

  timelineEventsScrollContainerKeyDown(): void {
    if (!this.timelineEventsScrollContainer) return;

    const rect = this.timelineEventsScrollContainer.nativeElement.getBoundingClientRect();
    const syntheticMouseEvent = {
      pageX: rect.x + rect.width / 2,
      pageY: rect.y + rect.height / 2,
      stopPropagation: () => {}
    } as MouseEvent;

    this.timelineEventsScrollContainerClick(syntheticMouseEvent);
  }

  timelineEventsScrollContainerMouseWheel(e: Event) {
    if (!this.timelineEventsScrollContainer || !(e instanceof WheelEvent)) {
      return;
    }
    this.timelineEventsScrollContainer.nativeElement.scrollLeft += e.deltaX + e.deltaY;
  }

  onHighlightMouseLeave() {
    this._isOnIconSubject.next(false);
    this._highlightedMarkers = null;
  }

  async onMouseOverHandle(index: number): Promise<void> {
    const data = await firstValueFrom(this.mappedData$);
    if (!data) {
      return;
    }

    const { iconGroups } = data;
    if (!iconGroups) {
      return;
    }

    const icon = iconGroups[index];
    const x = icon.x;
    let tempIcons = [icon];
    let currX = x;

    if (index > 0) {
      for (let i = index - 1; i >= 0; i--) {
        if (iconGroups[i].x + this.iconSize > currX) {
          tempIcons.unshift(iconGroups[i]);
          currX = iconGroups[i].x;
        } else {
          break;
        }
      }
    }

    currX = x;

    if (index < iconGroups.length - 1) {
      for (let i = index + 1; i < iconGroups.length; i++) {
        if (iconGroups[i].x - this.iconSize < currX) {
          tempIcons.push(iconGroups[i]);
          currX = iconGroups[i].x;
        } else {
          break;
        }
      }
    }

    if (tempIcons.length === 1) {
      this._highlightedMarkers = null;
      return;
    }

    const width = await firstValueFrom(this.timelinePixelWidth$);
    const position = tempIcons[0].x;
    const shouldFlip = position + 3 * this.iconSize > width!;

    const icons = tempIcons.reduce((acc: Icon[], group) => [...acc, ...group.icons], []);

    this._highlightedMarkers = {
      icons,
      flip: shouldFlip,
      position: icon.x
    };
  }

  private async _calculateAbsoluteXFromPageX(x: number) {
    const rect = this._timelineEventsScrollContainer!.nativeElement.getBoundingClientRect();
    const scrollX = await firstValueFrom(this._timelineEventsScrollContainerScrollX$);
    return x - rect.x + scrollX;
  }

  private async _scrollToPosition() {
    const position = await firstValueFrom(this.positionX$);
    if (this.timelineEventsScrollContainer == null || position == null) {
      return;
    }
    const width = await firstValueFrom(this._timelineEventsScrollContainerWidth$);
    const scrollX = await firstValueFrom(this._timelineEventsScrollContainerScrollX$);
    if (position > scrollX + width) {
      this.timelineEventsScrollContainer.nativeElement.scrollBy({ left: width });
    }
  }

  private _handleTimelineEventsScrollContainerClick() {
    this._subscriptions.add(
      this._timelineEventsScrollContainerClick$.pipe(takeUntil(this._destroy$)).subscribe({
        next: e => {
          this._handleClick(e);
        },
        error: (error: Error) => console.error('Error in _timelineEventsScrollContainerClick$ subscription:', error)
      })
    );
  }

  private _handleClick(e: MouseEvent): void {
    this._calculateAbsoluteXFromPageX(e.pageX)
      .then(x => {
        return this.setPositionFromAbsoluteX(x).then(() => {
          if (this.playbackDownloadActive && this.marker) {
            this.marker = undefined;
            this.markerChange.next(this.marker);
          }
        });
      })
      .catch(error => console.error('Error handling click:', error));
  }

  private currentOpenedGroupId: number | null = null;
  private isTogglingMenu = false;

  toggleGroup(group: IconGroup, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    if (this.isTogglingMenu) {
      return;
    }

    this.isTogglingMenu = true;
    this._closeOpenAlarms();

    this.mappedData$.pipe(first(), takeUntil(this._destroy$)).subscribe({
      next: data => {
        if (!data) {
          this._finishToggling();
          return;
        }

        const clickedGroupIndex = this._findClickedGroupIndex(data, group);

        if (clickedGroupIndex === -1) {
          this._handleGroupNotFound();
          return;
        }

        const actualGroup = data.iconGroups[clickedGroupIndex];

        if (this.currentOpenedGroupId === clickedGroupIndex) {
          this._closeCurrentGroup(actualGroup, clickedGroupIndex);
          return;
        }

        this._closeCurrentlyOpenedGroup(data);
        this._openNewGroup(actualGroup, clickedGroupIndex);
      },
      error: (error: Error) => {
        console.error('Error in toggleGroup:', error);
        this._finishToggling();
      }
    });
  }

  private _finishToggling(): void {
    this.isTogglingMenu = false;
  }

  private _closeOpenAlarms(): void {
    if (this.currentOpenedAlarmId !== null) {
      const alarmRanges = this._alarmHighlightRanges$.getValue();
      if (alarmRanges && this.currentOpenedAlarmId < alarmRanges.length) {
        const currentAlarm = alarmRanges[this.currentOpenedAlarmId];
        if (currentAlarm) {
          currentAlarm.isExpanded = false;
        }

        const currentTrigger = this.alarmMenuTriggers.toArray()[this.currentOpenedAlarmId];
        if (currentTrigger) {
          currentTrigger.close();
        }
      }
      this.currentOpenedAlarmId = null;
      this._alarmHighlightRanges$.next([...alarmRanges]);
    }
  }

  private _findClickedGroupIndex(data: any, group: IconGroup): number {
    return data.iconGroups.findIndex((g: IconGroup) => Math.abs(g.x - group.x) < 0.001 && g.icons.length === group.icons.length);
  }

  private _handleGroupNotFound(): void {
    if (this.menuTriggers && this.menuTriggers.length > 0) {
      this.menuTriggers.forEach(trigger => trigger.close());
      this._tryOpenFirstAvailableTrigger();
    } else {
      this._finishToggling();
    }
  }

  private _tryOpenFirstAvailableTrigger(): void {
    for (let i = 0; i < this.menuTriggers.length; i++) {
      const trigger = this.menuTriggers.toArray()[i];
      if (trigger) {
        setTimeout(() => {
          trigger.open();
          this._finishToggling();
        }, 50);
        break;
      }
    }
  }

  private _closeCurrentGroup(group: any, index: number): void {
    this.currentOpenedGroupId = null;
    group.isExpanded = false;
    this.isMenuOpen = false;

    const trigger = this.menuTriggers.toArray()[index];
    if (trigger) {
      trigger.close();
    }

    this._finishToggling();
  }

  private _closeCurrentlyOpenedGroup(data: any): void {
    if (this.currentOpenedGroupId !== null && this.currentOpenedGroupId < data.iconGroups.length) {
      const currentGroup = data.iconGroups[this.currentOpenedGroupId];
      currentGroup.isExpanded = false;

      const currentTrigger = this.menuTriggers.toArray()[this.currentOpenedGroupId];
      if (currentTrigger) {
        currentTrigger.close();
      }
    }
  }

  private _openNewGroup(group: any, index: number): void {
    group.isExpanded = true;
    this.currentOpenedGroupId = index;
    this.isMenuOpen = true;

    setTimeout(() => {
      const trigger = this.menuTriggers.toArray()[index];
      if (trigger) {
        trigger.open();
      }
      this._finishToggling();
    }, 50);
  }

  toggleGroupByKeyboard(group: any): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.toggleGroup(group, syntheticMouseEvent);
  }

  closeAllGroups() {
    this.mappedData$.pipe(first(), takeUntil(this._destroy$)).subscribe({
      next: data => {
        if (data) {
          data.iconGroups.forEach(g => (g.isExpanded = false));
        }
      },
      error: (error: Error) => console.error('Error in closeAllGroups subscription:', error)
    });
  }

  @ViewChildren(CdkMenuTrigger) menuTriggers!: QueryList<CdkMenuTrigger>;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('[id^="cdk-overlay"]') && !target.closest('.group')) {
      this.menuTriggers.forEach(trigger => {
        trigger.close();
      });

      this.currentOpenedGroupId = null;
      this.isMenuOpen = false;

      this.mappedData$.pipe(first(), takeUntil(this._destroy$)).subscribe({
        next: data => {
          if (data) {
            data.iconGroups.forEach(g => {
              g.isExpanded = false;
            });
          }
        },
        error: (error: Error) => console.error('Error in onDocumentClick subscription:', error)
      });
    }
  }

  isCurrentPosition(icon: Icon): boolean {
    if (!this.position || !icon.date) return false;
    return this.position.getTime() === new Date(icon.date).getTime();
  }

  openEventDetails(icon: Icon) {
    if (icon.eventId) {
      window.open(`/#/${RouteConst.events}/${icon.eventId}`, '_blank');
    }
  }

  showFullList = false;

  closeFullList() {
    this.showFullList = false;
  }

  fullListIcons$ = combineLatest([this._data$, this.zoom$]).pipe(
    map(([data, zoom]) => {
      if (!data?.icons) return [];
      return data.icons
        .map(icon => ({
          ...icon,
          x: calculateAbsoluteXFromDate(icon.date, data.minDate, zoom, this.padding)
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    })
  );

  showAllEvents(event: MouseEvent) {
    event.stopPropagation();
    this.menuTriggers.forEach(trigger => trigger.close());
    this.mappedData$.pipe(first(), takeUntil(this._destroy$)).subscribe({
      next: data => {
        if (data) {
          data.iconGroups.forEach(g => (g.isExpanded = false));
        }
        this.isMenuOpen = false;
        this.showFullList = true;
      },
      error: (error: Error) => console.error('Error in showAllEvents subscription:', error)
    });
  }

  setPositionFromAbsoluteXAndCloseList(x: number) {
    this.closeFullList();
    setTimeout(() => {
      this.setPositionFromAbsoluteX(x).catch(error => console.error('Error in setPositionFromAbsoluteXAndCloseList:', error));
    }, 100);
  }

  private _alarmIcons: any[] = [];

  private _processAlarmTimeline() {
    if (!this._alarmTimeline?.length) {
      this._alarmHighlightRanges$.next([]);
      return;
    }

    const alarmIcons = this._alarmTimeline.map(alarm => ({
      date: typeof alarm.time === 'string' ? parseDate(alarm.time) : alarm.time,
      icon: 'alarm',
      eventName: alarm.name,
      eventIcon: alarm.event_icon || 'assets/svg/icons-gray-back/alarm-icon.svg',
      eventId: alarm.event_id,
      thumbnail: alarm.thumbnail,
      speed: 0,
      temperature: 0
    }));

    this._alarmIcons = alarmIcons;

    this._calculateAlarmHighlightRanges();
  }

  private readonly _alarmIconPositions: { x: number; name: string; type: string; time: string; event_icon: string; event_id: number | null; thumbnail: string | null }[] = [];

  private async _calculateAlarmHighlightRanges() {
    const data = await firstValueFrom(this._data$);
    const zoom = await firstValueFrom(this.zoom$);

    if (!data || !this._alarmTimeline || this._alarmTimeline.length === 0) {
      this._alarmHighlightRanges$.next([]);
      return;
    }

    this._zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const groupedAlarms = this._clusterAlarms(this._alarmTimeline);

        const ranges = groupedAlarms.map(item => {
          const startDate = typeof item.start_time === 'string' ? parseDate(item.start_time) : item.start_time;
          const endDate = typeof item.end_time === 'string' ? parseDate(item.end_time) : item.end_time;
          const x1 = calculateAbsoluteXFromDate(startDate, data.minDate, zoom, this.padding);
          const x2 = calculateAbsoluteXFromDate(endDate, data.minDate, zoom, this.padding);

          return {
            x1,
            x2,
            centerX: (x1 + x2) / 2,
            width: x2 - x1,
            name: item.name ?? 'Alarm',
            type: item.type ?? 'ALARM',
            count: item.count ?? undefined,
            time: item.time,
            event_icon: item.event_icon,
            event_id: item.event_id,
            thumbnail: item.thumbnail,
            alarms: item.alarms
          } as AlarmRange;
        });

        this._zone.run(() => {
          this._alarmHighlightRanges$.next(ranges);
        });
      });
    });
  }

  private _clusterAlarms(alarms: any[] | null | undefined): any[] {
    if (!alarms || alarms.length === 0) return [];

    const sortedAlarms = [...alarms].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    const maxTimeGapMs = 300000;
    const minGroupSize = 2;

    const result: any[] = [];
    let currentGroup: any[] = [];
    let currentGroupEndTime = 0;

    for (const alarm of sortedAlarms) {
      const alarmStartTime = new Date(alarm.start_time).getTime();
      const alarmEndTime = new Date(alarm.end_time).getTime();
      const shouldAddToCurrentGroup = currentGroup.length === 0 || alarmStartTime - currentGroupEndTime <= maxTimeGapMs;

      if (shouldAddToCurrentGroup) {
        currentGroup.push(alarm);
        if (alarmEndTime > currentGroupEndTime) {
          currentGroupEndTime = alarmEndTime;
        }
      } else {
        this._processGroupAndAddToResult(currentGroup, minGroupSize, result);
        currentGroup = [alarm];
        currentGroupEndTime = alarmEndTime;
      }
    }

    this._processGroupAndAddToResult(currentGroup, minGroupSize, result);

    return result;
  }

  private _processGroupAndAddToResult(group: any[], minGroupSize: number, result: any[]): void {
    if (group.length === 0) return;

    if (group.length >= minGroupSize) {
      result.push(this._createGroupFromAlarms(group));
    } else {
      result.push(...group);
    }
  }

  private _createGroupFromAlarms(alarms: any[]): any {
    const sortedAlarms = [...alarms].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const firstAlarm = sortedAlarms[0];
    const earliestStartTime = new Date(firstAlarm.start_time);
    const latestEndTime = sortedAlarms.reduce((latest, alarm) => {
      const alarmEndTime = new Date(alarm.end_time);
      return alarmEndTime > latest ? alarmEndTime : latest;
    }, new Date(firstAlarm.end_time));

    let representativeIcon = firstAlarm.event_icon;
    const ioAlarm = sortedAlarms.find(alarm => alarm.name.includes('IO'));
    if (ioAlarm) {
      representativeIcon = ioAlarm.event_icon;
    }

    let groupName = '';
    if (sortedAlarms.length <= 3) {
      groupName = sortedAlarms.map(a => a.name).join(', ');
    } else {
      const alarmTypes = new Set(sortedAlarms.map(a => a.type));
      if (alarmTypes.size === 1) {
        groupName = `${sortedAlarms.length} types of ${[...alarmTypes][0]}`;
      } else {
        groupName = `${sortedAlarms.length}`;
      }
    }

    return {
      alarms: sortedAlarms,
      count: sortedAlarms.length,
      name: groupName,
      type: 'ALARM_GROUP',
      start_time: earliestStartTime,
      end_time: latestEndTime,
      event_icon: representativeIcon,
      time: firstAlarm.time
    };
  }

  trackByAlarmRange(index: number, range: any): string {
    return `${range.name}-${range.x1}-${range.x2}-${range.count ?? 1}`;
  }

  @ViewChildren('alarmMenuTrigger') alarmMenuTriggers!: QueryList<CdkMenuTrigger>;

  private currentOpenedAlarmId: number | null = null;
  private isTogglingAlarmMenu = false;

  toggleAlarmGroup(range: AlarmRange, event: MouseEvent, index: number): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.isTogglingAlarmMenu) {
      return;
    }

    this.isTogglingAlarmMenu = true;

    if (this.currentOpenedGroupId !== null) {
      this.closeAllGroups();
      this.currentOpenedGroupId = null;
      this.menuTriggers.forEach(trigger => trigger.close());
    }

    const alarmRanges = this._alarmHighlightRanges$.getValue();

    if (!alarmRanges || index >= alarmRanges.length) {
      this.isTogglingAlarmMenu = false;
      return;
    }

    if (this.currentOpenedAlarmId === index) {
      this.currentOpenedAlarmId = null;
      range.isExpanded = false;
      this.isMenuOpen = false;

      const trigger = this.alarmMenuTriggers.toArray()[index];
      if (trigger) {
        trigger.close();
      }

      this.isTogglingAlarmMenu = false;
      return;
    }

    if (this.currentOpenedAlarmId !== null && this.currentOpenedAlarmId < alarmRanges.length) {
      const currentAlarm = alarmRanges[this.currentOpenedAlarmId];
      if (currentAlarm) {
        currentAlarm.isExpanded = false;
      }

      const currentTrigger = this.alarmMenuTriggers.toArray()[this.currentOpenedAlarmId];
      if (currentTrigger) {
        currentTrigger.close();
      }
    }

    if (this.currentOpenedGroupId !== null) {
      this.closeAllGroups();
    }

    range.isExpanded = true;
    this.currentOpenedAlarmId = index;
    this.isMenuOpen = true;

    this._alarmHighlightRanges$.next(alarmRanges);

    setTimeout(() => {
      const trigger = this.alarmMenuTriggers.toArray()[index];
      if (trigger) {
        trigger.open();
      }
      this.isTogglingAlarmMenu = false;
    }, 50);
  }

  toggleAlarmGroupByKeyboard(range: AlarmRange, index: number): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.toggleAlarmGroup(range, syntheticMouseEvent, index);
  }

  showAllAlarms(event: MouseEvent): void {
    event.stopPropagation();

    this.alarmMenuTriggers.forEach(trigger => trigger.close());

    const alarmRanges = this._alarmHighlightRanges$.getValue();
    alarmRanges.forEach(alarm => {
      alarm.isExpanded = false;
    });
    this._alarmHighlightRanges$.next(alarmRanges);

    this.isMenuOpen = false;

    this.showFullList = true;
  }

  formatAlarmTimeRange(startTime: string | Date | undefined, endTime: string | Date | undefined): string {
    if (!startTime || !endTime) return 'N/A';

    try {
      const startDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
      const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime;

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Invalid date range';
      }

      const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      const diffMs = endDate.getTime() - startDate.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      let duration = '';
      if (hours > 0) duration += `${hours}h`;
      if (minutes > 0 || hours === 0) duration += `${minutes}m`;

      return `${formatTime(startDate)}-${formatTime(endDate)} (${duration})`;
    } catch (e) {
      console.error('Error formatting time range:', e);
      return 'Error';
    }
  }

  openEventVideo(eventData: any): void {
    const eventId = eventData?.eventId ?? eventData?.event_id;

    if (!eventId) {
      return;
    }

    this.dialog.open(TimelineEventVideoComponent, {
      data: eventId,
      width: '90vw',
      height: '95vh'
    });
  }
}
