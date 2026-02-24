import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';
import RouteConst from '../../../../const/route';
import { EventTimeline } from '../../stream.model';
import { StreamSelectors } from '../../stream.selectors';

@Component({
  selector: 'app-stream-left-recent-event',
  templateUrl: './stream-left-recent-event.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamLeftRecentEventComponent {
  events$ = combineLatest([this.store.select(StreamSelectors.selectedId), this.store.select(StreamSelectors.updatedVehicles), this.store.select(StreamSelectors.updatedLiveFeed)]).pipe(
    map(([selectedId, vehicles, liveFeed]) => {
      const vehicle = vehicles.find(v => v.id === selectedId);
      const eventsFromVehicle = vehicle?.event_timeline ?? [];
      const eventsFromLiveFeed = liveFeed?.event_timeline ?? [];

      return eventsFromLiveFeed.length > 0 ? eventsFromLiveFeed : eventsFromVehicle;
    })
  );

  handleEventClick(event: EventTimeline): void {
    if (!event.event_id) {
      return;
    }
    this.router.navigate(['/', RouteConst.events, event.event_id]);
  }

  constructor(private readonly store: Store, private readonly router: Router) {}

  protected readonly length = length;
}
