import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import RouteConst from '../../../../const/route';
import { AppState } from '../../../../store/app-store.model';
import { AccessGroup } from '../../../settings/settings.model';
import { Event } from '../../events.model';
import { EventsSelectors } from '../../events.selectors';

@Component({
  selector: 'app-events-core-map',
  templateUrl: './events-core-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsCoreMapComponent {
  accessGroup = AccessGroup;
  event$ = this.store.select(EventsSelectors.event);

  constructor(private readonly store: Store<AppState>, private readonly router: Router) {}

  handleViewLiveClick(event: Event): void {
    this.router.navigate(['/', RouteConst.stream, event.vehicle_id]);
  }
}
