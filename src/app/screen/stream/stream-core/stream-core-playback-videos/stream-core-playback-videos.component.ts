import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { bufferTime, catchError, combineLatest, distinctUntilChanged, filter, first, map, Observable, of, Subject, Subscription, switchMap, take, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import { StreamActions } from 'src/app/screen/stream/stream.actions';
import { CameraInfo, PlaybackScope } from 'src/app/screen/stream/stream.model';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { StreamService } from 'src/app/screen/stream/stream.service';
import { VideoPlayerState, VideoSource } from 'src/app/shared/component/smax-video/smax-video.model';
import { firstNonNullish, waitOnceForAction } from 'src/app/util/operators';
import Html265Utils from '../../../../shared/component/smax-video/video-h265/html265.utils';
import { SmaxVideoH265Component } from '../../../../shared/component/smax-video/video-h265/smax-video-h265.component';
import { AlertActions } from '../../../../store/alert/alert.actions';
import { ProviderType } from '../../../../screen/settings/settings.model';

@Component({
  selector: 'app-stream-core-playback-videos',
  templateUrl: './stream-core-playback-videos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamCorePlaybackVideosComponent implements OnInit, OnDestroy {
  @ViewChildren(SmaxVideoH265Component) videoH265Components!: QueryList<SmaxVideoH265Component>;

  playbackTimeline$ = this.store.select(StreamSelectors.playbackTimeline);
  playback$ = this.store.select(StreamSelectors.playback);
  playbackScope$ = this.store.select(StreamSelectors.playbackScope);
  playbackParams$ = this.store.select(StreamSelectors.playbackParams);
  playbackVideoCurrentTime$ = this.store.select(StreamSelectors.playbackVideoCurrentTime);

  private readonly destroy$ = new Subject<void>();
  private subscriptions = new Subscription();

  maxVisibleChannels = 4;
  showAllChannels = false;

  playbackBeginTime = '';
  playbackEndTime = '';

  playbackVideoSources$: Observable<VideoSource[] | undefined> = combineLatest([this.store.select(StreamSelectors.playbackScope), this.store.select(StreamSelectors.playbackSelectedSources), this.store.select(StreamSelectors.selectedId), this.playbackParams$]).pipe(
    switchMap(([playbackScope, playbackSelectedSources, selectedId, playbackParams]) => {
      const videoSn = DateTime.now().setZone('Europe/London').valueOf();

      if (selectedId !== null) {
        this.store.dispatch(
          StreamActions.setDeviceStreamInitialized({
            deviceId: selectedId!,
            initialized: true,
            sn: videoSn.toString()
          })
        );
      }

      const selectedChannels = playbackSelectedSources.map(group => group.channel);
      const sources = playbackScope?.cameras
        .filter(camera => selectedChannels.includes(camera.channel))
        .map(
          (camera): VideoSource => ({
            provider: camera.provider,
            channel: camera.channel,
            stream: camera[playbackParams.st === '1' ? 'main_stream' : 'sub_stream'],
            sn: videoSn!,
            has_playback_fixed: playbackScope?.has_playback_fixed,
            provider_details: camera.provider_details
          })
        );

      if (!playbackScope?.has_playback_fixed) {
        const channels = sources?.map(source => source.channel);
        return playbackScope && channels?.length ? Html265Utils.preInitOldWay(this.httpClient, playbackScope.initial_request, channels, videoSn!).pipe(map(() => sources)) : of(sources);
      }

      return of(sources);
    })
  );

  selectAllControl = this.fb.control(false);

  private sub?: Subscription;

  private readonly lastTimeUpdate = new Subject<DateTime>();
  private readonly updateBuffer = 2000;

  private stuckDetectionTimer: any;
  private readonly lastFrameTimes: { [channel: number]: number } = {};
  private readonly loadingChannels: Set<number> = new Set();
  private readonly loadingChannelsStartTimes = new Map<number, number>();

  private addSubscription(subscription: Subscription): void {
    this.subscriptions.add(subscription);
  }

  constructor(private readonly streamService: StreamService, private readonly store: Store, private readonly actions$: Actions, private readonly httpClient: HttpClient, private readonly fb: FormBuilder, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.store
      .select(StreamSelectors.playbackVideoCurrentTime)
      .pipe(
        first(),
        tap(time => {
          if (!time) {
            const now = DateTime.now();
            this.store.dispatch(
              StreamActions.setPlaybackVideoCurrentTime({
                playbackVideoCurrentTime: now
              })
            );
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    const timeSubscription = this.store
      .select(StreamSelectors.playbackVideoCurrentTime)
      .pipe(takeUntil(this.destroy$))
      .subscribe(time => {
        this.playbackBeginTime = time?.isValid ? time.toFormat(DateConst.serverDateTimeFormat) : '';
        this.playbackEndTime = time?.isValid ? time.endOf('day').toFormat(DateConst.serverDateTimeFormat) : '';
        this.cdr.markForCheck();
      });

    this.subscriptions.add(timeSubscription);

    const debugSubscription = combineLatest([this.store.select(StreamSelectors.playbackVideoCurrentTime), this.store.select(StreamSelectors.playbackScope), this.store.select(StreamSelectors.playbackSelectedSources)])
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.subscriptions.add(debugSubscription);

    this.sub = this.store
      .select(StreamSelectors.playbackScope)
      .pipe(
        firstNonNullish(),
        filter(playbackScope => playbackScope.cameras.length > 0),
        switchMap(playbackScope => combineLatest([of(playbackScope), this.playbackParams$])),
        takeUntil(this.destroy$),
        tap(([playbackScope, playbackParams]) => {
          const streamType = playbackParams.st === '1' ? 'main_stream' : 'sub_stream';
          this.store.dispatch(
            StreamActions.setPlaybackSelectedSources({
              playbackSelectedSources: [
                {
                  provider: playbackScope.cameras[0].provider,
                  channel: playbackScope.cameras[0].channel,
                  stream: playbackScope.cameras[0][streamType],
                  has_playback_fixed: playbackScope.has_playback_fixed,
                  provider_details: playbackScope.provider_details
                }
              ]
            })
          );
        })
      )
      .subscribe();

    this.setupSelectAllControl();
    this.setupTimeUpdates();
    this.setupPlaybackControl();
    this.setupStuckDetection();
  }

  private setupSelectAllControl(): void {
    this.sub?.add(
      this.selectAllControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(checked => {
        if (checked !== null) {
          this.playbackScope$.pipe(take(1), takeUntil(this.destroy$)).subscribe(scope => {
            if (scope) {
              this.handleSelectAllChange(checked, scope.cameras);
            }
          });
        }
      })
    );

    this.sub?.add(
      combineLatest([this.playbackScope$, this.playbackVideoSources$])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([scope, sources]) => {
          if (scope && sources) {
            const allSelected = scope.cameras.length === sources.length;
            this.selectAllControl.setValue(allSelected, { emitEvent: false });
            this.selectAllControl.markAsTouched();
          }
        })
    );
  }

  private setupTimeUpdates(): void {
    this.sub?.add(
      this.lastTimeUpdate
        .pipe(
          bufferTime(this.updateBuffer),
          filter(times => times.length > 0),
          map(times => times[times.length - 1]),
          distinctUntilChanged((prev, curr) => prev.toFormat(DateConst.serverDateTimeFormat) === curr.toFormat(DateConst.serverDateTimeFormat)),
          takeUntil(this.destroy$)
        )
        .subscribe(time => {
          this.store.dispatch(
            StreamActions.setPlaybackVideoCurrentTime({
              playbackVideoCurrentTime: time
            })
          );
        })
    );
  }

  private setupPlaybackControl(): void {
    this.sub?.add(
      this.store
        .select(StreamSelectors.isPlaybackPlaying)
        .pipe(takeUntil(this.destroy$))
        .subscribe(isPlaying => {
          if (this.videoH265Components) {
            this.videoH265Components.forEach(component => {
              if (isPlaying) {
                component.play();
              } else {
                component.pause();
              }
            });
          }
        })
    );
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
    this.sub?.unsubscribe();

    Object.keys(this.lastFrameTimes).forEach(key => {
      const numKey = parseInt(key, 10);
      delete this.lastFrameTimes[numKey];
    });

    this.loadingChannels.clear();
    this.loadingChannelsStartTimes.clear();

    if (this.stuckDetectionTimer) {
      clearInterval(this.stuckDetectionTimer);
      this.stuckDetectionTimer = null;
    }

    this.store.dispatch(StreamActions.resetInitializedStreams());
  }

  getTimelineStart(timeline: any): string {
    if (timeline?.speed_timeline?.length > 0) {
      return timeline.speed_timeline[0].time;
    }
    return '';
  }

  getTimelineEnd(timeline: any): string {
    if (timeline?.speed_timeline?.length > 0) {
      return timeline.speed_timeline[timeline.speed_timeline.length - 1].time;
    }
    return '';
  }

  getProvider(provider?: string): string {
    return provider ?? ProviderType.STREAMAX;
  }

  handleVideoStateChange(event: any): void {
    if (event.index !== undefined && event.state) {
      this.handleStateChange(event.index, event.state);
    }
  }

  handleTimeChange(event: any): void {
    if (event.utc) {
      const time = DateTime.fromISO(event.utc);
      this.lastTimeUpdate.next(time);
    }
  }

  handleVideoLoadError(event: { channel: number; error: any }): void {
    this.handleLoadError(event.channel, event.error);
  }

  handleVideoLoadStart(channel: number): void {
    this.handleLoadStart(channel);
  }

  handleLoadStart(channel: number): void {
    this.loadingChannels.add(channel);
    const startTime = new Date().getTime();
    this.loadingChannelsStartTimes.set(channel, startTime);
  }

  handleLoadError(channel: number, error: any): void {
    this.loadingChannels.add(channel);

    const startTime = this.loadingChannelsStartTimes.get(channel) ?? 0;
    const endTime = new Date().getTime();
    const loadTime = endTime - startTime;

    const errorCode = error.errorCode ?? error.code ?? -1;
    this.logPlaybackRequest(channel, errorCode, loadTime);

    if (errorCode === -3) {
      this.reinitializePlayback();
    }
  }

  private logPlaybackRequest(channel: number, status: number, time: number): void {
    const logSub = this.store
      .select(StreamSelectors.selectedId)
      .pipe(
        first(),
        filter(vehicleId => !!vehicleId),
        switchMap(vehicleId =>
          this.streamService
            .logPlaybackRequest({
              vehicle_id: vehicleId!,
              channels: channel.toString(),
              status: status,
              time: time,
              type: 'playback'
            })
            .pipe(
              catchError((error: unknown) => {
                return of(null);
              })
            )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {}
      });

    this.addSubscription(logSub);
  }

  private isReinitializing = false;
  private reinitTimeout: any = null;
  private lastAlertTime = 0;
  private readonly ALERT_THROTTLE_TIME = 3000;
  private readonly REINIT_DELAY = 200;

  private reinitializePlayback(): void {
    if (this.isReinitializing) {
      return;
    }

    this.isReinitializing = true;

    const currentTime = Date.now();
    if (currentTime - this.lastAlertTime > this.ALERT_THROTTLE_TIME) {
      this.lastAlertTime = currentTime;
      this.store.dispatch(
        AlertActions.display({
          alert: {
            message: 'Connection issue detected',
            list: ['Experiencing connection problems with the device. Reconnecting...'],
            type: 'error'
          }
        })
      );
    }

    if (this.reinitTimeout) {
      clearTimeout(this.reinitTimeout);
    }

    this.reinitTimeout = setTimeout(() => {
      const reinitSub = combineLatest([this.store.select(StreamSelectors.playbackVideoCurrentTime).pipe(firstNonNullish()), this.playbackParams$])
        .pipe(
          first(),
          tap(([playbackVideoCurrentTime, playbackParams]) => {
            this.store.dispatch(
              StreamActions.fetchPlaybackScope({
                params: {
                  start_time: playbackVideoCurrentTime.toFormat(DateConst.serverDateTimeFormat),
                  end_time: playbackVideoCurrentTime.endOf('day').toFormat(DateConst.serverDateTimeFormat),
                  st: playbackParams.st,
                  isTimeoutOrServerError: true
                }
              })
            );

            setTimeout(() => {
              this.isReinitializing = false;
            }, 1000);
          }),
          catchError((error: unknown) => {
            this.isReinitializing = false;
            return of(null);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (error: unknown) => {
            this.isReinitializing = false;
          }
        });

      this.addSubscription(reinitSub);
    }, this.REINIT_DELAY);
  }

  private hardResetChannel(channel: number): void {
    this.store
      .select(StreamSelectors.playbackSelectedSources)
      .pipe(
        first(),
        takeUntil(this.destroy$),
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
                takeUntil(this.destroy$),
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
                })
              )
              .subscribe();
          }, 2000);
        })
      )
      .subscribe();
  }

  handleChannelClick(containsChannel: boolean, camera: PlaybackScope['cameras'][number]): void {
    combineLatest([this.store.select(StreamSelectors.playbackScope), this.store.select(StreamSelectors.playbackSelectedSources), this.playbackParams$])
      .pipe(first(), takeUntil(this.destroy$))
      .subscribe(([playbackScope, playbackSelectedSources, playbackParams]) => {
        let newSources;
        if (containsChannel) {
          newSources = playbackSelectedSources.filter(s => s.channel !== camera.channel);
        } else {
          if (playbackSelectedSources.length >= 4) {
            return;
          }
          newSources = [
            ...playbackSelectedSources,
            {
              provider: camera.provider,
              channel: camera.channel,
              stream: playbackParams.st === '1' ? camera.main_stream : camera.sub_stream,
              has_playback_fixed: playbackScope?.has_playback_fixed ?? false,
              provider_details: camera.provider_details
            }
          ];
        }

        this.store.dispatch(StreamActions.setPlaybackSelectedSources({ playbackSelectedSources: newSources }));
      });
  }

  handleStateChange(index: number, state: VideoPlayerState) {
    this.playbackVideoSources$.pipe(first(), takeUntil(this.destroy$)).subscribe(playbackVideoSources => {
      if (!playbackVideoSources) return;

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
    });
  }

  handleSelectAllChange(checked: boolean, cameras: PlaybackScope['cameras']): void {
    if (checked) {
      combineLatest([this.store.select(StreamSelectors.playbackScope), this.store.select(StreamSelectors.playbackVideoCurrentTime).pipe(firstNonNullish()), this.playbackParams$])
        .pipe(
          first(),
          takeUntil(this.destroy$),
          tap(([, playbackVideoCurrentTime, playbackParams]) => {
            this.store.dispatch(
              StreamActions.fetchPlaybackScope({
                params: {
                  start_time: playbackVideoCurrentTime.toFormat(DateConst.serverDateTimeFormat),
                  end_time: playbackVideoCurrentTime.endOf('day').toFormat(DateConst.serverDateTimeFormat),
                  st: playbackParams.st
                }
              })
            );
          }),
          switchMap(() => this.actions$),
          waitOnceForAction([StreamActions.fetchPlaybackScopeSuccess]),
          switchMap(() => combineLatest([this.store.select(StreamSelectors.playbackScope), this.store.select(StreamSelectors.playbackVideoCurrentTime).pipe(firstNonNullish()), this.playbackParams$])),
          first(),
          tap(([playbackScope, , playbackParams]) => {
            const selectedSources = cameras.map(camera => ({
              provider: camera.provider,
              channel: camera.channel,
              stream: playbackParams.st === '1' ? camera.main_stream : camera.sub_stream,
              has_playback_fixed: playbackScope?.has_playback_fixed ?? false,
              provider_details: camera.provider_details
            }));
            this.store.dispatch(
              StreamActions.setPlaybackSelectedSources({
                playbackSelectedSources: selectedSources
              })
            );
          })
        )
        .subscribe();
    } else {
      this.store.dispatch(
        StreamActions.setPlaybackSelectedSources({
          playbackSelectedSources: []
        })
      );
    }
  }

  handleMaxChannel(isSelected: boolean, sources: VideoSource[]): boolean {
    if (isSelected) {
      return true;
    }
    return sources.length < this.maxVisibleChannels;
  }

  trackByCamera(index: number, camera: CameraInfo): number {
    return camera.id;
  }

  handlePlaceholderCameraClick(camera: CameraInfo): void {
    combineLatest([this.store.select(StreamSelectors.playbackVideoCurrentTime).pipe(firstNonNullish()), this.playbackParams$])
      .pipe(
        first(),
        takeUntil(this.destroy$),
        tap(([playbackVideoCurrentTime, playbackParams]) =>
          this.store.dispatch(
            StreamActions.fetchPlaybackScope({
              params: {
                start_time: playbackVideoCurrentTime.toFormat(DateConst.serverDateTimeFormat),
                end_time: playbackVideoCurrentTime.endOf('day').toFormat(DateConst.serverDateTimeFormat),
                st: playbackParams.st
              }
            })
          )
        )
      )
      .subscribe();
  }
}
