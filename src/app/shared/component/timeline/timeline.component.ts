import { animate, style, transition, trigger } from '@angular/animations';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TimelineClip, TimelineData, TimelineTab } from 'src/app/shared/component/timeline/timeline.model';
import { StreamActions } from '../../../screen/stream/stream.actions';
import { StreamSelectors } from '../../../screen/stream/stream.selectors';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [trigger('tooltipAnimation', [transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]), transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))])])]
})
export class TimelineComponent implements OnDestroy, OnChanges, AfterViewInit {
  @Output() OnPositionChange = new EventEmitter<Date | undefined>();
  @Output() OnMarkerChange = new EventEmitter<Date | undefined>();
  @Output() downloadClipClick = new EventEmitter<TimelineClip>();
  @Output() shareClipClick = new EventEmitter<TimelineClip>();
  @Output() clipToEvent = new EventEmitter<TimelineClip>();

  @Input() data?: TimelineData;
  @Input() position?: Date | null;
  @Input() marker?: Date;
  @Input() selectedTab?: TimelineTab | null = 'timeline';
  @Input() playbackDownloadActive?: boolean | null = false;
  @Input() playbackShareActive?: boolean | null = false;
  @Input() clipToEventActive?: boolean | null = false;

  @ViewChild('timelineTabMenuItem') timelineTabMenuItem!: ElementRef;
  @Input() isPlaying: boolean = false;
  playbackTimeline$ = this.store.select(StreamSelectors.playbackTimeline);

  private positionUpdateTimer: any = null;
  private readonly TIME_INCREMENT_MS = 100;
  private readonly SPEED_MULTIPLIER = 10;

  private readonly destroy$ = new Subject<void>();

  private menuOpenedSubscription?: Subscription;
  private menuClosedSubscription?: Subscription;

  @ViewChild(CdkMenuTrigger) menuTrigger!: CdkMenuTrigger;

  showTooltip = true;

  constructor(private readonly store: Store) {}

  handleSelectedTabChange(selectedTab: TimelineTab) {
    this.selectedTab = selectedTab;
  }

  handlePositionChange(position: Date | undefined) {
    this.position = position;

    if (this.playbackDownloadActive && position) {
      this.handleDownloadClipClick();
      this.playbackDownloadActive = false;
    } else if (this.playbackShareActive && position) {
      this.handleShareClipClick();
      this.playbackShareActive = false;
    } else if (this.clipToEventActive && position) {
      this.handleClipToEventClick();
      this.clipToEventActive = false;
    } else {
      this.emitPositionChangeAndPlay(position);
    }
  }

  handleMarkerChange(marker: Date | undefined) {
    this.marker = marker;
    this.OnMarkerChange.next(marker);
  }

  handleDownloadClipClick() {
    if (this.position) {
      this.timelineTabMenuItem.nativeElement.click();

      this.downloadClipClick.emit({
        startTime: this.position,
        endTime: this.position
      });
    }
  }

  handleShareClipClick() {
    if (this.position) {
      this.timelineTabMenuItem.nativeElement.click();

      this.shareClipClick.emit({
        startTime: this.position,
        endTime: this.position
      });
    }
  }

  handleClipToEventClick() {
    if (this.position) {
      this.timelineTabMenuItem.nativeElement.click();

      this.clipToEvent.emit({
        startTime: this.position,
        endTime: this.position
      });
    }
  }

  downloadClick() {
    if (this.playbackDownloadActive || this.playbackShareActive || this.clipToEventActive) {
      this.resetClipSelectionStates();
    }
  }

  private clearPositionUpdateTimer(): void {
    if (this.positionUpdateTimer !== null) {
      clearInterval(this.positionUpdateTimer);
      this.positionUpdateTimer = null;
    }
  }

  private startPositionUpdateTimer(): void {
    this.clearPositionUpdateTimer();
    this.positionUpdateTimer = setInterval(() => {
      if (this.position) {
        const timeIncrement = this.TIME_INCREMENT_MS * this.SPEED_MULTIPLIER;
        const newPosition = new Date(this.position.getTime() + timeIncrement);
        this.position = newPosition;
        this.OnPositionChange.next(newPosition);
        if (newPosition) {
          this.store.dispatch(
            StreamActions.checkAndSelectTripForPosition({
              position: DateTime.fromJSDate(newPosition)
            })
          );
        }
      }
    }, this.TIME_INCREMENT_MS);
  }

