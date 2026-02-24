import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { MarkerClustererOptions } from '@googlemaps/markerclustererplus';
import { DateTime } from 'luxon';
import DateConst from 'src/app/const/date';
import { MapCoordinates, MapMarkerData } from 'src/app/model/map.model';
import ColorUtil from 'src/app/util/color';
import { ThemeService } from '../../../../../service/theme/theme.service';
import { Event as EventModel } from '../../../events.model';

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

interface PolylineSegment {
  path: google.maps.LatLngLiteral[];
  strokeColor: string;
}

@Component({
  selector: 'app-events-map',
  templateUrl: './events-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsMapComponent implements OnChanges {
  zoom = 15;
  rounded = true;
  isClusterer = false;

  _polylineSegments: PolylineSegment[] = [];

  @ViewChild(GoogleMap) map!: GoogleMap;

  readonly mapOptions: google.maps.MapOptions = {
    streetViewControl: false,
    mapTypeId: 'terrain',
    mapTypeControl: true,
    rotateControl: false,
    keyboardShortcuts: false,
    styles: this.themeService.currentTheme === 'default' ? WHITE_MAP_TYPE_STYLE : DARK_MAP_TYPE_STYLE
  };

  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: ColorUtil.get('--extra-three')
  };

  markerClustererOptions: MarkerClustererOptions = {
    imagePath: 'assets/map/m',
    gridSize: 40,
    maxZoom: 20,
    ignoreHidden: true
  };

  _center: google.maps.LatLngLiteral = { lat: 54.163489945975, lng: -3.501881062499992 };
  _markers: MapMarkerData[] = [];
  _polyline: google.maps.LatLngLiteral[] = [];

  @Input() set videoCurrentTime(value: DateTime | null | undefined) {
    this._videoCurrentTime = value ?? null;
    if (this._event) {
      this.updateMapData(this._event, value ?? null);
    }
  }

  @Input() set event(value: EventModel | null) {
    if (value) {
      this._event = value;
      if (this._videoCurrentTime) {
        this.updateMapData(value, this._videoCurrentTime);
      }
    }
  }

  private _event: EventModel | null = null;
  private _videoCurrentTime: DateTime | null = null;

  @Output() mapReady = new EventEmitter<google.maps.Map>();

  private readonly currentEvent: EventModel | null = null;
  private readonly currentVideoTime: DateTime | null = null;

  onReady(map: google.maps.Map): void {
    this.mapReady.emit(map);
  }

  handleMarkerClick(marker: MapMarkerData): void {
    marker.onClick?.();
  }

  handleMarkerMouseover(marker: MapMarkerData, markerElement: any, infoWindow: any): void {
    if (marker.infoWindow) {
      infoWindow.open(markerElement);
    }
  }

  handleMarkerMouseout(marker: MapMarkerData, infoWindow: any): void {
    if (marker.infoWindow) {
      infoWindow.close();
    }
  }

  markerIcon(marker: MapMarkerData): google.maps.Symbol | google.maps.Icon {
    switch (marker.type) {
      case 'navigation':
        return {
          path: 'M11.981 15.2891L15.9656 1.33057C16.1648 0.532938 15.4675 -0.164989 14.6706 0.0344188L0.724291 4.02257C-0.172257 4.32169 -0.271874 5.51813 0.624675 5.91695L7.19936 8.70866L9.98862 15.2891C10.4867 16.2862 11.6821 16.1865 11.981 15.2891Z',
          anchor: new google.maps.Point(8, 8),
          fillOpacity: 1,
          scale: 1.3,
          rotation: (marker.direction ?? 0) - 45,
          fillColor: ColorUtil.get(marker.fillColorVariable ?? '--main-primary'),
          strokeColor: ColorUtil.get(marker.strokeColorVariable ?? '--main-primary')
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
      default:
        return { url: 'assets/svg/event-icon.svg', scaledSize: new google.maps.Size(36, 36), anchor: new google.maps.Point(18, 18) };
    }
  }

  constructor(private readonly themeService: ThemeService, private readonly cdr: ChangeDetectorRef) {}

  private updateMapData(event: EventModel, videoCurrentTime: DateTime | null): void {
    if (!event.occurence_start_time || !event.occurence_end_time) {
      return this.updateStaticMarker(event);
    }

    if (!event.gps_per_time || event.gps_per_time.length === 0) {
      return this.updateStaticMarker(event);
    }

    const occurenceStartDateTime = DateTime.fromFormat(event.occurence_start_time, DateConst.serverDateTimeFormat);
    const occurenceEndDateTime = DateTime.fromFormat(event.occurence_end_time, DateConst.serverDateTimeFormat);
    const path = event.gps_per_time.map(point => ({
      lat: Number(point.coordinates[0]),
      lng: Number(point.coordinates[1]),
      timestamp: DateTime.fromFormat(point.time, DateConst.serverDateTimeFormat).toMillis()
    }));

    const occurenceStartTime = occurenceStartDateTime.toMillis();
    const occurenceEndTime = occurenceEndDateTime.toMillis();
    const startEventIndex = Math.max(
      0,
      path.findIndex(point => point.timestamp >= occurenceStartTime)
    );
    const endEventIndex = path.findIndex(point => point.timestamp > occurenceEndTime);

    this._polylineSegments = [];

    if (startEventIndex > 0) {
      this._polylineSegments.push({
        path: path.slice(0, startEventIndex),
        strokeColor: ColorUtil.get('--extra-three')
      });
    }

    if (startEventIndex >= 0) {
      this._polylineSegments.push({
        path: path.slice(startEventIndex - 1, endEventIndex >= 0 ? endEventIndex + 1 : path.length),
        strokeColor: ColorUtil.get('--main-primary')
      });
    }

    if (endEventIndex >= 0 && endEventIndex < path.length) {
      this._polylineSegments.push({
        path: path.slice(endEventIndex),
        strokeColor: ColorUtil.get('--extra-three')
      });
    }

    this._center = {
      lat: Number(path[startEventIndex].lat),
      lng: Number(path[startEventIndex].lng)
    };

    this._markers = [
      {
        id: `event-${event.report_time}`,
        coordinates: event.coordinates ? [String(event.coordinates.latitude), String(event.coordinates.longitude)] : [String(path[startEventIndex].lat), String(path[startEventIndex].lng)],
        type: 'event',
        icon: event.event_icon
      }
    ];

    if (videoCurrentTime) {
      const currentTime = videoCurrentTime.toMillis();
      let bestPrevPoint = path[0];
      let bestNextPoint = path[1];
      let minTimeDiff = Number.MAX_VALUE;

      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];

        if (p1.timestamp <= currentTime && p2.timestamp > currentTime) {
          bestPrevPoint = p1;
          bestNextPoint = p2;
          break;
        }

        const timeDiff = Math.abs(p1.timestamp - currentTime);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          bestPrevPoint = p1;
          bestNextPoint = p2;
        }
      }

      const segmentProgress = Math.min(1, Math.max(0, (currentTime - bestPrevPoint.timestamp) / (bestNextPoint.timestamp - bestPrevPoint.timestamp)));

      const lat = this.interpolateValue(bestPrevPoint.lat, bestNextPoint.lat, segmentProgress);
      const lng = this.interpolateValue(bestPrevPoint.lng, bestNextPoint.lng, segmentProgress);
      const newDirection = this.calculateBearing(bestPrevPoint.lat, bestPrevPoint.lng, bestNextPoint.lat, bestNextPoint.lng);

      let direction = newDirection;
      if (this._markers.length > 0) {
        const currentMarker = this._markers.find(m => m.type === 'navigation') as any;
        if (currentMarker && typeof currentMarker.direction === 'number') {
          const currentDirection = currentMarker.direction;
          const diff = Math.abs(newDirection - currentDirection);
          if (diff > 45 && diff < 315) {
            direction = currentDirection;
          }
        }
      }

      this._markers.push({
        id: 'navigation',
        coordinates: [String(lat), String(lng)],
        direction,
        type: 'navigation',
        fillColorVariable: '--main-primary',
        strokeColorVariable: '--main-primary'
      });
    }

    this.cdr.detectChanges();
  }

  private updateVehiclePosition(lat: number, lng: number, direction: number, event: EventModel): void {
    this._center = { lat, lng };
    this._markers = [
      {
        id: `event-${event.report_time}`,
        coordinates: event.coordinates ? [String(event.coordinates.latitude), String(event.coordinates.longitude)] : [String(lat), String(lng)],
        type: 'event',
        icon: event.event_icon
      },
      {
        id: 'navigation',
        coordinates: [String(lat), String(lng)],
        direction,
        type: 'navigation',
        fillColorVariable: '--main-primary',
        strokeColorVariable: '--main-primary'
      }
    ];
  }

  private calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (n: number) => (n * Math.PI) / 180;
    const toDeg = (n: number) => (n * 180) / Math.PI;

    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  }

  private normalizeAngle(angle: number): number {
    return (angle + 360) % 360;
  }

  private interpolateValue(start: number, end: number, progress: number): number {
    return start + (end - start) * Math.max(0, Math.min(1, progress));
  }

  public mapCoordinatesToPosition(coordinates: MapCoordinates): google.maps.LatLngLiteral {
    return {
      lat: Number(coordinates[0]),
      lng: Number(coordinates[1])
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['event'] || changes['videoCurrentTime']) && this._event) {
      this.updateMapData(this._event, this._videoCurrentTime);
    }
  }

  private updateStaticMarker(event: EventModel): void {
    if (!event.coordinates) return;

    this._center = {
      lat: event.coordinates.latitude,
      lng: event.coordinates.longitude
    };

    this._markers = [
      {
        id: `event-${event.report_time}`,
        coordinates: [event.coordinates.latitude, event.coordinates.longitude],
        type: 'event',
        icon: event.event_icon
      }
    ];

    this.cdr.detectChanges();
  }
}
