import { MapCoordinates } from 'src/app/model/map.model';
import { PageMeta } from 'src/app/model/page.model';
import { HttpResponse } from 'src/app/service/http/http.model';

interface Driver {
  id: number;
  name: string;
  licence_number: string;
}

type Status = 'Active' | 'Inactive' | 'Available';

interface Camera {
  provider: string;
  channel: number;
  name: string;
  sub_stream: string;
  main_stream: string;
  provider_details?: any;
}

interface Calendar {
  date: string;
  file_type: string;
  is_gps: boolean;
  has_telematics?: boolean;
  has_video?: boolean;
}

interface GpsTimeline {
  speed: number;
  direction: number;
  coordinates: MapCoordinates;
  time: string;
}

export interface SpeedTimeline {
  speed: number;
  time: string;
  rpm: number;
}

export interface FuelTimeline {
  fuel_volume: number;
  fuel_level: number;
  time: string;
}

export interface HybridTimeline {
  hybrid_level: number;
  time: string;
}

interface DriverTimeline {
  name: string;
  time: string;
}

interface VideoTimeline {
  start_time: string;
  end_time: string;
  name: string;
  filetype: number;
}

export interface EventTimeline {
  name: string;
  event_icon: string;
  event_id?: string;
  time: string;
  type: string;
  latitude: number;
  longitude: number;
  thumbnail: string;
}

export interface AlarmTimeline {
  name: string;
  type: string;
  time: string;
  latitude: number;
  longitude: number;
  registration_plate: string;
  event_icon: string;
  event_id: number | null;
  thumbnail: string | null;
  start_time: string;
  end_time: string;
}

export interface StreamRouteParams {
  id?: string;
}

export interface VehiclesParams {
  search?: string | undefined;
  fleet_id: number;
  driver_id: number | undefined;
  vehicle_id: number[] | undefined | string[];
  order: 'a-z' | 'active-first';
  with_driver: boolean;
}

export interface VehiclesElement {
  id: number;
  device_id: string;
  registration_plate: string;
  status: Status;
  driver?: Driver;
  last_updated_at: string;
  last_speed: number;
  location: string;
  fleet_name: string;
  gps_position: [number, number];
  from: string | null;
  to: string | null;
  trip_coordinates: any[];
  event_timeline: EventTimeline[];
  direction: number;
  telemetry_timeline: TelemetryTimelinePoint[];
  telemetry_signal: number;
  has_telematics: boolean;
  has_video: boolean;
  inactive_since: string | null;
}

export interface VehiclesMeta extends PageMeta {}

export type VehiclesResponse = HttpResponse<VehiclesElement[], VehiclesMeta>;

export interface AlarmsParams {
  page: number;
  per_page: number;
  from: string;
  to: string;
  vehicle_id: number | undefined;
}

export interface AlarmsElement {
  id: string;
  time: string;
  type: string;
  content: string;
}

export interface AlarmsMeta extends PageMeta {}

export type AlarmsResponse = HttpResponse<AlarmsElement[], AlarmsMeta>;

export interface CreateMessageBody {
  message_type: string;
  receiver_id: number;
  message: string;
}

export interface CreateMessageResponse {
  status: string;
  message: string;
}

export interface PlaybackParams {
  st: string;
  date: string;
}

export interface CameraInfo {
  id: number;
  name: string;
}

export interface SharedClipsSettings {
  access_type: string;
  contacts: { name: string; email: string }[];
}

export interface Playback {
  id: number;
  calendar: Calendar[];
  brand_name: string;
  model_name: string;
  registration_plate: string;
  fleet_name: string;
  status: Status;
  driver: Driver | null;
  has_video: boolean;
  has_telematics: boolean;
  cameras: CameraInfo[];
  shared_clips_settings: SharedClipsSettings;
  priority_provider_type: string;
}

export type PlaybackResponse = HttpResponse<Playback>;

export interface PlaybackTimelineParams {
  date: string;
  st: string;
}

export interface PlaybackTimeline {
  date: string;
  gps_timeline: GpsTimeline[];
  driver_timeline: DriverTimeline[];
  video_timeline: VideoTimeline[];
  speed_timeline: SpeedTimeline[];
  fuel_timeline: FuelTimeline[];
  hybrid_timeline: HybridTimeline[];
  max_fuel: number | null;
  event_timeline: EventTimeline[];
  alarm_timeline: AlarmTimeline[];
  trips: Trip[];
  has_video: boolean;
  has_telematics: boolean;
}

