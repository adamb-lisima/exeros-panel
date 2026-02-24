import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import MapUtil from '../../../../util/map';
import { EventTrendsChart } from '../../fleets.model';
import { FleetsSelectors } from '../../fleets.selectors';

@Component({
  selector: 'app-fleets-map',
  templateUrl: './fleets-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsMapComponent {
  totalLOcations$: Observable<EventTrendsChart | undefined> = this.store.select(FleetsSelectors.eventTrendsChart);
  map!: google.maps.Map;
  searchControl = this.fb.control('');
  markers$ = this.store.select(FleetsSelectors.eventTrendsChart).pipe(
    map(eventTrendsChart => {
      const eventLocations = eventTrendsChart?.event_locations ?? [];
      return eventLocations.filter(location => location.lat !== null && location.lon !== null).map(location => MapUtil.mapEventLocationToMapMarkerData(location));
    })
  );

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {}

  onMapReady(map: google.maps.Map) {
    this.map = map;
  }

  smoothZoom(map: google.maps.Map, targetZoom: number, zoom?: number) {
    const currentZoom = zoom ?? map.getZoom();
    if (currentZoom && currentZoom != targetZoom) {
      google.maps.event.addListenerOnce(map, 'zoom_changed', () => {
        this.smoothZoom(map, targetZoom, currentZoom + (targetZoom > currentZoom ? 1 : -1));
      });
      setTimeout(() => map.setZoom(currentZoom), 100);
    }
  }
}
