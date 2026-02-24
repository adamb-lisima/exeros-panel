import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { MapMarkerData } from 'src/app/model/map.model';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';

@Component({
  selector: 'app-stream-left-live-feed-map',
  templateUrl: './stream-left-live-feed-map.component.html'
})
export class StreamLeftLiveFeedMapComponent {
  liveFeed$ = this.store.select(StreamSelectors.updatedLiveFeed);
  markers$ = this.store.select(StreamSelectors.updatedLiveFeed).pipe(map((liveFeed): MapMarkerData[] => (liveFeed ? [{ id: liveFeed.id, coordinates: liveFeed.gps_position, direction: liveFeed.direction, type: 'navigation' }] : [])));

  constructor(private readonly store: Store) {}
}
