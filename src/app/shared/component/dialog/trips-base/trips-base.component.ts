import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MapCoordinates, MapMarkerData } from '../../../../model/map.model';
import { SelectControl } from '../../control/select-control/select-control.model';
import { TripsElement, Trip, TripsMeta } from '../../../../screen/drivers/drivers.model';
@Component({
  selector: 'app-trips-base',
  templateUrl: './trips-base.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripsBaseComponent {
  @Input() trip: Trip | null | undefined = null;
  @Input() trips: TripsElement[] | null | undefined = null;
  @Input() tripsMeta: TripsMeta | null | undefined = null;
  @Input() tripsLoading: boolean | null | undefined = false;
  @Input() tripLoading: boolean | null | undefined = false;
  @Input() mapData:
    | {
        center?: MapCoordinates;
        markers?: MapMarkerData[];
        polyline?: MapCoordinates[];
      }
    | null
    | undefined = null;

  @Input() sortOrderOptions: SelectControl<any>[] = [];
  @Input() paramsGroup!: FormGroup;
  @Input() title = 'Routes Driven';

  @Output() nextPageRequest = new EventEmitter<number>();
  @Output() tripClick = new EventEmitter<TripsElement>();

  handleNextPageRequest(page: number): void {
    this.nextPageRequest.emit(page);
  }

  handleTripClick(trip: TripsElement): void {
    this.tripClick.emit(trip);
  }

  get sortOrderControl(): AbstractControl | null {
    return this.paramsGroup?.get('sort_order');
  }

  trackByField(field: string) {
    return (index: number, item: any) => item?.[field];
  }

  static generateMapData(trip: Trip | null | undefined): {
    center?: MapCoordinates;
    markers?: MapMarkerData[];
    polyline?: MapCoordinates[];
  } {
    if (!trip) {
      return { markers: [] };
    }

    const polyline = this.getPolylineFromTrip(trip);

    const center = this.calculateMapCenter(trip, polyline);

    const markers = this.generateMapMarkers(trip, polyline);

    return { center, markers, polyline };
  }

  private static getPolylineFromTrip(trip: Trip): MapCoordinates[] | undefined {
    if (trip.trip_line?.length > 0) {
      return trip.trip_line.filter(point => point.latitude != null && point.longitude != null).map(point => [point.latitude, point.longitude] as MapCoordinates);
    }

    if (trip.gps_timeline?.length > 0) {
      return trip.gps_timeline.map(gps => gps.coordinates);
    }

    return this.createBasicPolyline(trip);
  }

  private static createBasicPolyline(trip: Trip): MapCoordinates[] | undefined {
    const points: MapCoordinates[] = [];

    if (trip.from_lat != null && trip.from_lon != null) {
      points.push([trip.from_lat, trip.from_lon] as MapCoordinates);
    }

    if (trip.to_lat != null && trip.to_lon != null && trip.status !== 'DURING') {
      points.push([trip.to_lat, trip.to_lon] as MapCoordinates);
    }

    return points.length > 0 ? points : undefined;
  }

  private static calculateMapCenter(trip: Trip, polyline?: MapCoordinates[]): MapCoordinates | undefined {
    if (polyline && polyline.length > 0) {
      return polyline[Math.floor(polyline.length / 2)];
    }

    if (trip.from_lat != null && trip.from_lon != null) {
      return [trip.from_lat, trip.from_lon] as MapCoordinates;
    }

    if (trip.to_lat != null && trip.to_lon != null) {
      return [trip.to_lat, trip.to_lon] as MapCoordinates;
    }

    return undefined;
  }

  private static generateMapMarkers(trip: Trip, polyline?: MapCoordinates[]): MapMarkerData[] {
    const markers: MapMarkerData[] = [];

    this.addEventMarkers(trip, markers);

    this.addStartEndMarkers(trip, polyline, markers);

    return markers;
  }

  private static addEventMarkers(trip: Trip, markers: MapMarkerData[]): void {
    trip.event_timeline?.forEach(eventTimeline => {
      if (eventTimeline.latitude != null && eventTimeline.longitude != null) {
        markers.push({
          id: `event-${eventTimeline.time}`,
          coordinates: [eventTimeline.latitude, eventTimeline.longitude],
          type: 'event'
        });
      }
    });
  }

  private static addStartEndMarkers(trip: Trip, polyline: MapCoordinates[] | undefined, markers: MapMarkerData[]): void {
    if (polyline && polyline.length > 0) {
      markers.push({
        id: 'start',
        coordinates: polyline[0],
        type: 'start'
      });

      if (trip.status !== 'DURING' && polyline.length > 1) {
        markers.push({
          id: 'end',
          coordinates: polyline[polyline.length - 1],
          type: 'end'
        });
      }
      return;
    }

    if (trip.from_lat != null && trip.from_lon != null) {
      markers.push({
        id: 'start',
        coordinates: [trip.from_lat, trip.from_lon] as MapCoordinates,
        type: 'start'
      });
    }

    if (trip.to_lat != null && trip.to_lon != null && trip.status !== 'DURING') {
      markers.push({
        id: 'end',
        coordinates: [trip.to_lat, trip.to_lon] as MapCoordinates,
        type: 'end'
      });
    }
  }
}
