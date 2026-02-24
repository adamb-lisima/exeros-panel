import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { interval, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import Mp4Utils from 'src/app/shared/component/smax-video/video-mp4/mp4.utils';
import { VideoPlayerState, VideoSource } from 'src/app/shared/component/smax-video/smax-video.model';
import { EventsSelectors } from '../../../../screen/events/events.selectors';
import HtmlElementUtil from '../../../../util/html-element';
import { SelectControl } from '../../control/select-control/select-control.model';

interface VideoProgress {
  value: number;
  duration: number;
  canPlay: boolean;
}

const VIDEO_PROGRESS_INIT: VideoProgress = { value: 0, duration: 0, canPlay: false };
const FRAME_RATE = 30;
const RATES: SelectControl<number>[] = [
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 }
];

@Component({
  selector: 'app-smax-video-mp4',
  templateUrl: './smax-video-mp4.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmaxVideoMp4Component implements OnDestroy {
  private progressDragging = false;
  _source!: VideoSource;
  player?: Mp4Utils;
  firstPlaying$?: Observable<boolean>;
  videoProgress: VideoProgress = VIDEO_PROGRESS_INIT;
  timeInterval?: ReturnType<typeof setInterval>;
  rates = RATES;

  private timeUpdateSubscription?: Subscription;

  isZoomMode = false;
  private readonly zoomLevels = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0, 5.0];
  private currentZoomIndex = 0;
  zoomX = 0;
  zoomY = 0;
  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  get zoomScale(): number {
    return this.zoomLevels[this.currentZoomIndex];
  }

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @Output() stateChange = new EventEmitter<VideoPlayerState>();

  @Input() set source(v: VideoSource) {
    this._source = v;
    this.player?.destroy();
    this.init();
  }

  currentEvent$ = this.store.select(EventsSelectors.event);

  constructor(private readonly cdr: ChangeDetectorRef, private readonly store: Store) {}

  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timeUpdateSubscription) {
      this.timeUpdateSubscription.unsubscribe();
      this.timeUpdateSubscription = undefined;
    }

    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = undefined;
    }

    this.player?.destroy();
    this.player = undefined;
  }

  handleProgressMousedown(event: MouseEvent): void {
    this.progressDragging = true;
    this.handleProgressMousemove(event);
  }

  handleProgressMouseup(): void {
    this.progressDragging = false;
  }

  handleProgressMousemove(event: MouseEvent): void {
    if (this.progressDragging) {
      const video = this.videoElement.nativeElement;
      video.currentTime = (event.offsetX * video.duration) / (event.currentTarget as HTMLVideoElement).offsetWidth;
    }
  }

  handlePlayPauseClick() {
    const video = this.videoElement.nativeElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  handleFullscreenClick(): void {
    HtmlElementUtil.fullscreen(this.videoElement.nativeElement);
  }

  handleMoveFrameClick(frameCount: number): void {
    if (this.videoElement.nativeElement.paused) {
      const frameTime = Math.floor(frameCount * (1 / FRAME_RATE) * 1000) / 1000;
      const timeToSet = this.videoElement.nativeElement.currentTime + frameTime;
      const duration = this.videoProgress.duration;
      this.videoElement.nativeElement.currentTime = timeToSet > 0 ? (timeToSet >= duration ? duration : timeToSet) : 0;
    }
  }

  handleRateClick(rate: number): void {
    this.videoElement.nativeElement.playbackRate = rate;
  }

  handleZoomToggle(): void {
    this.isZoomMode = !this.isZoomMode;
    if (!this.isZoomMode) {
      this.resetZoom();
    }
    this.cdr.detectChanges();
  }

  handleZoomWheel(event: WheelEvent): void {
    if (!this.isZoomMode) return;

    event.preventDefault();

    if (event.deltaY > 0) {
      if (this.currentZoomIndex > 0) {
        this.currentZoomIndex--;
        this.updateVideoTransform();
      }
    } else if (this.currentZoomIndex < this.zoomLevels.length - 1) {
      this.currentZoomIndex++;
      this.updateVideoTransform();
    }
  }

  handleZoomMouseDown(event: MouseEvent): void {
    if (!this.isZoomMode || this.currentZoomIndex === 0) return;

    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    event.preventDefault();
  }

  handleZoomMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.isZoomMode) return;

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    this.zoomX += deltaX;
    this.zoomY += deltaY;

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    this.updateVideoTransform();
  }

  handleZoomMouseUp(): void {
    this.isDragging = false;
  }

  private updateVideoTransform(): void {
    const video = this.videoElement.nativeElement;
    video.style.transform = `scale(${this.zoomScale}) translate(${this.zoomX}px, ${this.zoomY}px)`;
    video.style.transformOrigin = 'center center';
    this.cdr.detectChanges();
  }

  private resetZoom(): void {
    this.currentZoomIndex = 0;
    this.zoomX = 0;
    this.zoomY = 0;
    this.updateVideoTransform();
  }

  calculateNotificationPercentage(duration: number, notificationTime: number): number {
    if (duration > 0) {
      return Math.round((notificationTime / duration) * 100);
    }
    return 0;
  }

  calculateElapsedTime(startTime?: string, eventTime?: string): number {
    // Sprawdź, czy oba parametry istnieją
    if (!startTime || !eventTime) {
      console.log('[DIAG] Brak wymaganych parametrów w calculateElapsedTime');
      return 0;
    }

    try {
      // Zabezpiecz operację parsowania dat
      const start = DateTime.fromFormat(startTime, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/London' });
      const event = DateTime.fromFormat(eventTime, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/London' });

      // Sprawdź, czy daty zostały poprawnie sparsowane
      if (!start.isValid || !event.isValid) {
        console.log('[DIAG] Nieprawidłowy format daty:', !start.isValid ? startTime : '', !event.isValid ? eventTime : '');
        return 0;
      }

      return Math.round(event.diff(start, 'seconds').seconds);
    } catch (error) {
      console.error('[DIAG] Błąd podczas przetwarzania dat:', error, 'startTime:', startTime, 'eventTime:', eventTime);
      return 0;
    }
  }

  @Output() timeUpdate = new EventEmitter<number>();

  private readonly destroy$ = new Subject<void>();

  private init(): void {
    this.player = new Mp4Utils(
      this.videoElement.nativeElement,
      { source: this._source.stream },
      {
        onStateChange: state => this.stateChange.emit(state)
      }
    );
    this.firstPlaying$ = this.player?.firstPlaying.asObservable();

    this.videoElement.nativeElement.onloadedmetadata = data => {
      const video = data.currentTarget as HTMLVideoElement;
      this.videoProgress = {
        ...this.videoProgress,
        duration: video.duration,
        canPlay: true
      };

      if (this.timeUpdateSubscription) {
        this.timeUpdateSubscription.unsubscribe();
      }

      this.timeUpdateSubscription = interval(100)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (!this.videoElement?.nativeElement) return;

            const currentTime = this.videoElement.nativeElement.currentTime;
            const currentValue = Math.round((currentTime / this.videoProgress.duration) * 100);

            if (this.videoProgress.value !== currentValue) {
              this.videoProgress = {
                ...this.videoProgress,
                value: currentValue
              };
              this.timeUpdate.emit(currentTime);
              this.cdr.detectChanges();
            }
          },
          error: (err: unknown) => console.error('Error in video time update interval:', err)
        });
    };
  }
}
