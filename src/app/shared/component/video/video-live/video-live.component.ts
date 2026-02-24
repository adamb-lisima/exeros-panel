import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, ElementRef, QueryList, ViewChildren, AfterViewInit, OnDestroy, OnInit, ChangeDetectorRef, OnChanges } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, take, takeUntil } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { ProviderType } from '../../../../screen/settings/settings.model';
import { SmaxVideoH265Component } from '../../smax-video/video-h265/smax-video-h265.component';
import { VideoSource } from '../../smax-video/smax-video.model';
import { Camera } from '../../../../service/http/live-feeds/live-feeds.model';
import { StreamActions } from '../../../../screen/stream/stream.actions';
import { ConfirmationDialogComponent } from '../../dialog/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData, ConfirmationDialogReturn } from '../../dialog/confirmation-dialog/confirmation-dialog.model';
import SmaxVideoUtils from '../../smax-video/smax-video.utils';
import { AlertActions } from '../../../../store/alert/alert.actions';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-video-live',
  templateUrl: './video-live.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoLiveComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  private readonly destroy$ = new Subject<void>();

  @ViewChild('ftCloudElement') ftCloudElement?: ElementRef<HTMLElement>;
  @ViewChildren(SmaxVideoH265Component) smaxComponents!: QueryList<SmaxVideoH265Component>;

  @Input() availableCameras: Camera[] = [];
  @Input() liveFeedStatus: string = '';
  @Input() maxSelection: number = 4;

  @Input() set cameras(value: VideoSource[]) {
    this._cameras = value;
    this.updateConfig();
  }
  get cameras(): VideoSource[] {
    return this._cameras;
  }
  private _cameras: VideoSource[] = [];

  @Input() provider: string = ProviderType.STREAMAX;
  @Input() showControls = false;
  @Input() mainStream!: string;
  @Input() subStream!: string;

  @Output() cameraSelectionChange = new EventEmitter<VideoSource[]>();
  @Output() stateChange = new EventEmitter<any>();
  @Output() loadError = new EventEmitter<{ channel: number; error: any }>();
  @Output() loadStart = new EventEmitter<number>();

  selectedCameras: VideoSource[] = [];
  showAllChannels = false;
  private readonly channelControls = new Map<number, FormControl>();
  selectAllControl = this.fb.control(false);
  isPlaying: boolean = true;
  maxVisibleChannels = 4;

  private currentStreamType: 'main_stream' | 'sub_stream' = 'main_stream';
  private eventListeners: (() => void)[] = [];

  ftCloudCamerasJson = '';
  ftCloudConfigJson = '';
  ftCloudHeadersJson = '';

  private readonly videoUtils = new SmaxVideoUtils();
  private timeoutDialogOpened = false;
  private countdownTimer: any = undefined;
  private timeoutCountdownFinished: boolean = false;
  private recentlyTimeOuted = false;
  private readonly countdownTime = 30000;
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);

  constructor(private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, private readonly cdr: ChangeDetectorRef, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.loadVueScript();
  }

  ngOnChanges(): void {
    if (this.isFtCloud && this.availableCameras.length > 0) {
      this.updateConfigFromAvailableCameras();
    }

    this.initializeStreams();
    this.handleSelectAllChanges();
    this.cdr.markForCheck();
  }

  private updateConfigFromAvailableCameras(): void {
    const cameraWithDetails = this.availableCameras.find(cam => cam.provider_details?.url);

    if (cameraWithDetails?.provider_details?.url) {
      this.ftCloudConfigJson = JSON.stringify({
        baseURL: cameraWithDetails.provider_details.url,
        decoderType: 1,
        bufferTime: 0.5
      });
    }

    const cameraWithHeaders = this.availableCameras.find(cam => cam.provider_details?.app_id);

    if (cameraWithHeaders?.provider_details?.app_id) {
      this.ftCloudHeadersJson = JSON.stringify({
        _appId: cameraWithHeaders.provider_details.app_id,
        _tenantId: cameraWithHeaders.provider_details.tenant_id,
        _token: cameraWithHeaders.provider_details.token
      });
    }
  }

  private initializeStreams(): void {
    if (this.isStreamax && this.availableCameras.length > 0 && this.selectedCameras.length === 0) {
      this.selectedCameras = [this.createVideoSource(this.availableCameras[0], this.currentStreamType)];
      this.cdr.markForCheck();
    }
  }

  private handleSelectAllChanges(): void {
    this.selectAllControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(checked => {
      if (checked !== null) {
        this.handleSelectAllChange(checked, this.availableCameras);
      }
    });
  }

  private createVideoSource(camera: Camera, streamType: 'main_stream' | 'sub_stream'): VideoSource {
    const videoSource = {
      provider: camera.provider,
      channel: camera.channel,
      stream: camera[streamType],
      has_playback_fixed: false,
      provider_details: camera.provider_details
    };
    return videoSource;
  }

  handleChannelClick(containsChannel: boolean, camera: Camera): void {
    this.store.dispatch(StreamActions.fetchLiveFeed());

    this.actions$.pipe(ofType(StreamActions.fetchLiveFeedSuccess), take(1), takeUntil(this.destroy$)).subscribe(() => {
      if (containsChannel) {
        this.selectedCameras = this.selectedCameras.filter(selectedCamera => selectedCamera.channel !== camera.channel);
      } else if (this.selectedCameras.length < this.maxVisibleChannels) {
        this.selectedCameras = [...this.selectedCameras, this.createVideoSource(camera, this.currentStreamType)];
      }
      this.updateChannelControls();
      this.cameraSelectionChange.emit(this.selectedCameras);
      this.cdr.markForCheck();
    });
  }

  private updateChannelControls(): void {
    this.channelControls.forEach((control, channel) => {
      const isSelected = this.selectedCameras.some(camera => camera.channel === channel);
      control.setValue(isSelected, { emitEvent: false });
    });
  }

  handleSelectAllChange(checked: boolean, cameras: Camera[]): void {
    this.store.dispatch(StreamActions.fetchLiveFeed());

    this.actions$.pipe(ofType(StreamActions.fetchLiveFeedSuccess), take(1), takeUntil(this.destroy$)).subscribe(() => {
      if (checked) {
        this.selectedCameras = cameras.map(camera => this.createVideoSource(camera, this.currentStreamType));
      } else {
        this.selectedCameras = [];
        this.isPlaying = false;
      }
      this.updateChannelControls();
      this.cameraSelectionChange.emit(this.selectedCameras);
      this.cdr.markForCheck();
    });
  }

  handleMaxChannel(isSelected: boolean, camera: Camera): boolean {
    return !(!isSelected && this.selectedCameras.length >= this.maxVisibleChannels);
  }

  handlePlayPause(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.play();
    } else {
      this.pause();
    }
    this.cdr.markForCheck();
  }

  private updateConfig(): void {
    this.ftCloudCamerasJson = JSON.stringify(
      this._cameras.map(camera => ({
        devId: camera.stream,
        channels: camera.channel.toString()
      }))
    );

    const cameraWithDetails = this._cameras.find(cam => cam.provider_details?.url);

    if (cameraWithDetails?.provider_details?.url) {
      this.ftCloudConfigJson = JSON.stringify({
        baseURL: cameraWithDetails.provider_details.url,
        decoderType: 1,
        bufferTime: 0.5
      });
    } else {
      this.ftCloudConfigJson = JSON.stringify({
        decoderType: 1,
        bufferTime: 0.5
      });
    }

    const cameraWithHeaders = this._cameras.find(cam => cam.provider_details?.app_id);

    if (cameraWithHeaders?.provider_details?.app_id) {
      this.ftCloudHeadersJson = JSON.stringify({
        _appId: cameraWithHeaders.provider_details.app_id,
        _tenantId: cameraWithHeaders.provider_details.tenant_id,
        _token: cameraWithHeaders.provider_details.token
      });
    } else {
      this.ftCloudHeadersJson = JSON.stringify({});
    }
  }

  private loadVueScript(): void {
    if (customElements.get('ft-cloud-live')) {
      return;
    }

    if (document.querySelector('script[src="assets/vue-widget.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'assets/vue-widget.js';
    script.type = 'module';
    document.head.appendChild(script);
  }

  @Input() set streamType(value: 'main_stream' | 'sub_stream') {
    if (this.currentStreamType !== value) {
      this.currentStreamType = value;
      this.handleStreamTypeChange(value);
    }
  }

  get streamType(): 'main_stream' | 'sub_stream' {
    return this.currentStreamType;
  }

  get isStreamax(): boolean {
    if (this.availableCameras.length > 0) {
      return this.availableCameras[0].provider === ProviderType.STREAMAX;
    }
    return false;
  }

  get isFtCloud(): boolean {
    if (this.availableCameras.length > 0) {
      return this.availableCameras[0].provider === ProviderType.FT_CLOUD;
    }
    return false;
  }

  get ftCloudStreamType(): string {
    return this.currentStreamType === 'main_stream' ? 'MAJOR' : 'MINOR';
  }

  ngAfterViewInit(): void {
    if (this.isFtCloud && this.ftCloudElement) {
      this.setupFtCloudListeners();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeEventListeners();
    this.stopCountdown();
  }

  private setupFtCloudListeners(): void {
    if (!this.ftCloudElement?.nativeElement) return;

    const element = this.ftCloudElement.nativeElement as any;

    const onStateChange = (event: CustomEvent) => {
      this.stateChange.emit(event.detail);
    };

    const onError = (event: CustomEvent) => {
      this.loadError.emit({
        channel: this.cameras[0]?.channel || 1,
        error: event.detail
      });
    };

    const onPlayStart = (event: CustomEvent) => {
      this.loadStart.emit(this.cameras[0]?.channel || 1);
    };

    element.addEventListener('state-change', onStateChange);
    element.addEventListener('error', onError);
    element.addEventListener('play-start', onPlayStart);

    this.eventListeners.push(
      () => element.removeEventListener('state-change', onStateChange),
      () => element.removeEventListener('error', onError),
      () => element.removeEventListener('play-start', onPlayStart)
    );
  }

  private removeEventListeners(): void {
    this.eventListeners.forEach(cleanup => cleanup());
    this.eventListeners = [];
  }

  play(): void {
    if (this.provider === ProviderType.FT_CLOUD && this.ftCloudElement) {
      const element = this.ftCloudElement.nativeElement as any;
      element.play?.();
    } else {
      this.smaxComponents?.forEach(component => component.play());
    }
  }

  pause(): void {
    if (this.provider === ProviderType.FT_CLOUD && this.ftCloudElement) {
      const element = this.ftCloudElement.nativeElement as any;
      element.stop?.();
    } else {
      this.smaxComponents?.forEach(component => component.pause());
    }
  }

  takeSnapshot(): void {
    if (this.provider === ProviderType.FT_CLOUD && this.ftCloudElement) {
      const element = this.ftCloudElement.nativeElement as any;
      element.takeSnapshot?.();
    } else if (this.provider === ProviderType.STREAMAX) {
      this.smaxComponents?.forEach(component => component.takeSnapshot());
    }
  }

  private handleStreamTypeChange(streamType: 'main_stream' | 'sub_stream'): void {
    if (this.provider === ProviderType.FT_CLOUD && this.ftCloudElement) {
      const ftStreamType = streamType === 'main_stream' ? 'MAIN_STREAM' : 'SUB_STREAM';
      const element = this.ftCloudElement.nativeElement as any;
      element.changeStreamType?.(ftStreamType);
    }
  }

  handleSmaxStateChange(index: number, state: any): void {
    this.stateChange.emit({ index, state });

    if (this.timeoutDialogOpened) return;

    this.videoUtils.update({ [index]: state });
    this.handleVideoTimeout();
    this.videoUtils.stuckCheck(index, () =>
      this.store.dispatch(
        AlertActions.display({
          alert: { type: 'error', message: 'Something went wrong with at least one of cameras. Try to run it again.' }
        })
      )
    );
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
            const currentCameras = [...this.selectedCameras];
            this.selectedCameras = [];
            this.cdr.detectChanges();
            setTimeout(() => {
              this.selectedCameras = currentCameras;
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

  private stopVideo(): void {
    this.smaxComponents?.forEach(component => component.pause());
    this.selectedCameras = [];
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

  protected readonly JSON = JSON;
}
