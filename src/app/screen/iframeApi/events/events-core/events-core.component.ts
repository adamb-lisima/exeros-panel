import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../../const/date';
import { VideoPlayerState, VideoSource } from '../../../../shared/component/smax-video/smax-video.model';
import SmaxVideoUtils from '../../../../shared/component/smax-video/smax-video.utils';
import { IframeState } from '../../../../store/iframe/iframe.reducer';
import { IframeSelectors } from '../../../../store/iframe/iframe.selectors';
import { firstNonNullish } from '../../../../util/operators';
import { EventsActions } from '../../../events/events.actions';
import { EventsSelectors } from '../../../events/events.selectors';

@Component({
  templateUrl: './events-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsCoreComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  constructor(private readonly store: Store) {}

  private readonly videoUtils = new SmaxVideoUtils();

  eventId!: string | undefined;
  channels!: number[] | undefined;

  event$ = this.store.select(EventsSelectors.event);
  cameras$ = this.store.select(EventsSelectors.event).pipe(
    map(event =>
      event?.cameras.map(camera => ({
        picture: camera.picture,
        channel: camera.channel,
        stream: camera.sub_stream,
        key: Date.now()
      }))
    )
  );

  ngOnInit(): void {
    this.store
      .select(IframeSelectors.iframeState)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: IframeState) => {
        this.channels = state.channels;
        this.eventId = state.event_id;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCamera(camera: any) {
    return camera as VideoSource;
  }

  async handleStateChange(index: number, state: VideoPlayerState) {
    this.videoUtils.update({ [index]: state });
    await this.videoUtils.sync(index);
    this.videoUtils.emitOffset(offset => {
      this.store
        .select(EventsSelectors.event)
        .pipe(
          firstNonNullish(),
          tap(event => {
            if (event.occurence_start_time) {
              this.store.dispatch(
                EventsActions.setVideoCurrentTime({
                  videoCurrentTime: DateTime.fromFormat(event.occurence_start_time, DateConst.serverDateTimeFormat).plus({ second: offset })
                })
              );
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    });
  }
}
