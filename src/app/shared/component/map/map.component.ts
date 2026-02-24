import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker, MarkerClustererOptions } from '@angular/google-maps';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapCoordinates, MapMarkerData } from 'src/app/model/map.model';
import { ThemeService } from 'src/app/service/theme/theme.service';
import ColorUtil from 'src/app/util/color';
import DateConst from '../../../const/date';
import RouteConst from '../../../const/route';

type DrawnShape = google.maps.Marker | google.maps.Polygon | google.maps.Polyline | google.maps.Rectangle | google.maps.Circle;

export interface Marker {
  id?: string | number;
  vehicleId?: number;
  position?: google.maps.LatLngLiteral;
  icon: google.maps.Symbol | google.maps.Icon;
  infoWindow?: string;
  onClick?: () => void;
}

interface RouteSegment {
  path: google.maps.LatLngLiteral[];
  startTime: string;
  endTime: string;
  index: number;
}

const CENTER: google.maps.LatLngLiteral = { lat: 54.163489945975, lng: -3.501881062499992 };
const WHITE_MAP_TYPE_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }
];
const DARK_MAP_TYPE_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] }
];

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host ::ng-deep .gm-fullscreen-control {
        display: none !important;
      }
      :host ::ng-deep :fullscreen .gm-fullscreen-control {
        display: block !important;
      }
    `
  ]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  drawingManager!: google.maps.drawing.DrawingManager;

  @Input() drawingEnabled = false;
  @Input() drawingMode: google.maps.drawing.OverlayType | null = null;
  @Output() shapeComplete = new EventEmitter<google.maps.drawing.OverlayCompleteEvent>();

  readonly mapOptions: google.maps.MapOptions = {
    streetViewControl: false,
    mapTypeId: 'terrain',
    mapTypeControl: true,
    rotateControl: false,
    keyboardShortcuts: false,
    fullscreenControl: false,
    styles: this.themeService.currentTheme === 'default' ? WHITE_MAP_TYPE_STYLE : DARK_MAP_TYPE_STYLE
  };

  currentMapType: string = 'terrain';

  @ViewChild('googleMap') googleMap!: GoogleMap;
  public drawnShapes: DrawnShape[] = [];

  private readonly destroy$ = new Subject<void>();
  private mapInitializedSubscription?: Subscription;

  readonly markerClustererOptions: MarkerClustererOptions = {
    imagePath: 'assets/map/m',
    gridSize: 60,
    maxZoom: 15,
    minimumClusterSize: 3,
    zoomOnClick: true,
    averageCenter: true,
    ignoreHidden: true
  };

  readonly polylineOptions: google.maps.PolylineOptions = {
    strokeColor: ColorUtil.get('--info-500'),
    strokeWeight: 3,
    strokeOpacity: 0.7,
    zIndex: 1
  };

  readonly segmentPolylineOptions: google.maps.PolylineOptions = {
    strokeColor: ColorUtil.get('--info-500'),
    strokeWeight: 3,
    strokeOpacity: 0.7,
    clickable: true,
    zIndex: 2
  };

  readonly activeSegmentPolylineOptions: google.maps.PolylineOptions = {
    strokeColor: ColorUtil.get('--brand-500'),
    strokeWeight: 4,
    strokeOpacity: 1,
    zIndex: 3
  };

  _center: google.maps.LatLngLiteral = CENTER;
  _polyline: google.maps.LatLngLiteral[] = [];
  _markers: Marker[] = [];
  _segments: RouteSegment[] = [];
  activeSegmentId: number | null = null;
  segmentInfoWindow: google.maps.InfoWindow;

  private map?: google.maps.Map;

  @Output() mapReady = new EventEmitter<google.maps.Map>();
  @Output() segmentClick = new EventEmitter<RouteSegment>();
  @Output() markerClicked = new EventEmitter<Marker>();

  @Input() zoom = 7;
  @Input() rounded = false;
  @Input() isClusterer = true;

  @Input() set routeSegments(v: RouteSegment[] | undefined | null) {
    this._segments = v ?? [];
  }

  @Input() set center(v: MapCoordinates | undefined | null) {
    this._center = this.mapToLatLng(v) ?? CENTER;
  }

  @Input() set polyline(v: MapCoordinates[] | undefined | null) {
    this._polyline = v?.map(coordinates => this.mapToLatLng(coordinates)).filter((latLng): latLng is google.maps.LatLngLiteral => !!latLng) ?? [];
  }

  @Input() set markers(v: MapMarkerData[] | undefined | null) {
    this._markers =
      v?.map(marker => ({
        id: marker.id,
        vehicleId: marker.vehicleId,
        position: this.mapToLatLng(marker.coordinates),
        icon: this.markerIcon(marker),
        infoWindow: marker.infoWindow,
        onClick: marker.onClick
      })) ?? [];
  }

  @Input() set eventMarkers(v: MapMarkerData[] | undefined | null) {
    this._markers =
      v?.map(marker => ({
        id: marker.id,
        position: this.mapToLatLng(marker.coordinates),
        icon: this.markerEventsIcon(marker),
        infoWindow: marker.infoWindow,
        onClick: marker.onClick
      })) ?? [];
  }

  @Input() set playbackMarkers(v: MapMarkerData[] | undefined | null) {
    this._markers =
      v?.map(marker => ({
        id: marker.id,
        position: this.mapToLatLng(marker.coordinates),
        icon: this.markerPlaybackIcon(marker),
        infoWindow: marker.infoWindow,
        onClick: marker.onClick
      })) ?? [];
  }

  constructor(private readonly themeService: ThemeService, private readonly ngZone: NgZone, private readonly router: Router) {
    this.segmentInfoWindow = new google.maps.InfoWindow({
      disableAutoPan: true,
      pixelOffset: new google.maps.Size(0, -10),
      content: `          <style>
            .gm-style .gm-style-iw-t::after { display: none; }
            .gm-style-iw-d { overflow: hidden !important; }
            .gm-style-iw { padding: 0 !important; }
            .gm-ui-hover-effect { display: none !important; }
          </style>
        `
    });
  }

  getSegmentOptions(segment: RouteSegment): google.maps.PolylineOptions {
    return segment.index === this.activeSegmentId ? this.activeSegmentPolylineOptions : this.segmentPolylineOptions;
  }

  handleSegmentMouseover(event: google.maps.PolyMouseEvent, segment: RouteSegment) {
    if (!event.latLng) return;

    this.activeSegmentId = segment.index;

    const startTime = DateTime.fromFormat(segment.startTime, DateConst.serverDateTimeFormat);

    const content = `
      <div class="px-3 py-2 bg-white rounded shadow-md">
        <span class="text-sm text-neutral-600">${startTime.toFormat('HH:mm:ss')}</span>
      </div>
    `;

    this.segmentInfoWindow.setContent(content);
    this.segmentInfoWindow.setPosition(event.latLng);

    if (this.map) {
      this.segmentInfoWindow.open(this.map);
    }
  }

  handleSegmentMouseout(segment: RouteSegment) {
    this.activeSegmentId = null;
    this.segmentInfoWindow.close();
  }

  handleSegmentClick(event: google.maps.PolyMouseEvent, segment: RouteSegment) {
    this.segmentClick.emit(segment);
  }

  trackBySegmentId(index: number, segment: RouteSegment): number {
    return segment.index;
  }

  handleMarkerClick(marker: Marker) {
    this.markerClicked.emit(marker);
    if (!this.markerClicked.observed) {
      if (marker.vehicleId) {
        this.router.navigate(['/', RouteConst.stream, marker.vehicleId]);
      }
    }
    marker.onClick?.();
  }

  onReady(event: google.maps.Map): void {
    if (window.google) {
      if (window.google.maps) {
        if (window.google.maps.drawing) {
        }
      }
    }
    this.map = event;
    this.mapReady.emit(event);

    if (this.drawingEnabled) {
      this.initDrawingManager();
    }
  }

  private markerIcon(marker: MapMarkerData): google.maps.Symbol | google.maps.Icon {
    switch (marker.type) {
      case 'navigation':
        return {
          path: 'M11.981 15.2891L15.9656 1.33057C16.1648 0.532938 15.4675 -0.164989 14.6706 0.0344188L0.724291 4.02257C-0.172257 4.32169 -0.271874 5.51813 0.624675 5.91695L7.19936 8.70866L9.98862 15.2891C10.4867 16.2862 11.6821 16.1865 11.981 15.2891Z',
          anchor: new google.maps.Point(8, 8),
          fillOpacity: 1,
          scale: 1.3,
          rotation: (marker.direction ?? 0) - 45,
          fillColor: ColorUtil.get(marker.fillColorVariable ?? '--brand-500'),
          strokeColor: ColorUtil.get(marker.strokeColorVariable ?? '--brand-500')
        };
      case 'start':
        return { url: 'assets/svg/map-start-icon.svg', anchor: new google.maps.Point(46.5, 47) };
      case 'event':
        return {
          url: marker.icon ?? 'assets/svg/event-icon.svg',
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 18)
        };
      case 'end':
        return { url: 'assets/svg/map-end-icon.svg', anchor: new google.maps.Point(52, 41) };
    }
  }

  private markerEventsIcon(marker: MapMarkerData): google.maps.Symbol | google.maps.Icon {
    switch (marker.type) {
      case 'navigation':
        return {
          path: 'M11.981 15.2891L15.9656 1.33057C16.1648 0.532938 15.4675 -0.164989 14.6706 0.0344188L0.724291 4.02257C-0.172257 4.32169 -0.271874 5.51813 0.624675 5.91695L7.19936 8.70866L9.98862 15.2891C10.4867 16.2862 11.6821 16.1865 11.981 15.2891Z',
          anchor: new google.maps.Point(8, 8),
          fillOpacity: 1,
          scale: 1.3,
          rotation: (marker.direction ?? 0) - 45,
          fillColor: ColorUtil.get(marker.fillColorVariable ?? '--brand-500'),
          strokeColor: ColorUtil.get(marker.strokeColorVariable ?? '--brand-500')
        };
      case 'start':
        return { url: 'assets/svg/map-start-icon.svg', anchor: new google.maps.Point(46.5, 47) };
      case 'event':
        return {
          url: marker.icon ?? 'assets/svg/event-icon-1.svg',
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 18)
        };
      case 'end':
        return { url: 'assets/svg/map-end-icon.svg', anchor: new google.maps.Point(52, 41) };
    }
  }

  private markerPlaybackIcon(marker: MapMarkerData): google.maps.Symbol | google.maps.Icon {
    switch (marker.type) {
      case 'navigation':
        return {
          path: 'M11.981 15.2891L15.9656 1.33057C16.1648 0.532938 15.4675 -0.164989 14.6706 0.0344188L0.724291 4.02257C-0.172257 4.32169 -0.271874 5.51813 0.624675 5.91695L7.19936 8.70866L9.98862 15.2891C10.4867 16.2862 11.6821 16.1865 11.981 15.2891Z',
          anchor: new google.maps.Point(8, 8),
          fillOpacity: 1,
          scale: 1.3,
          rotation: (marker.direction ?? 0) - 45,
          fillColor: '#FADC0F',
          strokeColor: '#000000'
        };
      case 'start':
        return { url: 'assets/svg/playback-start-icon.svg', anchor: new google.maps.Point(16, 16) };
      case 'event':
        return {
          url: marker.icon ?? 'assets/svg/event-icon.svg',
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 18)
        };
      case 'end':
        return { url: 'assets/svg/playback-end-icon.svg', anchor: new google.maps.Point(16, 16) };
    }
  }

  private mapToLatLng(coordinates: MapCoordinates | undefined | null): google.maps.LatLngLiteral | undefined {
    const [lat, lng] = coordinates || [];
    return lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng)) ? undefined : { lat: Number(lat), lng: Number(lng) };
  }

  handleMarkerMouseover(marker: Marker, markerElement: MapMarker, infoWindow: MapInfoWindow) {
    if (marker.infoWindow) {
      infoWindow.open(markerElement);
    }
  }

  handleMarkerMouseout(marker: Marker, infoWindow: MapInfoWindow) {
    if (marker.infoWindow) {
      infoWindow.close();
    }
  }

  getMap(): google.maps.Map | undefined {
    return this.map;
  }

  ngAfterViewInit() {
    if (this.googleMap) {
      this.mapInitializedSubscription = this.googleMap.mapInitialized.pipe(takeUntil(this.destroy$)).subscribe({
        next: (map: google.maps.Map) => {
          setTimeout(() => {
            if (this.isDrawingLibraryLoaded()) {
              if (this.drawingEnabled && !this.drawingManager) {
                this.initDrawingManager();
              }
            } else {
            }

            const fullscreenControl = document.querySelector('.gm-fullscreen-control') as HTMLElement;
            if (fullscreenControl) {
              fullscreenControl.addEventListener('click', () => {
                this.ngZone.run(() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(err => {});
                  }
                });
              });
            }
          }, 1000);
        },
        error: (err: unknown) => console.error('Error initializing map:', err)
      });
    }
  }

  initDrawingManager(polygonOptions?: { strokeColor?: string; strokeWeight?: number; strokeOpacity?: number; fillColor?: string; fillOpacity?: number }) {
    if (!this.map) {
      return;
    }

    try {
      if (!window.google || !window.google.maps || !window.google.maps.drawing) {
        return;
      }

      const defaultPolygonOptions = {
        strokeColor: '#FF0000',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#FF0000',
        fillOpacity: 0.35
      };

      const mergedPolygonOptions = {
        ...defaultPolygonOptions,
        ...polygonOptions
      };

      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON]
        },
        polygonOptions: mergedPolygonOptions
      });

      this.drawingManager.setMap(this.map);

      google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
        this.ngZone.run(() => {
          if (event.overlay) {
            this.drawnShapes.push(event.overlay);
          }
          this.shapeComplete.emit(event);
        });
      });

      google.maps.event.addListener(this.drawingManager, 'drawingmode_changed', () => {});
    } catch (error) {}
  }

  setDrawingMode(mode: google.maps.drawing.OverlayType | null) {
    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(mode);
    }
  }

  async toggleDrawingTools(
    enabled: boolean,
    polygonOptions?: {
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
      fillColor?: string;
      fillOpacity?: number;
    }
  ) {
    if (!this.isDrawingLibraryLoaded()) {
      try {
        await this.loadDrawingLibrary();
      } catch (error) {
        return;
      }
    }

    if (this.map) {
      if (this.drawingManager) {
        this.drawingManager.setMap(null);
        this.drawingManager = null!;
      }

      if (enabled) {
        this.initDrawingManager(polygonOptions);
      }
    }
  }

  loadDrawingLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isDrawingLibraryLoaded()) {
        resolve();
        return;
      }

      const gMapsScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (!gMapsScript) {
        reject(new Error('Google Maps script not found'));
        return;
      }

      const scriptSrc = gMapsScript.getAttribute('src') ?? '';
      const matches = scriptSrc.match(/key=([^&]*)/);
      const apiKey = matches ? matches[1] : '';

      if (!apiKey) {
        reject(new Error('API key not found in Google Maps script'));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing&callback=initDrawingLibraryCallback`;
      script.async = true;
      script.defer = true;

      (window as any).initDrawingLibraryCallback = () => {
        resolve();
      };

      script.onerror = err => {
        reject(new Error('Failed to load drawing library'));
      };

      document.head.appendChild(script);
    });
  }

  isDrawingLibraryLoaded(): boolean {
    const isLoaded = !!(window.google && window.google.maps && window.google.maps.drawing);

    if (window.google) {
      if (window.google.maps) {
        if (window.google.maps.drawing) {
        }
      }
    }

    return isLoaded;
  }

  clearShapes() {
    this.drawnShapes.forEach(shape => {
      if ('setMap' in shape) {
        (shape as any).setMap(null);
      }
    });

    this.drawnShapes = [];
  }

  switchMapType(mapType: string): void {
    if (!this.map) return;

    if (['terrain', 'satellite'].includes(mapType)) {
      this.currentMapType = mapType;
      this.map.setMapTypeId(mapType);
    }
  }

  toggleTerrainSatellite(): void {
    const newType = this.currentMapType === 'satellite' ? 'terrain' : 'satellite';
    this.switchMapType(newType);
  }

  ngOnDestroy(): void {
    if (this.mapInitializedSubscription) {
      this.mapInitializedSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
