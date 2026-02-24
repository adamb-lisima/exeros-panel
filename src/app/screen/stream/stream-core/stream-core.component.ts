import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, map, Subject, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapCoordinates } from 'src/app/model/map.model';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { AppState } from 'src/app/store/app-store.model';
import MapUtil from 'src/app/util/map';
import { AccessGroup } from '../../settings/settings.model';
import { StreamService } from '../stream.service';

@Component({
  templateUrl: './stream-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamCoreComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'h-full';
  @ViewChild(MatSelect) matSelect!: MatSelect;
  private readonly destroy$ = new Subject<void>();
  map!: google.maps.Map;
  markers$ = this.store.select(StreamSelectors.mapVehicles).pipe(map(vehicles => vehicles.map(vehicle => MapUtil.mapVehicleToMapMarkerData(vehicle))));
  center: MapCoordinates = [54.7029041, -4.3958726];

  accessGroup = AccessGroup;

  private searchMarker: google.maps.Marker | null = null;

  value: any = null;
  search: string = '';
  tempOptions: { display_name: string; latitude: string; longitude: string }[] = [];
  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(search => this.streamService.searchLocation(search)),
        takeUntil(this.destroy$)
      )
      .subscribe(results => {
        if (results?.data) {
          this.tempOptions = results.data.map((item: any) => ({
            display_name: item.display_name,
            latitude: item.latitude,
            longitude: item.longitude
          }));
        } else {
          this.tempOptions = [];
        }
        this.forceOpenDropdown();
      });

    // this.store.dispatch(StreamActions.setLastVisitedTab({ route: RouteConst.stream }));
  }

  handleModelChange(value: any) {
    this.value = value;

    const selectedOption = this.tempOptions.find(option => option.display_name === value);

    if (selectedOption) {
      const coordinates: MapCoordinates = [selectedOption.latitude, selectedOption.longitude];
      const latLng = MapUtil.mapToLatLng(coordinates);
      if (latLng) {
        if (this.searchMarker) {
          this.searchMarker.setMap(null);
        }

        this.map.setCenter(latLng);

        this.searchMarker = new google.maps.Marker({
          position: latLng,
          map: this.map,
          title: selectedOption.display_name
        });

        this.smoothZoom(this.map, 15);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleClearClick(event: MouseEvent): void {
    if (this.searchMarker) {
      this.searchMarker.setMap(null);
      this.searchMarker = null;
    }

    if (this.map) {
      this.smoothZoom(this.map, 6);

      const defaultCenter = MapUtil.mapToLatLng(this.center);
      if (defaultCenter) {
        this.map.setCenter(defaultCenter);
      }
    }

    this.value = null;
    this.search = '';
    this.tempOptions = [];
    this.handleModelChange('');

    event.stopPropagation();
  }

  handleSearchChange(searchValue: string) {
    this.search = searchValue;
    this.searchSubject.next(searchValue);
  }

  forceOpenDropdown() {
    if (this.matSelect) {
      setTimeout(() => this.matSelect.open(), 0);
    }
  }

  trackByValue(index: number, option: any) {
    return option.latitude + ',' + option.longitude;
  }

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
  currentMapType: string = 'terrain';

  toggleMapType(): void {
    if (this.map) {
      const newType = this.currentMapType === 'satellite' ? 'terrain' : 'satellite';
      this.currentMapType = newType;
      this.map.setMapTypeId(newType);
    }
  }

  constructor(private readonly store: Store<AppState>, private readonly streamService: StreamService) {}
}
