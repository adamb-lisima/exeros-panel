import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { MapMarkerData } from '../../../../model/map.model';
import { VehiclesSelectors } from '../../vehicles.selectors';

@Component({
  selector: 'app-vehicles-core-live-feed',
  templateUrl: './vehicles-core-live-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreLiveFeedComponent {
  liveFeedLoading$ = this.store.select(VehiclesSelectors.liveFeedLoading);
  liveFeed$ = this.store.select(VehiclesSelectors.updatedLiveFeed);
  markers$ = this.store.select(VehiclesSelectors.updatedLiveFeed).pipe(map((liveFeed): MapMarkerData[] => (liveFeed ? [{ id: liveFeed.id, coordinates: liveFeed.gps_position, direction: liveFeed.direction, type: 'navigation' }] : [])));

  constructor(private readonly store: Store) {}
}
