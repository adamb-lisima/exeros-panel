type LatLng = number | string | undefined;

export type MapCoordinates = [LatLng, LatLng];

export type MapMarkerData = {
  id: string | number;
  vehicleId?: number;
  coordinates: MapCoordinates;
  infoWindow?: string;
  onClick?: () => void;
} & (
  | {
      type: 'navigation';
      direction?: number;
      fillColorVariable?: string;
      strokeColorVariable?: string;
    }
  | {
      type: 'start' | 'event' | 'end';
      icon?: string;
    }
);

export interface RouteSegment {
  path: google.maps.LatLngLiteral[];
  startTime: string;
  endTime: string;
  index: number;
}

export interface MapPolylineOptions extends google.maps.PolylineOptions {
  segmentIndex?: number;
}
