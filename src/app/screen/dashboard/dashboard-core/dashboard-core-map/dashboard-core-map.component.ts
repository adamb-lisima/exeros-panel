import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import MapUtil from 'src/app/util/map';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { DashboardSelectors } from '../../dashboard.selectors';

@Component({
  selector: 'app-dashboard-core-map',
  templateUrl: './dashboard-core-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCoreMapComponent {
  map!: google.maps.Map;
  searchControl = this.fb.control('');
  markers$ = combineLatest([this.searchControl.valueChanges.pipe(distinctUntilChanged(), startWith('')), this.store.select(CommonObjectsSelectors.updatedMapVehicles), this.store.select(DashboardSelectors.fleetId)]).pipe(
    debounceTime(250),
    map(([search, vehicles, fleetId]) => {
      const isSearch = search && search?.trim() != '';
      const markers = vehicles.filter(vehicle => (search ? vehicle.registration_plate.includes(search.toUpperCase()) : true)).map(vehicle => MapUtil.mapVehicleToMapMarkerData(vehicle));

      if (isSearch) {
        const coordinates = markers.find(marker => marker.coordinates.length > 0)?.coordinates;
        const latLng = MapUtil.mapToLatLng(coordinates);
        if (latLng) {
          this.map.setCenter(latLng);
          this.smoothZoom(this.map, 15);
        }
      }

      return markers;
    })
  );

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {}

  onMapReady(map: google.maps.Map) {
    this.map = map;
  }

  smoothZoom(map: google.maps.Map, targetZoom: number, zoom?: number) {
    const currentZoom = zoom || map.getZoom();
    if (currentZoom && currentZoom != targetZoom) {
      google.maps.event.addListenerOnce(map, 'zoom_changed', () => {
        this.smoothZoom(map, targetZoom, currentZoom + (targetZoom > currentZoom ? 1 : -1));
      });
      setTimeout(() => map.setZoom(currentZoom), 100);
    }
  }
}
