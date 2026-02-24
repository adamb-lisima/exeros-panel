import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { EventsStatsElement } from '../../fleets.model';
import { FleetsSelectors } from '../../fleets.selectors';

@Component({
  selector: 'app-fleets-core-events-to-review',
  templateUrl: './fleets-core-events-to-review.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsCoreEventsToReviewComponent {
  eventsStats$: Observable<EventsStatsElement | undefined> = this.store.select(FleetsSelectors.eventsStatsElement);
  constructor(private readonly store: Store) {}
}