export type PlaybackTimelineResponse = HttpResponse<PlaybackTimeline>;

export interface PlaybackScopeParams {
  start_time: string;
  end_time: string;
  st: string;
  isTimeoutOrServerError?: boolean;
}

export interface ExportTelemetryParams {
  start_time: string;
  end_time: string;
}

export interface PlaybackSeekParams {
  from: string;
  sn: number;
}

export interface PlaybackScope {
  status?: string;
  registration_plate?: string;
  cameras: Camera[];
  initial_request: string;
  heart_beat: string;
  telemetry_timeline: TelemetryTimelinePoint[];
  telemetry_signal: number;
  vehicle_id: number;
  sn: number;
  has_playback_fixed: boolean;
  provider_details?: any;
}

export type PlaybackScopeResponse = HttpResponse<PlaybackScope>;

export interface PlaybackSeek {}

export type PlaybackSeekResponse = HttpResponse<PlaybackSeek>;

export interface MapVehiclesElement {
  active: boolean;
  last_coordinates: MapCoordinates;
  registration_plate: string;
  vehicle_id: number;
  device_id: string;
  direction?: number;
  driver?: MapVehiclesDriver;
  time?: string;
}

interface MapVehiclesDriver {
  id: number;
  avatar?: string;
  name: string;
  licence_number: string;
}

export type MapVehiclesResponse = HttpResponse<MapVehiclesElement[]>;

export interface MapVehiclesParams {
  fleet_id: number;
}

export interface Trip {
  index: number;
  from: string;
  to: string;
  gps_timeline: GpsTimeline[];
  event_timeline: EventTimeline[];
  time_from: string;
  time_to: string;
}

export interface TelemetryData {
  gpsTimeline: GpsPerTime[];
  speedTimeline: SpeedTimeline[];
  trips: TelemetryTrip[];
  hasTelematics: boolean;
}

export interface TelemetryTrip {
  index: number;
  from: string;
  to: string;
  gpsTimeline: GpsPerTime[];
  eventTimeline: EventTimeline[];
}

export interface GpsPerTime {
  time: string;
  coordinates: MapCoordinates;
  speed: number;
  direction: number;
}

export interface TelemetryTimelinePoint {
  started_at: string;
  speed: number;
  action: VehicleAction;
  driver?: {
    id: number;
    name?: string;
    phone_number: string;
    email: string;
    address: string;
  };
  driver_id: number;
  driver_score: number;
  eco_score: number;
  vehicle_alerts: VehicleAlert[];
  fuel_level: number;
  temperature: number;
  direction: VehicleDirection;
  battery_voltage?: number | null;
  vehicle_type: VehicleType;
  speed_limit: number;
  rpm: number;
  throttle: number;
  fuel_percentage: number;
  ignition: boolean;
  hybrid_level: number;
  lat: string;
  lng: string;
  direction_number: number;
  location: string;
  millage: number;
  vin: string;
  turbocharger_temperature: number;
  engine_temperature: number;
  air_temperature: number;
  battery_temperature: number;
}

export type VehicleType = 'HGV' | 'COMPANY_CAR' | 'VAN' | 'BUS';
export type VehicleAction = 'IDLE' | 'ACCELERATION' | 'BRAKING' | 'STOPPED' | 'DRIVING';
export type VehicleDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type VehicleAlertTypes = 'TIRE_PRESSURE' | 'ENGINE_CHECK' | 'LOW_FUEL' | 'ENGINE_TEMPERATURE';
export type VehicleAlert = {
  name: string;
  text: string;
  icon: VehicleAlertTypes;
};

export interface TelemetryTimeline {
  vehicle_id: number;
  cameras: Camera[];
  initial_request: string;
  heart_beat: string;
  telemetry_timeline: TelemetryTimelinePoint[];
  telemetry_signal: number;
}

export interface TelemetryData {
  speed: number;
  action: VehicleAction;
  direction: VehicleDirection;
  driver_name: string;
  driver_score: number;
  fuel_level: number;
  eco_score: number;
  temperature: number;
  alerts: VehicleAlert[];
}

export interface InitializedStreams {
  [deviceId: string]: {
    initialized: boolean;
    sn?: string;
  };
}
