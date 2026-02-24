import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, filter, interval, map, Subject, withLatestFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VirtualInfinityScrollComponent } from '../../../../../../shared/component/infinity-scroll/virtual-infinity-scroll.component';
import { VideoPlayerState, VideoSource } from '../../../../../../shared/component/smax-video/smax-video.model';
import SmaxVideoUtils from '../../../../../../shared/component/smax-video/smax-video.utils';
import { EventsActions } from '../../../../../events/events.actions';
import { EventsElement, EventsParamsRequest } from '../../../../../events/events.model';
import { EventsSelectors } from '../../../../../events/events.selectors';

@Component({
  selector: 'app-settings-core-fleets-vehicle-commission-verify-template',
  templateUrl: './settings-core-fleets-vehicle-commission-verify-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreFleetsVehicleCommissionVerifyTemplateComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private isComponentActive = false;
  private videoUtils!: SmaxVideoUtils;

  eventsLoading$ = this.store.select(EventsSelectors.eventsLoading);
  events$ = this.store.select(EventsSelectors.events);
  eventsMeta$ = this.store.select(EventsSelectors.eventsMeta);
  eventsParams$ = this.store.select(EventsSelectors.eventsParams);

  private cameraSources: { [key: string]: VideoSource } = {};

  event$ = this.store.select(EventsSelectors.event).pipe(
    takeUntil(this.destroy$),
    filter(() => this.isComponentActive)
  );

  private readonly activeTabSubject = new BehaviorSubject<number>(0);
  searchControl = this.fb.control('');
  selectedEvent$ = new BehaviorSubject<EventsElement | null>(null);

  cameras$ = combineLatest([this.event$, this.activeTabSubject]).pipe(
    takeUntil(this.destroy$),
    map(([event, tabIndex]) => {
      if (!event) return [];

      const cameras =
        event?.cameras
          ?.filter(camera => !!camera.sub_stream)
          .map(camera => {
            const cameraObj = {
              provider: camera.provider,
              picture: camera.picture ?? '',
              channel: camera.channel ?? 0,
              stream: camera.sub_stream ?? '',
              key: `${event.id}_${camera.channel}`,
              has_playback_fixed: false,
              provider_details: camera.provider_details
            };

            const key = cameraObj.key;
            this.cameraSources[key] = cameraObj;

            return cameraObj;
          }) ?? [];

      return cameras;
    })
  );

  @ViewChild('scrollableContainer') scrollableContainer!: VirtualInfinityScrollComponent<EventsElement>;
  @Input() vehicleId!: number;
  @Output() eventSelected = new EventEmitter<string>();
  @Input() confirmedEventId: string | null = null;
  @Output() eventConfirmed = new EventEmitter<string>();

  selectedEventId: string | null = null;
  constructor(private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, private readonly cdr: ChangeDetectorRef) {}
  private readonly camerasSubject = new BehaviorSubject<VideoSource[]>([]);

  ngOnInit(): void {
    this.isComponentActive = true;

    if (!this.vehicleId) {
      return;
    }

    this.store
      .select(EventsSelectors.event)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.isComponentActive)
      )
      .subscribe(event => {
        this.videoUtils = new SmaxVideoUtils();

        if (event?.id) {
          this.cameraSources = {};
        }
      });

    try {
      this.fetchEvents();
    } catch (error) {
      console.error('[ngOnInit] Error fetching events:', error);
    }

    this.store
      .select(EventsSelectors.event)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.isComponentActive)
      )
      .subscribe(event => {
        if (event?.cameras?.length) {
          this.camerasSubject.next([]);
        }
      });

    interval(10000)
      .pipe(
        filter(() => !document.hidden && this.isComponentActive),
        withLatestFrom(this.eventsLoading$),
        filter(([, loading]) => !loading),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.fetchEvents();
        },
        error: (error: Error) => console.error('[Background refresh] Error fetching events:', error)
      });
  }

  fetchEvents(): void {
    if (!this.isComponentActive) {
      return;
    }

    const params: Partial<EventsParamsRequest> = {
      status: 'NEW',
      include_review_optional: 'true',
      vehicle_id: this.vehicleId.toString()
    };

    this.store.dispatch(EventsActions.fetchEvents({ params }));
  }

  selectEvent(event: EventsElement): void {
    if (!this.isComponentActive) {
      return;
    }

    this.selectedEvent$.next(event);
    this.eventSelected.emit(event.id);

    this.store.dispatch(EventsActions.setSelectedId({ id: event.id }));
    this.store.dispatch(EventsActions.fetchEvent());
    this.cdr.markForCheck();
  }

  isEventSelected(eventId: string): boolean {
    return this.selectedEvent$.value?.id === eventId;
  }

  getCamera(camera: any): VideoSource {
    const key = camera.key;
    if (key && this.cameraSources[key]) {
      return this.cameraSources[key];
    }

    const source = {
      provider: camera.provider,
      channel: camera.channel,
      stream: camera.stream,
      has_playback_fixed: camera.has_playback_fixed ?? false,
      provider_details: camera.provider_details
    };

    if (key) {
      this.cameraSources[key] = source;
    }

    return source;
  }

  trackByCamera(index: number, camera: any): string {
    return camera.key ?? `${camera.channel}_${index}`;
  }

  async handleStateChange(index: number, state: VideoPlayerState) {
    if (!this.isComponentActive) {
      return;
    }

    if (!state) {
      return;
    }

    if (!this.videoUtils) {
      return;
    }

    this.videoUtils.update({ [index]: state });

    await this.videoUtils.sync(index);
  }

  isEventConfirmed(eventId: string | null | undefined): boolean {
    if (!eventId) return false;
    return eventId === this.confirmedEventId;
  }

  confirmEvent(): void {
    if (!this.isComponentActive) {
      return;
    }

    const selectedEvent = this.selectedEvent$.value;
    if (!selectedEvent?.id) {
      return;
    }

    this.eventSelected.emit(selectedEvent.id);
    this.eventConfirmed.emit(selectedEvent.id);
  }

  ngOnDestroy(): void {
    this.isComponentActive = false;

    this.destroy$.next();
    this.destroy$.complete();

    if (this.camerasSubject) {
      this.camerasSubject.complete();
    }

    if (this.activeTabSubject) {
      this.activeTabSubject.complete();
    }

    if (this.selectedEvent$) {
      this.selectedEvent$.complete();
    }
  }
}
