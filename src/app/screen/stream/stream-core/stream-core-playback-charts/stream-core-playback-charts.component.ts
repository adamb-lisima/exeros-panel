import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { combineLatest, firstValueFrom, map, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import { StreamCorePlaybackChartsDownloadClipDialogComponent } from 'src/app/screen/stream/stream-core/stream-core-playback-charts-download-clip-dialog/stream-core-playback-charts-download-clip-dialog.component';
import { StreamCorePlaybackChartsDownloadClipDialogData } from 'src/app/screen/stream/stream-core/stream-core-playback-charts-download-clip-dialog/stream-core-playback-charts-download-clip-dialog.model';
import { StreamActions } from 'src/app/screen/stream/stream.actions';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { TimelineClip, TimelineData, TimelineTab } from 'src/app/shared/component/timeline/timeline.model';
import { StreamCorePlaybackChartsClipToEventComponent } from '../stream-core-playback-charts-clip-to-event/stream-core-playback-charts-clip-to-event.component';
import { StreamCorePlaybackChartsClipToEventData } from '../stream-core-playback-charts-clip-to-event/stream-core-playback-charts-clip-to-event.model';
import { StreamCorePlaybackChartsShareClipDialogComponent } from '../stream-core-playback-charts-share-clip-dialog/stream-core-playback-charts-share-clip-dialog.component';
import { StreamCorePlaybackChartsShareClipDialogData } from '../stream-core-playback-charts-share-clip-dialog/stream-core-playback-charts-share-clip-dialog.model';

@Component({
  selector: 'app-stream-core-playback-charts',
  templateUrl: './stream-core-playback-charts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamCorePlaybackChartsComponent implements OnDestroy {
  private hasAttemptedToFetchTelemetryScope = false;
  isTimelineFullscreen$ = this.store.select(StreamSelectors.isTimelineFullscreen);

  private readonly destroy$ = new Subject<void>();
  private subscriptions = new Subscription();

  data$ = this.store.select(StreamSelectors.playbackTimeline).pipe(
    map((playbackTimeline): TimelineData | undefined => {
      if (!playbackTimeline) {
        return undefined;
      }
      const events = playbackTimeline.video_timeline.map(videoTimeline => ({
        name: videoTimeline.name,
        startTime: videoTimeline.start_time,
        endTime: videoTimeline.end_time,
        filetype: videoTimeline.filetype
      }));
      return {
        date: playbackTimeline.date,
        eventTimeline: {
          events,
          icons: playbackTimeline.event_timeline.map(eventTimeline => ({
            eventIcon: eventTimeline.event_icon,
            eventName: eventTimeline.name,
            eventId: eventTimeline.event_id,
            date: eventTimeline.time,
            icon: eventTimeline.type.toLowerCase(),
            thumbnail: eventTimeline.thumbnail
          }))
        },
        speedTimeline: playbackTimeline.speed_timeline.map(speedTimeline => ({
          time: speedTimeline.time,
          speed: speedTimeline.speed,
          rpm: speedTimeline.rpm
        })),
        fuelTimeline: playbackTimeline.fuel_timeline.map(fuelTimeline => ({
          time: fuelTimeline.time,
          fuelVolume: fuelTimeline.fuel_volume,
          fuelLevel: fuelTimeline.fuel_level
        })),
        hybridTimeline: playbackTimeline.hybrid_timeline.map(hybridTimeline => ({
          time: hybridTimeline.time,
          hybridLevel: hybridTimeline.hybrid_level
        })),
        maxFuel: playbackTimeline.max_fuel,
        driverTimeline: {
          events,
          icons: playbackTimeline.driver_timeline.map(driverTimeline => ({
            eventIcon: '',
            eventName: driverTimeline.name,
            date: driverTimeline.time,
            icon: 'driver'
          }))
        },
        alarmTimeline: playbackTimeline.alarm_timeline
      };
    })
  );
  selectedTab$ = this.data$.pipe(
    map((data): TimelineTab => {
      return data?.eventTimeline?.events.length ? 'timeline' : data?.speedTimeline?.length ? 'speed graph' : 'driver';
    })
  );
  position$ = this.store.select(StreamSelectors.playbackVideoCurrentTime).pipe(map(playbackVideoCurrentTime => playbackVideoCurrentTime?.toJSDate()));

  playbackDownloadActive$ = this.store.select(StreamSelectors.playbackDownloadActive);
  playbackTimeline$ = this.store.select(StreamSelectors.playbackTimeline);
  isPlaying$ = this.store.select(StreamSelectors.isPlaybackPlaying);
  playbackShareActive$ = this.store.select(StreamSelectors.playbackShareActive);
  clipToEventActive$ = this.store.select(StreamSelectors.clipToEventActive);

  constructor(private readonly store: Store, private readonly dialog: Dialog) {
    const scopeSub = this.store
      .select(StreamSelectors.playbackScope)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: scope => {
          if (!scope) {
            this.hasAttemptedToFetchTelemetryScope = false;
          }
        },
        error: (error: unknown) => {
          console.error('Error in playbackScope subscription:', error);
        }
      });

    this.subscriptions.add(scopeSub);

    const tripSub = this.store
      .select(StreamSelectors.selectedTripIndex)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.hasAttemptedToFetchTelemetryScope = false;
        },
        error: (error: unknown) => {
          console.error('Error in selectedTripIndex subscription:', error);
        }
      });

    this.subscriptions.add(tripSub);
  }

  async handlePositionChange(date: Date | undefined) {
    const [data, playbackParams, playbackSelectedSources, playbackScope, playbackTimeline] = await firstValueFrom(combineLatest([this.data$, this.store.select(StreamSelectors.playbackParams), this.store.select(StreamSelectors.playbackSelectedSources), this.store.select(StreamSelectors.playbackScope), this.playbackTimeline$]));

    const eventsExist = (data?.eventTimeline?.events?.length ?? 0) > 0 || (data?.speedTimeline?.length ?? 0) > 0 || (data?.driverTimeline?.events?.length ?? 0) > 0;
    if (date && eventsExist) {
      const startTime = DateTime.fromJSDate(date);

      this.store.dispatch(
        StreamActions.setPlaybackVideoStartTime({
          playbackVideoStartTime: startTime
        })
      );

      this.store.dispatch(
        StreamActions.setPlaybackVideoCurrentTime({
          playbackVideoCurrentTime: startTime
        })
      );

      if (playbackSelectedSources.length === 0 && playbackScope?.cameras && playbackScope.cameras.length > 0) {
        const firstCamera = playbackScope.cameras[0];
        this.store.dispatch(
          StreamActions.setPlaybackSelectedSources({
            playbackSelectedSources: [
              {
                provider: firstCamera.provider,
                channel: firstCamera.channel,
                stream: playbackParams.st === '1' ? firstCamera.main_stream : firstCamera.sub_stream,
                has_playback_fixed: playbackScope.has_playback_fixed,
                provider_details: firstCamera.provider_details
              }
            ]
          })
        );
      }
      if (playbackTimeline?.has_telematics && !playbackTimeline.has_video && (!playbackScope || !playbackScope.telemetry_timeline || playbackScope.telemetry_timeline.length === 0) && !this.hasAttemptedToFetchTelemetryScope) {
        this.hasAttemptedToFetchTelemetryScope = true;

        this.store.dispatch(
          StreamActions.fetchPlaybackScope({
            params: {
              start_time: startTime.toFormat(DateConst.serverDateTimeFormat),
              end_time: startTime.endOf('day').toFormat(DateConst.serverDateTimeFormat),
              st: playbackParams.st
            }
          })
        );
      }

      if (playbackTimeline?.has_video) {
        this.store.dispatch(
          StreamActions.fetchPlaybackScope({
            params: {
              start_time: startTime.toFormat(DateConst.serverDateTimeFormat),
              end_time: startTime.endOf('day').toFormat(DateConst.serverDateTimeFormat),
              st: playbackParams.st
            }
          })
        );
      } else if (playbackTimeline?.has_telematics) {
        this.store.dispatch(
          StreamActions.setPlaybackVideoCurrentTime({
            playbackVideoCurrentTime: startTime
          })
        );
      }
    }
  }

  handleDownloadClipClick(clip: TimelineClip) {
    this.dialog.open<void, StreamCorePlaybackChartsDownloadClipDialogData>(StreamCorePlaybackChartsDownloadClipDialogComponent, { data: clip });
  }

  handleShareClipClick(clip: TimelineClip) {
    this.dialog.open<void, StreamCorePlaybackChartsShareClipDialogData>(StreamCorePlaybackChartsShareClipDialogComponent, { data: clip });
  }

  handleClipToEventClick(clip: TimelineClip) {
    this.dialog.open<void, StreamCorePlaybackChartsClipToEventData>(StreamCorePlaybackChartsClipToEventComponent, { data: clip });
  }

  resetTelemetryScope() {
    this.hasAttemptedToFetchTelemetryScope = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();
  }
}
