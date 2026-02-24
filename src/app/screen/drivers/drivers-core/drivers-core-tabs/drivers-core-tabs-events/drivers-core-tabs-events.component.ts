import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-store.model';
import { DriversSelectors } from '../../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-tabs-events',
  templateUrl: './drivers-core-tabs-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreTabsEventsComponent {
  eventsLoading$ = this.store.select(DriversSelectors.eventsLoading);
  events$ = this.store.select(DriversSelectors.events);
  eventsMeta$ = this.store.select(DriversSelectors.eventsMeta);

  constructor(private readonly store: Store<AppState>) {}
}
