import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { VideoPlayerState, VideoSource } from 'src/app/shared/component/smax-video/smax-video.model';
import { VideoLiveComponent } from '../../../../shared/component/video/video-live/video-live.component';
import { StreamService } from '../../stream.service';

@Component({
  selector: 'app-stream-core-live-feed-videos',
  templateUrl: './stream-core-live-feed-videos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamCoreLiveFeedVideosComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  liveFeed$ = this.store.select(StreamSelectors.liveFeed);
  selectedCameras: VideoSource[] = [];
  selectedStream: 'main_stream' | 'sub_stream' = 'sub_stream';
  private readonly subscription = new Subscription();
  @ViewChildren(VideoLiveComponent) videoComponents!: QueryList<VideoLiveComponent>;
  selectedStreamType$ = this.store.select(StreamSelectors.liveFeedStreamType);
  showPlaybackControls: boolean = true;
  maxVisibleChannels = 4;

  private readonly loadingChannels: Set<number> = new Set();
  private readonly loadingChannelsStartTimes = new Map<number, number>();

  constructor(private readonly streamService: StreamService, private readonly store: Store, private readonly actions$: Actions, private readonly cdr: ChangeDetectorRef, private readonly fb: FormBuilder) {}

  getProvider(): string {
    return this.selectedCameras[0]?.provider || 'STREAMAX';
  }

  handleLoadStart(channel: number): void {
    this.loadingChannels.add(channel);
    this.loadingChannelsStartTimes.set(channel, new Date().getTime());
  }

  handleLoadError(data: { channel: number; error: any }): void {
    this.loadingChannels.add(data.channel);

    const startTime = this.loadingChannelsStartTimes.get(data.channel) ?? 0;
    const loadTime = new Date().getTime() - startTime;
    this.logPlaybackRequest(data.channel, data.error.errorCode, loadTime);
  }

  private logPlaybackRequest(channel: number, status: number, time: number): void {
    this.store
      .select(StreamSelectors.selectedId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(vehicleId => {
        if (vehicleId) {
          this.streamService
            .logPlaybackRequest({
              vehicle_id: vehicleId,
              channels: channel.toString(),
              status: status,
              time: time,
              type: 'live'
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              error: err => console.error('Failed to log playback request', err)
            });
        }
      });
  }

  ngOnInit(): void {
    this.selectedStreamType$.pipe(takeUntil(this.destroy$)).subscribe(selectedStreamType => {
      this.selectedStream = selectedStreamType;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription?.unsubscribe();
    this.showPlaybackControls = false;
  }

  handleCameraStateChange(data: { index: number; state: any }) {
    this.handleVideoLoading(data.index, data.state, this.selectedCameras);
  }

  private handleVideoLoading(index: number, state: VideoPlayerState, selectedCameras: VideoSource[]): void {
    if (selectedCameras[index] && state.currentTime > 0) {
      const channel = selectedCameras[index].channel;
      if (this.loadingChannels.has(channel)) {
        this.loadingChannels.delete(channel);

        const startTime = this.loadingChannelsStartTimes.get(channel) ?? 0;
        const loadTime = new Date().getTime() - startTime;
        this.logPlaybackRequest(channel, 200, loadTime);
      }
    }
  }
}
