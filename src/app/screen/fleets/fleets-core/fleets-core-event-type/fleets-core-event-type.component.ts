import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { EventsStatsElement } from '../../fleets.model';
import { FleetsSelectors } from '../../fleets.selectors';

@Component({
  selector: 'app-fleets-core-event-type',
  templateUrl: './fleets-core-event-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsCoreEventTypeComponent implements OnInit, OnDestroy {
  eventsStats$: Observable<EventsStatsElement | undefined> = this.store.select(FleetsSelectors.eventsStatsElement);
  private sub?: Subscription;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.sub = new Subscription();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
