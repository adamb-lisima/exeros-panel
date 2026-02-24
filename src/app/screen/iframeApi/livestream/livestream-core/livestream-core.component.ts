import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../../const/date';
import { Camera, LiveFeedResponse } from '../../../../service/http/live-feeds/live-feeds.model';
import { LiveFeedsService } from '../../../../service/http/live-feeds/live-feeds.service';
import { SmaxVideoH265Component } from '../../../../shared/component/smax-video/video-h265/smax-video-h265.component';
import { VideoPlayerState, VideoSource } from '../../../../shared/component/smax-video/smax-video.model';
import SmaxVideoUtils from '../../../../shared/component/smax-video/smax-video.utils';
import { IframeState } from '../../../../store/iframe/iframe.reducer';
import { IframeSelectors } from '../../../../store/iframe/iframe.selectors';
import { firstNonNullish } from '../../../../util/operators';
import { StreamActions } from '../../../stream/stream.actions';
import { StreamSelectors } from '../../../stream/stream.selectors';
import { StreamService } from '../../../stream/stream.service';

@Component({
  templateUrl: './livestream-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LivestreamCoreComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>();
  constructor(private readonly streamService: StreamService, private readonly store: Store, private readonly cdr: ChangeDetectorRef, private readonly liveFeedsService: LiveFeedsService) {}

  streamMode!: number | undefined;
  selectedStream!: string | undefined;
  vehicleId!: number | undefined;
  channels!: number[] | undefined;
  videoSources: VideoSource[] = [];
  vehicleStatus: string = '';
  isVehicleOffline: boolean = false;
  vehicleRegistrationPlate: string = '';

  private readonly videoUtils = new SmaxVideoUtils();

  private readonly loadingChannels: Set<number> = new Set();
  private stuckDetectionTimer: any;
  @ViewChildren(SmaxVideoH265Component) videoH265Components!: QueryList<SmaxVideoH265Component>;

  handleLoadStart(channel: number): void {
    this.loadingChannels.add(channel);

    const startTime = new Date().getTime();

    this.loadingChannelsStartTimes.set(channel, startTime);
  }

  private readonly loadingChannelsStartTimes = new Map<number, number>();

  handleLoadError(channel: number, error: { errorCode: number; errorMessage: string }): void {
    this.loadingChannels.add(channel);

    const startTime = this.loadingChannelsStartTimes.get(channel) ?? 0;
    const endTime = new Date().getTime();
    const loadTime = endTime - startTime;

    this.logPlaybackRequest(channel, error.errorCode, loadTime);
  }

  private logPlaybackRequest(channel: number, status: number, time: number): void {
    if (this.vehicleId) {
      this.streamService
        .logPlaybackRequest({
          vehicle_id: this.vehicleId,
          channels: channel.toString(),
          status: status,
          time: time,
          type: 'Iframe-live'
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: err => console.error('Failed to log playback request', err)
        });
    }
  }

  ngOnInit(): void {
    this.store
      .select(IframeSelectors.iframeState)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: IframeState) => {
        this.streamMode = state.stream_mode;
        this.selectedStream = this.streamMode === 0 ? 'main_stream' : 'sub_stream';
        this.vehicleId = state.vehicle_id;
        this.channels = state.channels;

        if (this.vehicleId) {
          this.fetchLiveFeedAndBuildVideoSources(this.vehicleId);
        }
      });
  }
  @ViewChildren(SmaxVideoH265Component) videoPlayers!: QueryList<SmaxVideoH265Component>;

  ngAfterViewInit(): void {
    this.videoPlayers.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.videoPlayers && this.videoPlayers.length > 0) {
        this.videoPlayers.toArray().forEach(videoPlayer => {
          videoPlayer.play();
        });
      }
    });
  }

  private fetchLiveFeedAndBuildVideoSources(vehicleId: number): void {
    this.liveFeedsService
      .fetchLiveFeed(vehicleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: LiveFeedResponse) => {
        const liveFeed = response.data;
        if (liveFeed) {
          this.vehicleStatus = liveFeed.status || '';
          this.isVehicleOffline = this.vehicleStatus.toLowerCase() === 'inactive';
          this.vehicleRegistrationPlate = liveFeed.registration_plate || '';

          this.videoSources = liveFeed.cameras
            .filter((camera: Camera) => this.channels?.includes(camera.channel))
            .map((camera: Camera) => ({
              provider: camera.provider,
              channel: camera.channel,
              stream: this.streamMode === 0 ? camera.main_stream : camera.sub_stream,
              has_playback_fixed: false,
              provider_details: camera.provider_details
            }));

          this.cdr.detectChanges();
        }
      });
  }

  handleStateChange(index: number, state: VideoPlayerState, playbackVideoSources: VideoSource[]) {
    this.videoUtils.update({ [index]: state });

    if (playbackVideoSources?.[index]) {
      const channel = playbackVideoSources[index].channel;

      if (this.loadingChannels.has(channel) && state.currentTime > 0) {
        this.loadingChannels.delete(channel);

        const startTime = this.loadingChannelsStartTimes.get(channel) ?? 0;
        const endTime = new Date().getTime();
        const loadTime = endTime - startTime;

        this.logPlaybackRequest(channel, 200, loadTime);
      }
    }

    this.videoUtils.emitOffset(offset => {
      this.store
        .select(StreamSelectors.playbackScopeParams)
        .pipe(
          firstNonNullish(),
          tap(params =>
            this.store.dispatch(
              StreamActions.setPlaybackVideoCurrentTime({
                playbackVideoCurrentTime: DateTime.fromFormat(params.start_time, DateConst.serverDateTimeFormat).plus({ second: offset })
              })
            )
          ),
          takeUntil(this.destroy$)
        )
        .subscribe();
    });
  }

  ngOnDestroy(): void {
    if (this.stuckDetectionTimer) {
      clearInterval(this.stuckDetectionTimer);
      this.stuckDetectionTimer = null;
    }

    this.destroy$.next();
    this.destroy$.complete();

    this.store.dispatch(StreamActions.resetInitializedStreams());
  }
}
