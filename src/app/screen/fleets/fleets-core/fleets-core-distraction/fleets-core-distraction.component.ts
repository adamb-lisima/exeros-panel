import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { EventsStatsElement } from '../../fleets.model';
import { FleetsSelectors } from '../../fleets.selectors';

@Component({
  selector: 'app-fleets-core-distraction',
  templateUrl: './fleets-core-distraction.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsCoreDistractionComponent {
  eventsStats$: Observable<EventsStatsElement | undefined> = this.store.select(FleetsSelectors.eventsStatsElement);

  constructor(private readonly store: Store) {}
}
