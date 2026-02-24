import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import Html265Utils from 'src/app/shared/component/smax-video/video-h265/html265.utils';
import { VIDEO_H265_STATUS, VideoPlayerState, VideoSource } from 'src/app/shared/component/smax-video/smax-video.model';
import { StreamSelectors } from '../../../../screen/stream/stream.selectors';

@Component({
  selector: 'app-smax-video-h265',
  templateUrl: './smax-video-h265.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmaxVideoH265Component implements OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @Output() stateChange = new EventEmitter<VideoPlayerState>();
  @Output() loadError = new EventEmitter<{ errorCode: number; errorMessage: string }>();
  @Output() loadStart = new EventEmitter<number>();
  player?: Html265Utils;
  firstPlaying$?: Observable<boolean>;
  duration = 0;
  paused = false;
  _source!: VideoSource;
  shouldShowControls = false;
  private readonly destroy$ = new Subject<void>();

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

  @Input() set source(v: VideoSource) {
    this._source = v;
    this.player?.destroy();
    setTimeout(() => {
      this.player?.destroy();
      this.init();
    }, 500);
  }

  @Input() showControls = false;

  constructor(private readonly cdr: ChangeDetectorRef, private readonly store: Store) {}

  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.player?.destroy();
    this.player = undefined;

    this.currentZoomIndex = 0;
    this.zoomX = 0;
    this.zoomY = 0;
    this.isDragging = false;
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
    const videoContainer = document.getElementById(`video-h265-${this._source.channel}`);
    if (!videoContainer) return;

    const playerWrapper = videoContainer.querySelector('.st-player-wrapper');
    if (!playerWrapper) return;

    const canvas = playerWrapper.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    canvas.style.transform = `scale(${this.zoomScale}) translate(${this.zoomX}px, ${this.zoomY}px)`;
    canvas.style.transformOrigin = 'center center';
    this.cdr.detectChanges();
  }

  private resetZoom(): void {
    this.currentZoomIndex = 0;
    this.zoomX = 0;
    this.zoomY = 0;
    this.updateVideoTransform();
  }

  private init(): void {
    this.loadStart.emit(this._source.channel);

    this.player = new Html265Utils(this.videoElement.nativeElement, { source: this._source.stream, channel: this._source.channel, sn: this._source.sn, has_playback_fixed: this._source.has_playback_fixed }, { onStateChange: state => this.handleStateChange(state) });
    this.firstPlaying$ = this.player?.firstPlaying.asObservable();

    if (this.player) {
      this.player.onError = (errorCode: number, errorMessage: string) => {
        this.loadError.emit({ errorCode, errorMessage });
      };
    }
  }

  handleStateChange(state: VideoPlayerState) {
    this.store
      .select(StreamSelectors.playbackVideoStartTime)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(startTime => {
        if (startTime && startTime instanceof DateTime) {
          const absoluteTime = startTime.plus({ second: state.currentTime });
          const modifiedState = { ...state, absoluteTime, currentTime: state.currentTime };
          this.stateChange.emit(modifiedState);
        } else {
          this.store
            .select(StreamSelectors.playbackVideoCurrentTime)
            .pipe(take(1), takeUntil(this.destroy$))
            .subscribe(currentTime => {
              if (currentTime && currentTime instanceof DateTime) {
                const fallbackStartTime = currentTime.minus({ second: state.currentTime });
                const absoluteTime = fallbackStartTime.plus({ second: state.currentTime });
                const modifiedState = { ...state, absoluteTime, currentTime: state.currentTime };
                this.stateChange.emit(modifiedState);
              } else {
                this.stateChange.emit(state);
              }
            });
        }
      });

    this.duration = state.currentTime;
    this.paused = state.paused;
    this.shouldShowControls = [VIDEO_H265_STATUS.PLAY, VIDEO_H265_STATUS.PAUSE].includes(this.player?.playerState() ?? -1);
  }

  play(): void {
    this.player?.play();
  }

  pause(): void {
    this.player?.pause();
  }

  resetTimeout(): void {
    this.player?.resetTimeout();
  }

  takeSnapshot(): void {
    if (!this.player) return;

    const videoContainer = document.getElementById(`video-h265-${this._source.channel}`);
    if (!videoContainer) return;

    const playerWrapper = videoContainer.querySelector('.st-player-wrapper');
    if (!playerWrapper) return;

    const canvas = playerWrapper.querySelector('canvas');
    if (!canvas) return;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;

    const ctx = outputCanvas.getContext('2d');
    ctx?.drawImage(canvas, 0, 0);

    const dataUrl = outputCanvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `snapshot_camera_${this._source.channel}_${new Date().toISOString().replace(/:/g, '-')}.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
