import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { first, map, Observable, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../../const/date';
import Html265Utils from '../../../../shared/component/smax-video/video-h265/html265.utils';
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
  templateUrl: './playback-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaybackCoreComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly streamService: StreamService, private readonly httpClient: HttpClient, private readonly store: Store) {}
  private stuckDetectionTimer: any;
  private readonly lastFrameTimes: { [channel: number]: number } = {};
  private readonly sub?: Subscription;
  @ViewChildren(SmaxVideoH265Component) videoH265Components!: QueryList<SmaxVideoH265Component>;
  private setupStuckDetection(): void {
    if (this.stuckDetectionTimer) {
      clearInterval(this.stuckDetectionTimer);
    }

    this.stuckDetectionTimer = setInterval(() => {
      this.videoH265Components.forEach(component => {
        if (!component.player) return;

        const videoSource = component._source;
        if (!videoSource) return;

        const channel = videoSource.channel;
        const currentTime = component.duration;

        if (this.lastFrameTimes[channel] !== undefined && !component.paused) {
          if (currentTime === this.lastFrameTimes[channel] && currentTime > 0) {
            this.hardResetChannel(channel);

            this.logPlaybackRequest(channel, -100, 0);
          }
        }

        this.lastFrameTimes[channel] = currentTime;
      });
    }, 10000);

    if (this.sub) {
      this.sub.add({
        unsubscribe: () => {
          if (this.stuckDetectionTimer) {
            clearInterval(this.stuckDetectionTimer);
            this.stuckDetectionTimer = null;
          }
        }
      });
    }
  }

  private hardResetChannel(channel: number): void {
    this.store
      .select(StreamSelectors.playbackSelectedSources)
      .pipe(
        first(),
        tap(sources => {
          const sourceToReset = sources.find(s => s.channel === channel);
          if (!sourceToReset) return;

          const filteredSources = sources.filter(s => s.channel !== channel);
          this.store.dispatch(
            StreamActions.setPlaybackSelectedSources({
              playbackSelectedSources: filteredSources
            })
          );

          setTimeout(() => {
            this.store
              .select(StreamSelectors.playbackSelectedSources)
              .pipe(
                first(),
                tap(updatedSources => {
                  if (!updatedSources.some(s => s.channel === channel)) {
                    this.store.dispatch(
                      StreamActions.setPlaybackSelectedSources({
                        playbackSelectedSources: [
                          ...updatedSources,
                          {
                            ...sourceToReset,
                            sn: DateTime.now().setZone('Europe/London').valueOf()
                          }
                        ]
                      })
                    );
                  }
                }),
                takeUntil(this.destroy$)
              )
              .subscribe();
          }, 2000);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  playbackVideoSources$: Observable<VideoSource[]> | undefined;
  selectedStream: 'main_stream' | 'sub_stream' = 'sub_stream';
  vehicleId!: number | undefined;
  channels!: number[] | undefined;
  startTime: string | undefined;
  endTime: string | undefined;
  isVehicleOffline: boolean = false;
  vehicleStatus: string = '';
  vehicleRegistrationPlate: string = '';

  private videoUtils = new SmaxVideoUtils();

  private readonly loadingChannels: Set<number> = new Set();
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
          type: 'Iframe-playback'
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: err => console.error('Failed to log playback request', err)
        });
    }
  }

  handleStateChange(index: number, state: VideoPlayerState, playbackVideoSources: VideoSource[]) {
    this.videoUtils.update({ [index]: state });

    if (playbackVideoSources && playbackVideoSources[index]) {
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
                playbackVideoCurrentTime: DateTime.fromFormat(params.start_time, DateConst.serverDateTimeFormat).plus({
                  second: offset
                })
              })
            )
          ),
          takeUntil(this.destroy$)
        )
        .subscribe();
    });
  }

  ngOnInit(): void {
    this.store
      .select(IframeSelectors.iframeState)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: IframeState) => {
        this.channels = state.channels;
        this.vehicleId = state.vehicle_id;
        this.startTime = state.from;
        this.endTime = state.to;

        if (this.vehicleId && this.startTime && this.endTime) {
          this.playbackVideoSources$ = this.streamService.fetchPlaybackScope(this.vehicleId, { start_time: this.startTime, end_time: this.endTime, st: state.stream_mode?.toString() ?? '1' }).pipe(
            switchMap(scope => {
              if (!scope.data || !scope.data.cameras) {
                return of([]);
              }

              if (scope.data.status) {
                this.vehicleStatus = scope.data.status;
                this.isVehicleOffline = this.vehicleStatus.toLowerCase() === 'inactive';
                this.vehicleRegistrationPlate = scope.data.registration_plate ?? '';
              }

              const videoSn = scope.data.sn;
              const selectedChannels = this.channels || [];
              const sources: VideoSource[] = scope.data.cameras
                .filter((camera: { channel: number; provider: string; main_stream: string; sub_stream: string; provider_details?: any }) => selectedChannels.includes(camera.channel))
                .map((camera: { channel: number; provider: string; main_stream: string; sub_stream: string; provider_details?: any }) => ({
                  provider: camera.provider,
                  channel: camera.channel,
                  stream: camera[this.selectedStream],
                  sn: videoSn,
                  has_playback_fixed: scope.data.has_playback_fixed,
                  provider_details: camera.provider_details
                }));

              const channels = sources.map(source => source.channel);

              if (!scope.data.has_playback_fixed) {
                if (sources.length && channels.length) {
                  return Html265Utils.preInitOldWay(this.httpClient, scope.data.initial_request, channels, videoSn).pipe(map(() => sources));
                }
              }

              return of(sources);
            })
          );
        }
      });

    this.setupStuckDetection();
  }

  ngOnDestroy(): void {
    if (this.stuckDetectionTimer) {
      clearInterval(this.stuckDetectionTimer);
      this.stuckDetectionTimer = null;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
