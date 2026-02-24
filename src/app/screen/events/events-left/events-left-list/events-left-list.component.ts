import { Dialog } from '@angular/cdk/dialog';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, debounceTime, filter, interval, skip, Subject, Subscription, take, takeUntil, tap, withLatestFrom } from 'rxjs';
import RouteConst from 'src/app/const/route';
import { EventsElement, EventsParamsRequest } from 'src/app/screen/events/events.model';
import { EventsSelectors } from 'src/app/screen/events/events.selectors';
import { AppState } from 'src/app/store/app-store.model';
import { VirtualInfinityScrollComponent } from '../../../../shared/component/infinity-scroll/virtual-infinity-scroll.component';
import { DriversLeftMessageDialogComponent } from '../../../drivers/drivers-left/drivers-left-message-dialog/drivers-left-message-dialog.component';
import { DriversElement } from '../../../drivers/drivers.model';
import { EventsMeta } from '../../../fleets/fleets.model';
import { AccessGroup } from '../../../settings/settings.model';
import { EventsActions } from '../../events.actions';
import { animate, state, style, transition, trigger } from '@angular/animations';

type EventsType = 'NEW' | 'ESCALATED' | 'REVIEWED' | 'ARCHIVED' | 'INVALID_VIDEO';

@Component({
  selector: 'app-events-left-list',
  templateUrl: './events-left-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandDetail', [
      state('collapsed', style({ height: '0', opacity: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: '1', overflow: 'hidden' })),
      transition('collapsed <=> expanded', [animate('200ms ease-in-out')])
    ])
  ]
})
export class EventsLeftListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() vehicleFilter = new EventEmitter<number>();
  @ViewChild('scrollableContainer') scrollableContainer!: VirtualInfinityScrollComponent<EventsElement>;

  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  includeReviewOptionalControl = new FormControl(false);
  selectedId$ = this.store.select(EventsSelectors.selectedId);
  eventsLoading$ = this.store.select(EventsSelectors.eventsLoading);
  events$ = this.store.select(EventsSelectors.events);
  eventsMeta$ = this.store.select(EventsSelectors.eventsMeta);
  eventsParams$ = this.store.select(EventsSelectors.eventsParams);
  eventsViewerAccess = AccessGroup.EVENTS_VIEWER;
  escalatedEventsViewerAccess = AccessGroup.ESCALATED_EVENTS_VIEWER;
  reviewedEventsViewerAccess = AccessGroup.REVIEWED_EVENTS_VIEWER;
  archivedEventsViewerAccess = AccessGroup.ARCHIVED_EVENTS_VIEWER;
  eventsType: EventsType = 'NEW';
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild('menuTriggerElement') menuTriggerElement!: ElementRef;
  public isVehicleFiltered: boolean = false;
  private currentFilteredVehicleId: number | undefined = undefined;

  highlightedEvents$ = new BehaviorSubject<string[]>([]);
  private previousEventIds = new Set<string>();
  public newEventsCount$ = new BehaviorSubject<number>(0);
  public showNewEventsInfo$ = new BehaviorSubject<boolean>(false);
  private userAtTop = true;
  isHovered = false;
  hoveredEventId: string | null = null;
  private hideTimeout: any = null;

  expandedEventIds = new Set<string>();

  allLoadedEvents: EventsElement[] = [];
  private readonly loadedPages = new Set<number>();
  private readonly ITEMS_PER_PAGE = 500;
  private readonly initialQueryParams: EventsParamsRequest | null = null;

  private readonly notificationTimer: any = null;

  constructor(private readonly store: Store<AppState>, private readonly router: Router, private readonly cdr: ChangeDetectorRef, private readonly dialog: Dialog) {
    this.sub.add(
      this.eventsParams$
        .pipe(
          filter(params => params !== null),
          tap(params => {
            this.includeReviewOptionalControl.setValue(params.include_review_optional === 'false', { emitEvent: false });
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (error: Error) => console.error('Error in eventsParams$ subscription:', error)
        })
    );

    this.sub.add(
      this.includeReviewOptionalControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
        next: value => {
          this.handleIncludeReviewOptionalChange(value);
        },
        error: (error: Error) => console.error('Error in includeReviewOptionalControl valueChanges:', error)
      })
    );

    this.sub.add(
      this.store
        .select(EventsSelectors.eventsParams)
        .pipe(
          filter(params => params !== null && params.status !== this.eventsType),
          tap(params => {
            if (params.status) {
              this.eventsType = params.status as EventsType;
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );
  }

  ngOnInit(): void {
    this.sub.add(
      interval(10000)
        .pipe(
          filter(() => !document.hidden),
          withLatestFrom(this.eventsLoading$),
          filter(([, loading]) => !loading),
          tap(() => this.store.dispatch(EventsActions.fetchEventsInBackground())),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (error: Error) => console.error('Error in interval subscription:', error)
        })
    );

    this.sub.add(
      this.events$.pipe(take(1), takeUntil(this.destroy$)).subscribe({
        next: events => {
          this.previousEventIds = new Set(events.map(event => event.id));
        },
        error: (error: Error) => console.error('Error in events$ first subscription:', error)
      })
    );

    this.sub.add(
      this.events$.pipe(skip(1), takeUntil(this.destroy$)).subscribe({
        next: events => {
          const currentEventIds = new Set(events.map(event => event.id));
          const newEventIds = this.checkForNewEvents(events);

          if (newEventIds.length > 0) {
            this.triggerHighlightEffect(newEventIds);

            const viewport = this.scrollableContainer?.listElement;
            if (viewport) {
              const scrollPosition = viewport.measureScrollOffset();
              this.userAtTop = scrollPosition < 50;

              if (!this.userAtTop) {
                const currentCount = this.newEventsCount$.value;
                this.newEventsCount$.next(currentCount + newEventIds.length);
                this.showNewEventsInfo$.next(true);

                this.autoHideNotification();
                this.cdr.detectChanges();
              }
            }
          }

          this.previousEventIds = currentEventIds;
        },
        error: (error: Error) => console.error('Error in events$ skip subscription:', error)
      })
    );

    this.setupPaginationHandling();
  }

  ngAfterViewInit(): void {
    const viewport = this.scrollableContainer?.listElement;

    if (viewport) {
      this.sub.add(
        viewport
          .elementScrolled()
          .pipe(
            debounceTime(100),
            tap(() => {
              const scrollPosition = viewport.measureScrollOffset();
              const isNearTop = scrollPosition < 50;

              const el = viewport.elementRef.nativeElement;
              const isNearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;

              if (isNearBottom) {
                this.eventsMeta$.pipe(take(1), takeUntil(this.destroy$)).subscribe(meta => {
                  if (meta && !meta.last) {
                    this.loadNextPage(meta.current_page + 1);
                  }
                });
              }

              if (this.userAtTop !== isNearTop) {
                this.userAtTop = isNearTop;
                if (this.userAtTop) {
                  this.showNewEventsInfo$.next(false);
                  this.newEventsCount$.next(0);
                }
              }
            }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            error: (error: Error) => console.error('Error in elementScrolled subscription:', error)
          })
      );
    }
  }

  private setupPaginationHandling(): void {
    this.sub.add(
      combineLatest([this.events$, this.eventsMeta$, this.eventsParams$])
        .pipe(
          filter(([events, meta, params]) => !!events && !!meta && !!params),
          tap(([events, meta, params]) => {
            if (!meta) return;

            if (this.handleEmptyEventsWithHigherPage(events, meta)) return;

            const wasEmpty = this.allLoadedEvents.length === 0;

            if (this.handleStatusChange(events, params)) return;

            this.processEvents(events, meta, wasEmpty);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({})
    );
  }

  private handleEmptyEventsWithHigherPage(events: EventsElement[], meta: EventsMeta): boolean {
    if (events.length === 0 && meta.current_page > 1) {
      this.eventsParams$.pipe(take(1), takeUntil(this.destroy$)).subscribe(currentParams => {
        if (currentParams) {
          const params: Partial<EventsParamsRequest> = {
            ...currentParams,
            page: 1
          };
          this.store.dispatch(EventsActions.fetchEvents({ params }));
        }
      });
      return true;
    }
    return false;
  }

  private handleStatusChange(events: EventsElement[], params: EventsParamsRequest): boolean {
    if (params?.status && params.status !== this.eventsType) {
      this.eventsType = params.status as EventsType;
      this.allLoadedEvents = [...events];
      this.loadedPages.clear();
      this.loadedPages.add(1);

      this.triggerChangeDetection();
      return true;
    }
    return false;
  }

  private processEvents(events: EventsElement[], meta: EventsMeta, wasEmpty: boolean): void {
    if (meta.fetch_in_background) {
      this.handleBackgroundEvents(events);
      return;
    }

    if (meta.current_page === 1) {
      this.handleFirstPage(events, wasEmpty);
      return;
    }

    if (!this.loadedPages.has(meta.current_page)) {
      this.addNewEvents(events);
      this.loadedPages.add(meta.current_page);
    }
  }

  private handleFirstPage(events: EventsElement[], wasEmpty: boolean): void {
    this.allLoadedEvents = [...events];
    this.loadedPages.clear();
    this.loadedPages.add(1);

    if ((events.length > 0 && wasEmpty) || (events.length === 0 && !wasEmpty)) {
      this.triggerChangeDetection();
    }
  }

  private triggerChangeDetection(): void {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  private updateLoadedEvents(events: EventsElement[], meta: EventsMeta): void {
    if (meta.current_page === 1) {
      this.allLoadedEvents = [...events];
      this.loadedPages.clear();
      this.loadedPages.add(1);
    } else if (!this.loadedPages.has(meta.current_page)) {
      this.addNewEvents(events);
      this.loadedPages.add(meta.current_page);
    }
  }

  private addNewEvents(newEvents: EventsElement[]): void {
    if (!newEvents || newEvents.length === 0) return;

    const existingIds = new Set(this.allLoadedEvents.map(e => e.id));
    const uniqueNewEvents = newEvents.filter(e => !existingIds.has(e.id));

    if (uniqueNewEvents.length > 0) {
      const combinedEvents = [...this.allLoadedEvents, ...uniqueNewEvents];

      combinedEvents.sort((a, b) => {
        return new Date(b.occurence_time).getTime() - new Date(a.occurence_time).getTime();
      });

      this.allLoadedEvents = combinedEvents;
    }
  }

  private handleBackgroundEvents(events: EventsElement[]): void {
    if (!events || events.length === 0) return;

    let dataChanged = false;
    const existingIds = new Set(this.allLoadedEvents.map(e => e.id));

    for (const updatedEvent of events) {
      const existingEventIndex = this.allLoadedEvents.findIndex(e => e.id === updatedEvent.id);

      if (existingEventIndex >= 0) {
        const existingEvent = this.allLoadedEvents[existingEventIndex];

        const thumbnailsChanged = JSON.stringify(existingEvent.thumbs) !== JSON.stringify(updatedEvent.thumbs);
        const statusChanged = existingEvent.driver_requested_status_change !== updatedEvent.driver_requested_status_change;

        if (thumbnailsChanged || statusChanged) {
          this.allLoadedEvents[existingEventIndex] = {
            ...this.allLoadedEvents[existingEventIndex],
            thumbs: [...updatedEvent.thumbs],
            driver_requested_status_change: updatedEvent.driver_requested_status_change
          };
          dataChanged = true;
        }
      }
    }

    const newBackgroundEvents = events.filter(e => !existingIds.has(e.id));

    if (newBackgroundEvents.length > 0) {
      const combinedEvents = [...this.allLoadedEvents, ...newBackgroundEvents];
      combinedEvents.sort((a, b) => {
        return new Date(b.occurence_time).getTime() - new Date(a.occurence_time).getTime();
      });

      this.allLoadedEvents = combinedEvents;
      dataChanged = true;
    }

    if (dataChanged) {
      this.forceRefreshView();
    }
  }

  toggleEventExpand(eventId: string, clickEvent: MouseEvent): void {
    clickEvent.stopPropagation();
    if (this.expandedEventIds.has(eventId)) {
      this.expandedEventIds.delete(eventId);
    } else {
      this.expandedEventIds.add(eventId);
    }
    this.cdr.markForCheck();
  }

  isEventExpanded(eventId: string): boolean {
    return this.expandedEventIds.has(eventId);
  }

  getEventBadgeStatus(event: EventsElement): 'online' | 'offline' | 'warning' {
    const status = event.last_status || event.status;
    switch (status) {
      case 'REVIEWED':
      case 'DO_NOT_ESCALATE':
        return 'online';
      case 'ESCALATED':
      case 'FALSE_EVENT':
        return 'warning';
      default:
        return 'offline';
    }
  }

  getEventBadgeLabel(event: EventsElement): string {
    const status = event.last_status || event.status;
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.showNewEventsInfo$.complete();
    this.newEventsCount$.complete();

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  handleEventClick(event: EventsElement) {
    this.router.navigate(['/', RouteConst.events, event.id]);
  }

  isVehicleCurrentlyFiltered(vehicleId: number | undefined): boolean {
    return this.isVehicleFiltered && this.currentFilteredVehicleId === vehicleId && vehicleId !== undefined;
  }

  handleRegistrationClick(event: EventsElement) {
    this.menuTrigger.closeMenu();
    setTimeout(() => {
      if (event.vehicle_id === undefined) {
        return;
      }

      this.allLoadedEvents = [];
      this.loadedPages.clear();

      if (this.isVehicleFiltered && this.currentFilteredVehicleId === event.vehicle_id) {
        this.isVehicleFiltered = false;
        this.currentFilteredVehicleId = undefined;
        this.vehicleFilter.emit(undefined);
      } else {
        this.isVehicleFiltered = true;
        this.currentFilteredVehicleId = event.vehicle_id;
        this.vehicleFilter.emit(event.vehicle_id);
      }
    }, 100);
  }

  private previousEmptyState = false;

  handleSwitchEventsTypeClick(type: EventsType) {
    this.previousEmptyState = this.allLoadedEvents.length === 0;
    this.allLoadedEvents = [];
    this.loadedPages.clear();
    this.eventsType = type;

    const params: Partial<EventsParamsRequest> = {
      status: type,
      include_review_optional: this.includeReviewOptionalControl.value ? 'false' : 'true',
      page: 1,
      per_page: this.ITEMS_PER_PAGE
    };

    this.store.dispatch(EventsActions.fetchEvents({ params }));
  }

  forceRefreshView(): void {
    setTimeout(() => {
      const currentEvents = [...this.allLoadedEvents];

      this.allLoadedEvents = [];
      this.cdr.detectChanges();

      this.allLoadedEvents = currentEvents;
      this.cdr.detectChanges();
    }, 0);
  }

  handleVehicleDetails(vehicleId: number | undefined): void {
    if (vehicleId) {
      this.router.navigate(['/', 'vehicles', vehicleId.toString()], {
        queryParams: { vehicle_id: vehicleId }
      });
    }
  }

  getProviderLabel(name: string): string {
    const upperName = name.toUpperCase();

    if (upperName.includes('STREAMAX')) {
      return 'video';
    }

    if (upperName.includes('FLESPI')) {
      return 'telematics';
    }

    if (upperName.includes('MANUAL')) {
      return 'manual';
    }

    if (upperName.includes('ANALYTIC')) {
      return 'analytics';
    }

    return name;
  }

  private handleIncludeReviewOptionalChange(value: boolean | null) {
    if (value !== null) {
      const params: Partial<EventsParamsRequest> = {
        status: this.eventsType,
        include_review_optional: value ? 'false' : 'true'
      };

      this.store.dispatch(EventsActions.fetchEvents({ params }));
    }
  }

  private triggerHighlightEffect(eventIds: string[]): void {
    let toggleCount = 0;
    const highlightInterval = setInterval(() => {
      toggleCount++;
      if (toggleCount <= 6) {
        const isHighlighted = toggleCount % 2 === 1;
        this.highlightedEvents$.next(isHighlighted ? eventIds : []);
      } else {
        clearInterval(highlightInterval);
        this.highlightedEvents$.next([]);
      }
    }, 500);
  }

  private checkForNewEvents(events: EventsElement[]): string[] {
    if (this.eventsType !== 'NEW') {
      return [];
    }
    const newEvents = events.filter(event => !this.previousEventIds.has(event.id));

    return newEvents
      .filter(event => {
        const eventDate = new Date(event.event_added_at);
        const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }));
        const timeDifference = now.getTime() - eventDate.getTime();

        return timeDifference <= 60000;
      })
      .map(event => event.id);
  }

  handleStream(vehicleId?: number): void {
    if (!vehicleId) {
      return;
    }
    this.router.navigate(['/', RouteConst.stream, vehicleId]);
  }

  handlePlayback(vehicleId?: number): void {
    if (!vehicleId) {
      return;
    }
    this.router.navigate(['/', RouteConst.playbacks, vehicleId]);
  }

  protected readonly accessGroup = AccessGroup;

  hasNoCoordinates(event: EventsElement): boolean {
    if (!event.coordinates) {
      return true;
    }

    return event.coordinates.latitude === undefined || event.coordinates.latitude === null || event.coordinates.longitude === undefined || event.coordinates.longitude === null || (event.coordinates.latitude === 0 && event.coordinates.longitude === 0);
  }

  fetchTelemetry(event: EventsElement): void {
    event.id && this.store.dispatch(EventsActions.fetchTelemetry({ id: event.id }));
  }

  showTelemetry(event: EventsElement) {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    this.hoveredEventId = event.id;
    this.isHovered = true;
    this.fetchTelemetry(event);
  }

  hideTelemetry() {
    this.hideTimeout = setTimeout(() => {
      this.isHovered = false;
      this.hoveredEventId = null;
      this.hideTimeout = null;
    }, 300);
  }

  keepTelemetryVisible() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  loadNextPage(nextPage: number): void {
    if (this.loadedPages.has(nextPage)) {
      return;
    }

    this.eventsParams$
      .pipe(
        take(1),
        filter(params => params !== null),
        withLatestFrom(this.eventsLoading$),
        filter(([_, loading]) => !loading),
        takeUntil(this.destroy$)
      )
      .subscribe(([currentParams, _]) => {
        if (currentParams) {
          const params: Partial<EventsParamsRequest> = {
            ...currentParams,
            page: nextPage,
            per_page: this.ITEMS_PER_PAGE,
            vehicle_id: this.isVehicleFiltered && this.currentFilteredVehicleId ? this.currentFilteredVehicleId.toString() : currentParams.vehicle_id
          };
          this.store.dispatch(EventsActions.fetchEvents({ params }));
        }
      });
  }

  handleMessageClick(event: EventsElement): void {
    let driver: DriversElement | undefined = undefined;

    if (event.driver_id) {
      driver = {
        id: event.driver_id,
        name: event.driver_name || 'Unknown',
        licence_number: ''
      };
    }

    const fleetId = localStorage.getItem('exeros-fleet-id');
    this.dialog.open(DriversLeftMessageDialogComponent, {
      data: {
        driver: driver,
        fleetId: fleetId ? parseInt(fleetId, 10) : 1,
        vehicleId: event.vehicle_id
      }
    });
  }

  private autoHideNotification(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    this.hideTimeout = setTimeout(() => {
      this.showNewEventsInfo$.next(false);
      this.cdr.detectChanges();
      this.hideTimeout = null;
    }, 5000);
  }

  public dismissNotification(): void {
    this.showNewEventsInfo$.next(false);

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    this.cdr.detectChanges();
  }

  protected readonly AccessGroup = AccessGroup;
}
