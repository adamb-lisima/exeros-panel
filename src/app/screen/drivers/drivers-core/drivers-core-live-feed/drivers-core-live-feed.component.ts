import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { MapMarkerData } from '../../../../model/map.model';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-live-feed',
  templateUrl: './drivers-core-live-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreLiveFeedComponent {
  liveFeedLoading$ = this.store.select(DriversSelectors.liveFeedLoading);
  liveFeed$ = this.store.select(DriversSelectors.updatedLiveFeed);
  markers$ = this.store.select(DriversSelectors.updatedLiveFeed).pipe(map((liveFeed): MapMarkerData[] => (liveFeed ? [{ id: liveFeed.id, coordinates: liveFeed.gps_position, direction: liveFeed.direction, type: 'navigation' }] : [])));

  constructor(private readonly store: Store) {}
}
