import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { EventsStatsElement } from '../../fleets.model';
import { FleetsSelectors } from '../../fleets.selectors';

@Component({
  selector: 'app-fleets-core-fatigue',
  templateUrl: './fleets-core-fatigue.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsCoreFatigueComponent implements OnInit {
  eventsStats$: Observable<EventsStatsElement | undefined> = this.store.select(FleetsSelectors.eventsStatsElement);
  private sub?: Subscription;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.sub = new Subscription();
  }
}
