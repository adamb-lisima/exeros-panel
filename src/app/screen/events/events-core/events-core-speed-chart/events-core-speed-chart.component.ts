import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { filter, map } from 'rxjs';
import DateConst from 'src/app/const/date';
import { EventsSelectors } from '../../events.selectors';

@Component({
  selector: 'app-events-core-speed-chart',
  templateUrl: './events-core-speed-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsCoreSpeedChartComponent {
  event$ = this.store.select(EventsSelectors.event).pipe(map(event => (event ? { is_overlimit: event.is_overlimit, speed: event.speed ?? 0 } : null)));
  speedData$ = this.store.select(EventsSelectors.event).pipe(
    map(event => event?.speed_timeline ?? []),
    map(speedTimeline =>
      speedTimeline.map(timeline => ({
        x: DateTime.fromFormat(timeline.time, DateConst.serverDateTimeFormat).toJSDate(),
        y: timeline.speed,
        unit: 'KPH'
      }))
    )
  );
  position$ = this.store.select(EventsSelectors.videoCurrentTime).pipe(map(time => time?.toJSDate()));

  eventStart$ = this.store.select(EventsSelectors.event).pipe(
    filter((event): event is NonNullable<typeof event> & { occurence_start_time: string } => event?.occurence_start_time != undefined),
    map(event => ({
      type: event.event_icon ?? null,
      startTime: DateTime.fromFormat(event.occurence_start_time, DateConst.serverDateTimeFormat).toJSDate()
    }))
  );

  constructor(private readonly store: Store) {}
}
