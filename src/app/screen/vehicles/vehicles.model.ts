import { PageMeta } from 'src/app/model/page.model';
import { HttpResponse } from 'src/app/service/http/http.model';
import { MapCoordinates } from '../../model/map.model';

type Status = 'Active' | 'Inactive' | 'Available';

type Type = 'HGV' | 'VAN' | 'BUS' | 'TRAIN' | 'COMPANY_CAR';

type TripStatus = 'DURING' | 'COMPLETED';

interface EventTimeline {
  name: string;
  time: string;
  latitude: number;
  longitude: number;
}

interface GpsTimeline {
  coordinates: MapCoordinates;
}

export interface TripLine {
  latitude: number;
  longitude: number;
  time: string;
}

export interface VehiclesRouteParams {
  id?: string;
}

export interface MapRouteParams {
  id?: string;
}

export interface VehiclesParams {
  fleet_id: number;
  vehicle_id?: number[] | undefined | string[];
  order: 'a-z' | 'active-first';
  search: string;
}

export interface VehiclesElement {
  id: number;
  brand_name: string;
  model_name: string;
  registration_plate: string;
  device_id: string;
  vehicle_device_id: number;
  fleet_id: number;
  mot_expiry_due: string;
  service_due: string;
  provider_id: number;
  status: Status;
  type: Type;
  inactive_since: string | null;
  has_video: boolean;
  has_telematics: boolean;
}

export type VehiclesMeta = PageMeta;

export type VehiclesResponse = HttpResponse<VehiclesElement[], VehiclesMeta>;

export interface Vehicle {
  company_id: number;
  brand_name: string;
  channel_count: string;
  channels: string[];
  protocol: string;
  distance_driven: number;
  driving_time: number;
  fleet_id: number;
  bus_id?: string;
  fleet_name: string;
  fuel_consumption?: string;
  id: number;
  model_name: string;
  mot_expiry_due: string;
  providers: { vehicle_device_id: number; device_id: string; details: string; provider_id: number; provider: Provider }[];
  registration_plate: string;
  serial_number: string;
  service_due?: string;
  type: Type;
  vehicle_device_id: number;
  transmit_ip: string;
  transmit_port: number;
  sim_no: string;
  imei?: string;
  imsi: string;
  network_module_type: string;
  vehicle_class: string;
  factory_grade: string;
  loading_capacity: string;
  engine_number: string;
  chassis_number: string;
  fuel_type: string;
  road_transport_certificate: string;
  technical_grade: string;
  validity_period: string;
  province: string;
  city: string;
  device_username: string;
  device_password: string;
  factory_lot_number: string;
  factory_lot_time: string;
  installer: string;
  peripheral_description: string;
  route: string;
  telemetry: Telemetry | null;
  colour?: string;
  fuel_capacity?: string;
  gross_vehicle_weight?: number;
  driver_mode?: null | 'Disabled' | 'Enabled';
}
export interface Telemetry {
  speed?: number | null;
  speed_limit?: number | null;
  action?: string | null;
  driver_id?: number | null;
  driver_score?: number | null;
  eco_score?: number | null;
  fuel_level?: number | null;
  fuel_percentage?: number | null;
  hybrid_level?: number | null;
  temperature?: number | null;
  direction?: string | null;
  battery_voltage?: number | null;
  ignition?: boolean | null;
  rpm?: number | null;
  throttle?: number | null;
  lat?: string | null;
  lng?: string | null;
  location?: string | null;
  millage?: number | null;
  vin?: number | null;
  turbocharger_temperature?: number | null;
  engine_temperature?: number | null;
  air_temperature?: number | null;
  battery_temperature?: number | null;
  eco_driving?: number | null;
  vehicle_type?: string | null;
  engine_motor_hours?: number | null;
  engine_coolant_temperature?: number | null;
  additional_parameters: any[];
}

export interface Provider {
  id: number;
  name: string;
  type: string;
}

export type VehicleResponse = HttpResponse<Vehicle>;

export interface CameraChannelsElement {
  id: number;
  channel: string;
  name: string;
  active: boolean;
}

export type CameraChannelsResponse = HttpResponse<CameraChannelsElement[]>;

export interface UpdateCameraChannelBody {
  id: number;
  channel: string;
  name: string;
  active: boolean;
}

export interface TripsParams {
  page: number;
  per_page: number;
  sort_order: 'DESC' | 'ASC';
  vehicle_id: number[] | number | undefined;
}

export interface TripsElement {
  id: string;
  vehicle_registration_plate: string;
  status: TripStatus;
  from: string;
  to: string;
  created_at: string;
  start_time: string;
  end_time: string;
}

export type TripsMeta = PageMeta;

export type TripsResponse = HttpResponse<TripsElement[], TripsMeta>;

export interface Trip {
  id: string;
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  event_timeline: EventTimeline[];
  gps_timeline: GpsTimeline[];
  trip_line: TripLine[];
  status: TripStatus;
}

export type TripResponse = HttpResponse<Trip>;

export interface AlarmsParams {
  page: number;
  per_page: number;
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

export interface EventsParams {
  fleet_id: number;
  vehicle_id: number | undefined;
}

export interface EventsElement {
  id: string;
  event_type: string;
  display_name: string;
  event_icon: string;
  star_rating: number;
  driver_name: string;
  occurence_time: string;
  status: 'REVIEW_REQUIRED' | 'REVIEWED' | 'ESCALATED' | 'FALSE_EVENT';
  temperature?: number;
}

export interface EventsMeta extends PageMeta {}

export type EventsResponse = HttpResponse<EventsElement[], EventsMeta>;