  async togglePlayPause(state: boolean) {
    if (state != this.isPlaying) {
      const newPlayState = !this.isPlaying;
      const playbackTimeline = await firstValueFrom(this.playbackTimeline$);
      if (playbackTimeline?.has_video) {
        this.store.dispatch(StreamActions.setPlaybackPlaying({ isPlaying: newPlayState }));
      } else if (playbackTimeline?.has_telematics) {
        if (newPlayState) {
          this.startPositionUpdateTimer();
        } else {
          this.clearPositionUpdateTimer();
        }
      }

      this.isPlaying = newPlayState;
    }
  }

  skipForward(): void {
    if (this.position) {
      const position = new Date(this.position.getTime() + 15 * 1000);
      this.position = position;
      this.emitPositionChangeAndPlay(position);
    }
  }

  skipBackward(): void {
    if (this.position) {
      const position = new Date(this.position.getTime() - 15 * 1000);
      this.position = position;
      this.emitPositionChangeAndPlay(position);
    }
  }

  private emitPositionChangeAndPlay(position: Date | undefined): void {
    this.togglePlayPause(true);
    this.OnPositionChange.next(position);

    if (position) {
      this.store.dispatch(
        StreamActions.checkAndSelectTripForPosition({
          position: DateTime.fromJSDate(position)
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.clearPositionUpdateTimer();

    if (this.menuOpenedSubscription) {
      this.menuOpenedSubscription.unsubscribe();
    }
    if (this.menuClosedSubscription) {
      this.menuClosedSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateSelectedTab();
    }
  }

  private updateSelectedTab(): void {
    const hasTimelineData = !!this.data?.eventTimeline?.events?.length;
    const hasSpeedData = !!this.data?.speedTimeline?.length;
    const hasFuelData = !!this.data?.fuelTimeline?.length;
    const hasHybridData = !!this.data?.hybridTimeline?.length;
    const hasDriverData = !!this.data?.driverTimeline?.events?.length;

    if (!hasTimelineData && !hasSpeedData && !hasFuelData && !hasDriverData && !hasHybridData) {
      this.selectedTab = null;
    } else if (!this.selectedTab) {
      if (hasTimelineData) {
        this.selectedTab = 'timeline';
      } else if (hasSpeedData) {
        this.selectedTab = 'speed graph';
      } else if (hasFuelData || hasHybridData) {
        this.selectedTab = 'fuel graph';
      } else if (hasDriverData) {
        this.selectedTab = 'driver';
      }
    }
  }

  activateClipSelection() {
    this.resetClipSelectionStates();
    this.playbackDownloadActive = true;
    this.marker = undefined;
    this.OnMarkerChange.next(this.marker);
  }

  activateShareSelection() {
    this.resetClipSelectionStates();
    this.playbackShareActive = true;
    this.marker = undefined;
    this.OnMarkerChange.next(this.marker);
  }

  activateClipToEventSelection() {
    this.resetClipSelectionStates();
    this.clipToEventActive = true;
    this.marker = undefined;
    this.OnMarkerChange.next(this.marker);
  }

  resetClipSelectionStates(): void {
    this.playbackDownloadActive = false;
    this.playbackShareActive = false;
    this.clipToEventActive = false;
    this.marker = undefined;
    this.OnMarkerChange.next(this.marker);
  }

  ngAfterViewInit() {
    if (this.menuTrigger) {
      this.menuOpenedSubscription = this.menuTrigger.opened.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.showTooltip = false;
        },
        error: (err: unknown) => console.error('Error in menu trigger opened:', err)
      });

      this.menuClosedSubscription = this.menuTrigger.closed.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.showTooltip = true;
          if (!this.position || !this.marker) {
            this.resetClipSelectionStates();
          }
        },
        error: (err: unknown) => console.error('Error in menu trigger closed:', err)
      });
    }
  }
}
