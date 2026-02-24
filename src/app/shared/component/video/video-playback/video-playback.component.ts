import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, ElementRef, QueryList, ViewChildren, AfterViewInit, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { first, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../../const/date';
import { ProviderType } from '../../../../screen/settings/settings.model';
import { StreamActions } from '../../../../screen/stream/stream.actions';
import { PlaybackParams } from '../../../../screen/stream/stream.model';
import { SmaxVideoH265Component } from '../../smax-video/video-h265/smax-video-h265.component';
import { VideoSource } from '../../smax-video/smax-video.model';
import { StreamSelectors } from '../../../../screen/stream/stream.selectors';
import { ConfirmationDialogComponent } from '../../dialog/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData, ConfirmationDialogReturn } from '../../dialog/confirmation-dialog/confirmation-dialog.model';
import SmaxVideoUtils from '../../smax-video/smax-video.utils';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-video-playback',
  templateUrl: './video-playback.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlaybackComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('ftCloudPlaybackElement') ftCloudPlaybackElement?: ElementRef<HTMLElement>;
  @ViewChildren(SmaxVideoH265Component) smaxComponents!: QueryList<SmaxVideoH265Component>;

  @Input() cameras: VideoSource[] = [];
  @Input() provider: string = ProviderType.STREAMAX;
  @Input() showControls = false;
  @Input() beginTime = '';
  @Input() endTime = '';
  @Input() timelineStartTime = '';
  @Input() timelineEndTime = '';
  @Input() playType = 'device';
  @Input() storeType = 'MAIN_STORAGE';

  @Output() stateChange = new EventEmitter<any>();
  @Output() loadError = new EventEmitter<{ channel: number; error: any }>();
  @Output() loadStart = new EventEmitter<number>();
  @Output() timeChange = new EventEmitter<any>();

  private currentStreamType: 'main_stream' | 'sub_stream' = 'main_stream';
  private eventListeners: (() => void)[] = [];
  private readonly destroy$ = new Subject<void>();

  private readonly videoUtils = new SmaxVideoUtils();
  private timeoutDialogOpened = false;
  private countdownTimer: any = undefined;
  private timeoutCountdownFinished: boolean = false;
  private recentlyTimeOuted = false;
  private readonly countdownTime = 30000;
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);

  constructor(private readonly cdr: ChangeDetectorRef, private readonly store: Store, private readonly dialog: Dialog) {}

  @Input() set streamType(value: 'main_stream' | 'sub_stream') {
    if (this.currentStreamType !== value) {
      this.currentStreamType = value;
      this.handleStreamTypeChange(value);
    }
  }

  get streamType(): 'main_stream' | 'sub_stream' {
    return this.currentStreamType;
  }

  @Input() playbackVideoStartTime?: DateTime | null;

  playbackVideoStartTime$ = this.store.select(StreamSelectors.playbackVideoStartTime);

  ngOnInit(): void {
    this.loadVueScript();
    this.setupPlaybackControl();

    this.playbackVideoStartTime$.pipe(takeUntil(this.destroy$)).subscribe(startTime => {
      this.playbackVideoStartTime = startTime;
      this.cdr.markForCheck();
    });
  }

  private setupPlaybackControl(): void {
    this.store
      .select(StreamSelectors.isPlaybackPlaying)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isPlaying => {
        if (this.isFtCloud && this.ftCloudPlaybackElement) {
          const element = this.ftCloudPlaybackElement.nativeElement as any;
          if (isPlaying) {
            element.play?.();
          } else {
            element.pause?.();
          }
        } else if (this.isStreamax && this.smaxComponents) {
          this.smaxComponents.forEach(component => {
            if (isPlaying) {
              component.play();
            } else {
              component.pause();
            }
          });
        }
      });
  }

  private loadVueScript(): void {
    if (customElements.get('ft-cloud-playback')) {
      this.cdr.detectChanges();
      return;
    }

    if (document.querySelector('script[src="assets/vue-widget.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'assets/vue-widget.js';
    script.type = 'module';
    script.onload = () => {
      this.cdr.detectChanges();
    };
    script.onerror = error => {
      console.error('[VIDEO-PLAYBACK] Script load error:', error);
    };
    document.head.appendChild(script);
  }

  get isStreamax(): boolean {
    return this.provider === ProviderType.STREAMAX;
  }

  get isFtCloud(): boolean {
    return this.provider === ProviderType.FT_CLOUD;
  }

  get ftCloudCamerasJson(): string {
    const result = JSON.stringify(
      this.cameras.map(camera => ({
        stream: camera.stream,
        channel: camera.channel,
        provider: camera.provider
      }))
    );
    return result;
  }

  get ftCloudConfigJson(): string {
    const camera = this.cameras[0];
    if (camera?.provider_details?.url) {
      return JSON.stringify({
        baseURL: camera.provider_details.url,
        decoderType: 1,
        bufferTime: 0.5
      });
    }
    return JSON.stringify({
      baseURL: 'https://api-prod.exeros.cloud',
      decoderType: 1,
      bufferTime: 0.5
    });
  }

  get ftCloudHeadersJson(): string {
    const camera = this.cameras[0];
    if (camera?.provider_details?.app_id) {
      return JSON.stringify({
        _appId: camera.provider_details.app_id,
        _tenantId: camera.provider_details.tenant_id,
        _token: camera.provider_details.token
      });
    }
    return JSON.stringify({
      _appId: 10201,
      _tenantId: 1
    });
  }

  get ftCloudStreamType(): string {
    const streamType = this.playbackParams?.st === '1' ? 'main_stream' : 'sub_stream';
    return streamType === 'main_stream' ? 'MAJOR' : 'MINOR';
  }

  ngAfterViewInit(): void {
    if (this.isFtCloud && this.ftCloudPlaybackElement) {
      setTimeout(() => this.setupFtCloudListeners(), 1000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeEventListeners();
    this.stopCountdown();
  }

  private handleStreamTypeChange(streamType: 'main_stream' | 'sub_stream'): void {
    if (this.provider === ProviderType.FT_CLOUD && this.ftCloudPlaybackElement) {
      const ftStreamType = streamType === 'main_stream' ? 'MAJOR' : 'MINOR';
      const element = this.ftCloudPlaybackElement.nativeElement as any;
      element.changeStreamType?.(ftStreamType);
      this.cdr.detectChanges();
    }
  }

  private setupFtCloudListeners(): void {
    if (!this.ftCloudPlaybackElement?.nativeElement) {
      return;
    }

    const element = this.ftCloudPlaybackElement.nativeElement as any;

    const onTimeChange = (event: CustomEvent) => {
      let timeData;

      if (Array.isArray(event.detail)) {
        timeData = event.detail[0];
      } else {
        timeData = event.detail;
      }

      if (timeData?.setZone) {
        const londonString = timeData.setZone('Europe/London').toISO();
        this.timeChange.emit({ utc: londonString });
      }
    };

    const onStateChange = (event: CustomEvent) => {
      this.stateChange.emit(event.detail);
    };

    const onError = (event: CustomEvent) => {
      this.loadError.emit({
        channel: this.cameras[0]?.channel || 1,
        error: event.detail
      });
    };

    element.addEventListener('time-change', onTimeChange);
    element.addEventListener('state-change', onStateChange);
    element.addEventListener('error', onError);

    this.eventListeners.push(
      () => element.removeEventListener('time-change', onTimeChange),
      () => element.removeEventListener('state-change', onStateChange),
      () => element.removeEventListener('error', onError)
    );
  }

  private removeEventListeners(): void {
    this.eventListeners.forEach(cleanup => cleanup());
    this.eventListeners = [];
  }

  handleSmaxStateChange(index: number, state: any): void {
    this.stateChange.emit({ index, state });

    if (state.absoluteTime) {
      this.timeChange.emit({ utc: state.absoluteTime.toISO() });
    }

    if (this.timeoutDialogOpened) return;

    this.videoUtils.update({ [index]: state });
    this.handleVideoTimeout();
  }

  handleSmaxLoadError(index: number, camera: VideoSource, error: any): void {
    this.loadError.emit({ channel: camera.channel, error });
  }

  handleSmaxLoadStart(camera: VideoSource): void {
    this.loadStart.emit(camera.channel);
  }

  private handleVideoTimeout(): void {
    this.loggedInUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.videoUtils.timeout(user?.video_timeout, () => {
        if (!this.recentlyTimeOuted) {
          this.showTimeoutDialog();
        }
      });
    });
  }

  private showTimeoutDialog(): void {
    this.timeoutDialogOpened = true;
    this.startCountdown();

    this.dialog
      .open<ConfirmationDialogReturn, ConfirmationDialogData>(ConfirmationDialogComponent, {
        data: { header: 'Do you wish to continue previewing video?', countdownTime: this.countdownTime / 1000 }
      })
      .closed.pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data?.confirmed) {
          if (this.timeoutCountdownFinished) {
            const currentCameras = [...this.cameras];
            this.cameras = [];
            this.cdr.detectChanges();
            setTimeout(() => {
              this.cameras = currentCameras;
              this.cdr.detectChanges();
            });
          } else {
            this.smaxComponents?.forEach(smaxComponent => smaxComponent.resetTimeout());
          }
        } else {
          this.stopVideo();
        }
        this.resetTimeout();
      });
  }

  @Input() playbackVideoCurrentTime?: DateTime | null;
  @Input() playbackParams?: PlaybackParams | null;

  private stopVideo(): void {
    if (this.isFtCloud && this.ftCloudPlaybackElement) {
      const element = this.ftCloudPlaybackElement.nativeElement as any;
      element.stop?.();
    } else if (this.isStreamax && this.smaxComponents) {
      this.smaxComponents.forEach(component => component.pause());
    }

    if (this.playbackVideoCurrentTime && this.playbackParams) {
      this.store.dispatch(StreamActions.resetPlaybackSelectedSources());

      this.store
        .select(StreamSelectors.selectedId)
        .pipe(first(), takeUntil(this.destroy$))
        .subscribe(id => {
          if (id) {
            this.store.dispatch(StreamActions.setDeviceStreamInitialized({ deviceId: id, initialized: false }));
          }
        });

      this.store.dispatch(
        StreamActions.fetchPlaybackScope({
          params: {
            start_time: this.playbackVideoCurrentTime.toFormat(DateConst.serverDateTimeFormat),
            end_time: this.playbackVideoCurrentTime.endOf('day').toFormat(DateConst.serverDateTimeFormat),
            st: this.playbackParams.st
          }
        })
      );
    }

    this.cameras = [];
    this.cdr.detectChanges();
  }

  private resetTimeout(): void {
    this.stopCountdown();
    this.timeoutCountdownFinished = false;
    this.timeoutDialogOpened = false;
  }

  private startCountdown(): void {
    if (this.countdownTimer === undefined) {
      this.countdownTimer = setTimeout(() => {
        if (this.timeoutDialogOpened) {
          this.stopVideo();
          this.timeoutCountdownFinished = true;
          this.dialog.closeAll();
        }
      }, this.countdownTime);
    }
  }

  private stopCountdown(): void {
    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = undefined;
      this.recentlyTimeOuted = true;
      setTimeout(() => {
        this.recentlyTimeOuted = false;
      }, 5000);
    }
  }
}
