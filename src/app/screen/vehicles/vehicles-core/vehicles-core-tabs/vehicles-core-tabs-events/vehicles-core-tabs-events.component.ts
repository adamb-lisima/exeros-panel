import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { VehiclesSelectors } from '../../../vehicles.selectors';

@Component({
  selector: 'app-vehicles-core-tabs-events',
  templateUrl: './vehicles-core-tabs-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreTabsEventsComponent {
  eventsLoading$ = this.store.select(VehiclesSelectors.eventsLoading);
  events$ = this.store.select(VehiclesSelectors.events);
  eventsMeta$ = this.store.select(VehiclesSelectors.eventsMeta);

  constructor(private readonly store: Store) {}
}
