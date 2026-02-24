import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';
import { AppState } from '../../../store/app-store.model';
import MapUtil from '../../../util/map';

import { StreamSelectors } from '../../stream/stream.selectors';

@Component({
  templateUrl: './playbacks-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaybacksCoreComponent {
  @HostBinding('class') hostClass = 'h-full';

  playback$ = this.store.select(StreamSelectors.playback);
  playbackParams$ = this.store.select(StreamSelectors.playbackParams);

  selectedId$ = this.store.select(StreamSelectors.selectedId);
  markers$ = this.store.select(StreamSelectors.mapVehicles).pipe(map(vehicles => vehicles.map(vehicle => MapUtil.mapVehicleToMapMarkerData(vehicle))));
  @Input() isMenuCollapsed = false;
  playbackTimeline$ = this.store.select(StreamSelectors.playbackTimeline);
  isBottomHidden = false;

  hasAvailableData$ = combineLatest([this.playback$, this.playbackParams$, this.playbackTimeline$]).pipe(
    map(([playback, params, timeline]) => {
      if (!playback || !timeline) {
        return false;
      }

      const currentDate = params?.date;

      if (currentDate) {
        const dateExists = playback.calendar.some(entry => entry.date === currentDate);

        if (!dateExists) {
          return false;
        }
      }

      const hasVideoData = timeline.video_timeline && timeline.video_timeline.length > 0;
      const hasSpeedData = timeline.speed_timeline && timeline.speed_timeline.length > 0;
      const hasEventData = timeline.event_timeline && timeline.event_timeline.length > 0;
      const hasDriverData = timeline.driver_timeline && timeline.driver_timeline.length > 0;

      let result = false;
      if (hasVideoData) result = true;
      if (hasSpeedData) result = true;
      if (hasEventData) result = true;
      if (hasDriverData) result = true;

      return result;
    })
  );

  constructor(private readonly store: Store<AppState>) {}

  toggleBottom(): void {
    this.isBottomHidden = !this.isBottomHidden;
  }
}
