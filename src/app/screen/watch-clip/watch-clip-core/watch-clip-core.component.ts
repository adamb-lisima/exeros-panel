import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Camera } from '../../../service/http/live-feeds/live-feeds.model';
import { VideoPlayerState, VideoSource } from '../../../shared/component/smax-video/smax-video.model';
import SmaxVideoUtils from '../../../shared/component/smax-video/smax-video.utils';
import { StreamActions } from '../../stream/stream.actions';

interface WatchClipResponseData {
  data:
    | {
        cameras?: Camera[];
        shared_clip?: {
          name: string;
          user_name: string;
          registration_plate: string;
          [key: string]: any;
        };
      }
    | string[];
}

@Component({
  selector: 'app-watch-clip-core',
  templateUrl: './watch-clip-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WatchClipCoreComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly subscription = new Subscription();
  private readonly camerasSubject = new BehaviorSubject<VideoSource[]>([]);
  cameras$: Observable<VideoSource[]> = this.camerasSubject.asObservable();

  loading = true;
  error: string | null = null;
  requiresPassword = false;
  invalidPassword = false;
  processingClip = false;
  clipReady = false;

  private videoUtils = new SmaxVideoUtils();
  clipName: string | null = null;
  clipOwner: string | null = null;
  vehicleInfo: string | null = null;

  videoSource: VideoSource | null = null;
  clipData: any = null;
  playerState: string = 'LOADING';

  passwordForm = new FormGroup({
    password: new FormControl('')
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.error = 'Invalid clip link';
      this.loading = false;
      return;
    }

    this.subscription.add(
      this.actions$.pipe(ofType(StreamActions.watchClipSuccess), takeUntil(this.destroy$)).subscribe({
        next: ({ response }) => {
          this.loading = false;
          this.videoUtils = new SmaxVideoUtils();

          const typedResponse = response as unknown as WatchClipResponseData;
          this.clipData = response;

          if (typedResponse.data && Array.isArray(typedResponse.data) && typedResponse.data.length > 0) {
            const errorMessage = typedResponse.data[0];

            if (errorMessage === 'The video is not ready yet.') {
              this.processingClip = true;
              this.requiresPassword = false;
              this.cdr.detectChanges();
              return;
            }

            if (errorMessage === 'provide password') {
              this.requiresPassword = true;
              this.processingClip = false;
              this.clipReady = false;
              this.cdr.detectChanges();
              return;
            }
          }

          if (typedResponse.data && typeof typedResponse.data === 'object' && !Array.isArray(typedResponse.data)) {
            this.requiresPassword = false;

            if (typedResponse.data.shared_clip) {
              this.clipName = typedResponse.data.shared_clip.name || null;
              this.clipOwner = typedResponse.data.shared_clip.user_name || null;
              this.vehicleInfo = typedResponse.data.shared_clip.registration_plate || null;
            }

            if (typedResponse.data.cameras && Array.isArray(typedResponse.data.cameras)) {
              const cameras = typedResponse.data.cameras;
              const videoSources: VideoSource[] = cameras
                .filter(camera => (camera.main_stream || camera.sub_stream) && camera.channel)
                .map(camera => ({
                  provider: camera.provider,
                  channel: camera.channel,
                  stream: camera.main_stream || camera.sub_stream || '',
                  has_playback_fixed: true,
                  key: `clip_${camera.channel}_${Date.now()}`,
                  provider_details: []
                }));

              if (videoSources.length > 0) {
                this.clipReady = true;
                this.camerasSubject.next(videoSources);
                this.cdr.detectChanges();
              } else {
                this.error = 'No valid video streams found in the response';
                console.error('No valid streams in cameras:', cameras);
                this.cdr.detectChanges();
              }
            } else {
              this.error = 'No cameras found in the response';
              console.error('No cameras array in response data:', typedResponse.data);
              this.cdr.detectChanges();
            }
          }
        },
        error: (error: unknown) => {
          console.error('Error watching clip:', error);
          this.loading = false;
          this.error = 'An error occurred while loading the clip';
          this.cdr.detectChanges();
        }
      })
    );

    this.store.dispatch(
      StreamActions.watchClip({
        slug,
        params: {}
      })
    );
  }

  submitPassword(): void {
    if (this.passwordForm.valid) {
      const slug = this.route.snapshot.paramMap.get('slug');
      const password = this.passwordForm.get('password')?.value;

      if (slug && password) {
        this.loading = true;
        this.invalidPassword = false;

        this.store.dispatch(
          StreamActions.watchClip({
            slug,
            params: { password }
          })
        );
      }
    }
  }

  getCamera(camera: any): VideoSource {
    return camera as VideoSource;
  }

  async handleStateChange(index: number, state: VideoPlayerState): Promise<void> {
    this.videoUtils.update({ [index]: state });
    await this.videoUtils.sync(index);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
    this.videoUtils.reset();
  }

  constructor(private readonly store: Store, private readonly route: ActivatedRoute, private readonly actions$: Actions, private readonly cdr: ChangeDetectorRef) {}
}
