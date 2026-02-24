import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { EventsStatsElement } from '../../fleets.model';
import { FleetsSelectors } from '../../fleets.selectors';

@Component({
  selector: 'app-fleets-core-active-vehicles',
  templateUrl: './fleets-core-active-vehicles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsCoreActiveVehiclesComponent {
  eventsStats$: Observable<EventsStatsElement | undefined> = this.store.select(FleetsSelectors.eventsStatsElement);

  constructor(private readonly store: Store) {}
}
