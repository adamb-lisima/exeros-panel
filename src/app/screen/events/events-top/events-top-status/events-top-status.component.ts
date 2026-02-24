import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { EventsSelectors } from 'src/app/screen/events/events.selectors';

@Component({
  selector: 'app-events-top-status',
  templateUrl: './events-top-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsTopStatusComponent {
  event$ = this.store.select(EventsSelectors.event);

  constructor(private readonly store: Store) {}
}
