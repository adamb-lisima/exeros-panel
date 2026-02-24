import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, first, map, Subject, Subscription, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import RouteConst from '../../../const/route';
import { MapCoordinates } from '../../../model/map.model';
import { MapComponent } from '../../../shared/component/map/map.component';
import { AppState } from '../../../store/app-store.model';
import { CommonObjectsActions } from '../../../store/common-objects/common-objects.actions';
import { MapVehiclesParams, PolygonPoints } from '../../../store/common-objects/common-objects.model';
import { CommonObjectsSelectors } from '../../../store/common-objects/common-objects.selectors';
import MapUtil from '../../../util/map';
import { AccessGroup } from '../../settings/settings.model';
import { StreamActions } from '../../stream/stream.actions';
import { MapVehiclesElement } from '../../stream/stream.model';
import { StreamSelectors } from '../../stream/stream.selectors';
import { StreamService } from '../../stream/stream.service';
import { VehiclesSelectors } from '../../vehicles/vehicles.selectors';

@Component({
  selector: 'app-map-view-core',
  templateUrl: './map-view-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewCoreComponent implements OnInit, OnDestroy {
  @ViewChild(MatSelect) matSelect!: MatSelect;
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  map!: google.maps.Map;
  markers$ = this.store.select(CommonObjectsSelectors.updatedMapVehicles).pipe(map(vehicles => vehicles.map(vehicle => MapUtil.mapVehicleToMapMarkerData(vehicle))));
  center: MapCoordinates = [54.7029041, -4.3958726];
  isDrawingEnabled = false;
  isPolygonDraw = false;
  public drawnShapes: google.maps.MVCObject[] = [];
  activePolygon: google.maps.Polygon | null = null;
  private firstLoad = true;

  accessGroup = AccessGroup;

  private readonly mapDateTime$ = this.store.select(StreamSelectors.mapTimeRange);
  private currentTimeRange: { from: string | null; to: string | null } = { from: null, to: null };

  isFilterActive = false;
  private vehiclesSub?: Subscription;
  private mapVehiclesSub?: Subscription;
  private allVehicles: MapVehiclesElement[] = [];

  private initialLoadComplete = false;

  private mapFilterParams$ = this.store.select(StreamSelectors.mapFilterParams);
  private currentFilterParams: Partial<MapVehiclesParams> = {};

  private searchMarker: google.maps.Marker | null = null;
  private readonly destroy$ = new Subject<void>();

  vehicle$ = this.store.select(VehiclesSelectors.vehicle);
  private readonly sub?: Subscription;

  ngOnInit(): void {
    this.mapDateTime$.pipe(takeUntil(this.destroy$)).subscribe(timeRange => {
      this.currentTimeRange = timeRange;
      if (this.isFilterActive && this.activePolygon) {
        this.filterVehiclesByPolygon();
      }
    });

    this.store
      .select(StreamSelectors.selectedId)
      .pipe(
        first(selectedId => !selectedId),
        switchMap(() => this.store.select(StreamSelectors.vehicles)),
        first(vehicles => vehicles.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.mapFilterParams$.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.currentFilterParams = params;

      if (this.isFilterActive && this.activePolygon) {
        this.filterVehiclesByPolygon();
      }
    });

    this.store
      .select(CommonObjectsSelectors.mapVehicles)
      .pipe(
        first(vehicles => vehicles.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(vehicles => {
        this.initialLoadComplete = true;
        this.allVehicles = vehicles;

        this.store.dispatch(CommonObjectsActions.setUpdatedMapVehicles({ data: vehicles }));
      });

    this.store
      .select(CommonObjectsSelectors.mapVehicles)
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(vehicles => {
        if (!this.initialLoadComplete) return;

        this.allVehicles = vehicles;

        this.store.dispatch(CommonObjectsActions.setUpdatedMapVehicles({ data: vehicles }));
      });

    this.store
      .select(StreamSelectors.mapFilterParams)
      .pipe(first(), takeUntil(this.destroy$))
      .subscribe(initialFilterParams => {
        this.currentFilterParams = initialFilterParams;

        if (initialFilterParams.fleet_id && !this.initialLoadComplete) {
          const params: any = {
            fleet_id: initialFilterParams.fleet_id
          };

          if (!this.firstLoad) {
            this.store
              .select(StreamSelectors.mapTimeRange)
              .pipe(first(), takeUntil(this.destroy$))
              .subscribe(dateTime => {
                if (dateTime) {
                  params.date_time = dateTime;
                }
                this.store.dispatch(
                  CommonObjectsActions.fetchMapVehicles({
                    params: params
                  })
                );
              });
          } else {
            this.firstLoad = false;
            this.store.dispatch(
              CommonObjectsActions.fetchMapVehicles({
                params: params
              })
            );
          }
        }
      });

    this.store
      .select(StreamSelectors.mapFilterParams)
      .pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev.polygon) === JSON.stringify(curr.polygon)),
        takeUntil(this.destroy$)
      )
      .subscribe(params => {
        if (params.polygon && Array.isArray(params.polygon) && params.polygon.length > 0) {
          this.restorePolygonFromStore(params.polygon);
        }
      });

    this.actions$.pipe(ofType(StreamActions.setMapLocation), takeUntil(this.destroy$)).subscribe(action => {
      if (this.map) {
        const { latitude, longitude, displayName, zoom } = action.location;
        const latLng = new google.maps.LatLng(latitude, longitude);

        if (this.searchMarker) {
          this.searchMarker.setMap(null);
        }

        this.map.setCenter(latLng);

        this.searchMarker = new google.maps.Marker({
          position: latLng,
          map: this.map,
          title: displayName
        });

        this.smoothZoom(this.map, zoom);
        this.cdr.markForCheck();
      }
    });

    this.actions$.pipe(ofType(StreamActions.resetMapLocation), takeUntil(this.destroy$)).subscribe(() => {
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
      this.cdr.markForCheck();
    });

    this.actions$.pipe(ofType(StreamActions.focusMapOnVehicle), takeUntil(this.destroy$)).subscribe(action => {
      if (this.map) {
        const { coordinates, zoom } = action;

        const latLng = new google.maps.LatLng(Number(coordinates[0]), Number(coordinates[1]));

        this.map.setCenter(latLng);
        this.smoothZoom(this.map, zoom);
        this.cdr.markForCheck();
      }
    });

    this.store.dispatch(StreamActions.setLastVisitedTab({ route: RouteConst.mapView }));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.vehiclesSub?.unsubscribe();
    this.mapVehiclesSub?.unsubscribe();
  }

  onMapReady(map: google.maps.Map) {
    this.map = map;
  }

  onShapeComplete(event: google.maps.drawing.OverlayCompleteEvent) {
    const shape = event.overlay;
    const type = event.type;

    if (type === google.maps.drawing.OverlayType.POLYGON) {
      if (this.activePolygon) {
        this.activePolygon.setMap(null);
      }
      this.drawnShapes.forEach(shape => {
        if (shape && 'setMap' in shape) {
          (shape as any).setMap(null);
        }
      });
      this.drawnShapes = [];

      const polygon = shape as google.maps.Polygon;

      if (this.map) {
        polygon.setMap(this.map);
      }

      this.activePolygon = polygon;
      this.drawnShapes.push(polygon);

      const polygonPath = polygon.getPath();
      const points: PolygonPoints[] = [];

      for (let i = 0; i < polygonPath.getLength(); i++) {
        const point = polygonPath.getAt(i);
        points.push({
          lat: point.lat(),
          lng: point.lng()
        });
      }

      if (points.length > 0) {
        const firstPoint = points[0];
        if (points.length < 3 || points[0].lat !== points[points.length - 1].lat || points[0].lng !== points[points.length - 1].lng) {
          points.push({ ...firstPoint });
        }
      }

      this.store.dispatch(StreamActions.setMapPolygon({ polygon: points }));
      this.isPolygonDraw = true;
      this.filterVehiclesByPolygon();
    }
  }

  filterVehiclesByPolygon() {
    if (!this.activePolygon) {
      return;
    }

    this.isFilterActive = true;

    const polygonPath = this.activePolygon.getPath();
    const points: PolygonPoints[] = [];

    for (let i = 0; i < polygonPath.getLength(); i++) {
      const point = polygonPath.getAt(i);
      points.push({
        lat: point.lat(),
        lng: point.lng()
      });
    }

    if (points.length > 0) {
      const firstPoint = points[0];
      if (points.length < 3 || points[0].lat !== points[points.length - 1].lat || points[0].lng !== points[points.length - 1].lng) {
        points.push({ ...firstPoint });
      }
    }

    const params: any = {
      polygon: points
    };

    params.fleet_id = this.currentFilterParams.fleet_id ?? undefined;

    if (this.currentFilterParams.vehicle_id !== undefined) {
      params.vehicle_id = this.currentFilterParams.vehicle_id;
    }

    if (this.currentFilterParams.driver_id !== undefined) {
      params.driver_id = this.currentFilterParams.driver_id;
    }

    if (this.currentTimeRange.from && this.currentTimeRange.to) {
      params.from = this.currentTimeRange.from;
      params.to = this.currentTimeRange.to;
    }

    const serializedParams = {
      ...params,
      polygon: JSON.stringify(params.polygon)
    };

    this.store.dispatch(CommonObjectsActions.fetchMapVehicles({ params: serializedParams }));

    this.cdr.markForCheck();
  }

  toggleDrawing() {
    this.isDrawingEnabled = !this.isDrawingEnabled;

    if (this.mapComponent) {
      this.mapComponent.toggleDrawingTools(this.isDrawingEnabled, {
        strokeColor: '#EE8444',
        strokeWeight: 3,
        strokeOpacity: 1.0,
        fillColor: '#EE8444',
        fillOpacity: 0.2
      });
    }

    this.cdr.markForCheck();
  }

  private ensureShapesRemoved() {
    if (this.mapComponent) {
      this.mapComponent.clearShapes();
    }

    if (this.activePolygon) {
      this.activePolygon.setMap(null);
      this.activePolygon = null;
    }

    this.drawnShapes.forEach(shape => {
      if (shape && 'setMap' in shape) {
        (shape as any).setMap(null);
      }
    });
    this.drawnShapes = [];
  }

  clearDrawings() {
    this.ensureShapesRemoved();

    this.store.dispatch(StreamActions.setMapPolygon({ polygon: undefined }));

    this.isFilterActive = false;

    const params: any = { ...this.currentFilterParams };

    if (this.currentTimeRange.from && this.currentTimeRange.to) {
      params.from = this.currentTimeRange.from;
      params.to = this.currentTimeRange.to;
    }

    delete params.polygon;

    this.store.dispatch(
      CommonObjectsActions.fetchMapVehicles({
        params: params
      })
    );

    if (this.allVehicles.length > 0) {
      this.store.dispatch(
        CommonObjectsActions.setUpdatedMapVehicles({
          data: this.allVehicles
        })
      );
    }

    this.isPolygonDraw = false;

    this.cdr.markForCheck();
  }

  private restorePolygonFromStore(polygonPoints: PolygonPoints[]) {
    if (this.activePolygon) {
      this.activePolygon.setMap(null);
      this.activePolygon = null;
    }

    if (polygonPoints && polygonPoints.length > 0) {
      const polygonPath = polygonPoints.map(point => new google.maps.LatLng(point.lat, point.lng));

      const polygon = new google.maps.Polygon({
        paths: polygonPath,
        strokeColor: '#EE8444',
        strokeWeight: 3,
        strokeOpacity: 1.0,
        fillColor: '#EE8444',
        fillOpacity: 0.2,
        map: this.map
      });

      this.activePolygon = polygon;
      this.drawnShapes.push(polygon);
      this.isFilterActive = true;
    }
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

  toggleMapType(): void {
    if (this.mapComponent) {
      this.mapComponent.toggleTerrainSatellite();
    }
  }

  constructor(private readonly store: Store<AppState>, private readonly streamService: StreamService, private readonly cdr: ChangeDetectorRef, private readonly router: Router, private readonly actions$: Actions) {}
}
