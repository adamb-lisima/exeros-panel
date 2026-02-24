import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject, take } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { EventsService } from 'src/app/screen/events/events.service';
import { VideoPlayerState, VideoSource } from 'src/app/shared/component/smax-video/smax-video.model';
import { EventsActions } from '../../../../screen/events/events.actions';
import { EventsSelectors } from '../../../../screen/events/events.selectors';
import { AccessGroup } from '../../../../screen/settings/settings.model';
import SmaxVideoUtils from '../../smax-video/smax-video.utils';

@Component({
  selector: 'app-timeline-event-video',
  templateUrl: './timeline-event-video.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineEventVideoComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly eventSubject = new BehaviorSubject<any>(null);
  event$ = this.eventSubject.asObservable();
  private readonly camerasSubject = new BehaviorSubject<VideoSource[]>([]);
  cameras$ = this.camerasSubject.asObservable();
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();
  private videoUtils = new SmaxVideoUtils();

  private readonly isReadySubject = new BehaviorSubject<boolean>(false);
  isReady$ = this.isReadySubject.asObservable();

  constructor(@Inject(DIALOG_DATA) private readonly eventId: string, private readonly dialogRef: DialogRef, private readonly store: Store, private readonly eventsService: EventsService) {}

  ngOnInit(): void {
    this.videoUtils = new SmaxVideoUtils();

    if (this.eventId) {
      this.loadEventDetails(this.eventId);
    } else {
      this.errorSubject.next('No event ID provided');
    }
  }

  private loadEventDetails(eventId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.store.dispatch(EventsActions.resetEvent());

    this.eventsService
      .fetchEvent(eventId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingSubject.next(false);
        })
      )
      .subscribe({
        next: response => {
          const eventData = response.data;
          this.eventSubject.next(eventData);
          this.setupStoreData(eventData);

          if (eventData?.cameras?.length) {
            const cameras: VideoSource[] = eventData.cameras.map((camera: any) => ({
              provider: camera.provider ?? 'smax',
              stream: camera.sub_stream,
              channel: camera.channel,
              sn: camera.sn,
              has_playback_fixed: true,
              provider_details: camera.provider_details
            }));
            this.camerasSubject.next(cameras);
          } else {
            this.camerasSubject.next([]);
          }
        },
        error: err => {
          console.error('Błąd podczas ładowania szczegółów eventu:', err);
          this.errorSubject.next('Failed to load event details. Please try again later.');
          this.isReadySubject.next(false);
        }
      });
  }

  private setupStoreData(eventData: any): void {
    this.store.dispatch(EventsActions.setSelectedId({ id: eventData.id }));

    this.store.dispatch(EventsActions.fetchEventSuccess({ data: eventData }));

    setTimeout(() => {
      this.store
        .select(EventsSelectors.event)
        .pipe(take(1), takeUntil(this.destroy$))
        .subscribe(storeEvent => {
          if (!storeEvent) {
            console.warn('No event data in store, but continuing anyway');
          }
          this.isReadySubject.next(true);
        });
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  async handleStateChange(index: number, state: VideoPlayerState) {
    this.videoUtils.update({ [index]: state });
    await this.videoUtils.sync(index);
  }

  getCamera(camera: VideoSource): VideoSource {
    return camera;
  }

  protected readonly accessGroup = AccessGroup;
}
