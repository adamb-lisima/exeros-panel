import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { EventsStatsElement } from '../../fleets.model';
import { FleetsSelectors } from '../../fleets.selectors';

@Component({
  selector: 'app-fleets-core-no-driver',
  templateUrl: './fleets-core-no-driver.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsCoreNoDriverComponent {
  eventsStats$: Observable<EventsStatsElement | undefined> = this.store.select(FleetsSelectors.eventsStatsElement);
  constructor(private readonly store: Store) {}
}
