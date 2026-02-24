import { MapCoordinates } from '../../../model/map.model';
import { EventTimeline, TelemetryTimelinePoint } from '../../../screen/stream/stream.model';
import { HttpResponse } from '../http.model';

interface Driver {
  id: number;
  name: string;
  licence_number: string;
}

type Status = 'Active' | 'Inactive' | 'Available';

export interface Camera {
  provider: string;
  channel: number;
  name: string;
  sub_stream: string;
  main_stream: string;
  provider_details?: any;
}

export interface LiveFeed {
  id: number;
  device_id: string;
  registration_plate: string;
  status: Status;
  driver?: Driver;
  fleet_name?: string;
  last_updated_at: string;
  last_speed?: number;
  cameras: Camera[];
  gps_position: MapCoordinates;
  location: string;
  direction: number;
  event_timeline: EventTimeline[];
  telemetry_timeline: TelemetryTimelinePoint[];
  telemetry_signal: number;
  from?: string | null;
  to?: string | null;
  trip_coordinates: any[];
  has_video: boolean;
  has_telematics: boolean;
}

export type LiveFeedResponse = HttpResponse<LiveFeed>;

export type VehicleType = 'HGV' | 'COMPANY_CAR' | 'VAN' | 'BUS';
export type VehicleAction = 'IDLE' | 'ACCELERATION' | 'BRAKING' | 'STOPPED' | 'DRIVING';
export type VehicleDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type VehicleAlertTypes = 'TIRE_PRESSURE' | 'ENGINE_CHECK' | 'LOW_FUEL' | 'ENGINE_TEMPERATURE';
export type VehicleAlert = {
  name: string;
  text: string;
  icon: VehicleAlertTypes;
};

export interface TelemetryUpdate {
  telemetry_timeline: TelemetryTimelinePoint[];
  telemetry_signal: number;
}
export type TelemetryUpdateResponse = HttpResponse<TelemetryUpdate>;
