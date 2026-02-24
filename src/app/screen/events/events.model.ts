import { MapCoordinates } from 'src/app/model/map.model';
import { PageMeta } from 'src/app/model/page.model';
import { HttpResponse } from 'src/app/service/http/http.model';
import { VehicleAction, VehicleAlert, VehicleDirection, VehicleType } from '../stream/stream.model';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface User {
  id: number;
  avatar?: string;
  email: string;
  name: string;
}

interface Comment {
  id: string;
  comment: string;
  date: string;
  user: User;
  related_event_id?: string;
}

interface Camera {
  provider: string;
  channel: number;
  name: string;
  picture?: string;
  sub_stream?: string;
  main_stream?: string;
  provider_details?: any;
}

interface History {
  user_id: number;
  user_name: string;
  comment?: string;
  action: string;
  date: string;
  status_details?: string;
  driver_fatigue_fields?: { driver_fatigue_asleep_at_wheel: string; driver_fatigue_accident_or_injury: string; driver_fatigue_signs_of_fatigue: string };
}

export interface GpsPerTime {
  coordinates: MapCoordinates;
  direction: number;
  speed: number;
  time: string;
}

type Status = 'REVIEW_REQUIRED' | 'ESCALATED' | 'FALSE_EVENT' | 'DO_NOT_ESCALATE' | 'REVIEWED' | 'TEST' | 'INVALID_VIDEO' | 'REVIEW_OPTIONAL';

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

export interface EventsRouteParams {
  id?: string;
}

export interface EventsParams {
  from: string;
  to: string;
  fleet_id: number;
  event_type: string[] | undefined;
  driver_id: number[] | undefined | string[];
  vehicle_id: number[] | undefined | string[];
  speed_from: number | undefined;
  speed_to: number | undefined;
  score_from: number | undefined;
  score_to: number | undefined;
  status: string | undefined;
  fetch_in_background: number | undefined | boolean;
  phase: string | undefined;
  provider_names: string[] | undefined;
}

export interface EventsParamsRequest {
  from: string;
  to: string;
  fleet_id: number;
  event_type: string | undefined;
  driver_id: number | undefined | string;
  vehicle_id: number | undefined | string;
  status: string | undefined;
  fetch_in_background: number | undefined | boolean;
  speed_from: number | undefined;
  speed_to: number | undefined;
  score_from: number | undefined;
  score_to: number | undefined;
  phase: string | undefined;
  provider_names: string | undefined;
  include_review_optional: string | undefined;
  page?: string | number;
  per_page: string | number;
}

export interface EventsElement {
  id: string;
  event_type: string;
  display_name: string;
  event_icon: string;
  driver_name: string;
  occurence_time: string;
  event_added_at: string;
  registration_plate: string;
  status: Status;
  last_status?: Status;
  speed?: number;
  temperature?: number;
  thumbs: string[];
  driver_id?: number;
  vehicle_id?: number;
  weather_type?: string;
  vehicle_status: string;
  is_overlimit: boolean;
  speed_limit: number;
  coordinates?: Coordinates;
  has_video: boolean;
  has_telematics: boolean;
  score_before: number;
  score_after: number;
  star_rating: number;
  description: string;
  provider_name: string;
  driver_requested_status_change: boolean;
  driver_review?: DriverReview;
}

export interface EventsMeta extends PageMeta {}

export type EventsResponse = HttpResponse<EventsElement[], EventsMeta>;

export interface Event {
  id: string;
  event_date?: string;
  event_type: string;
  default_type: string;
  event_icon: string;
  display_name: string;
  phase: string;
  speed?: number;
  registration_plate: string;
  driver_name: string;
  vehicle_id: number;
  occurence_time: string;
  occurence_start_time?: string;
  event_added_at: string;
  fleet_name: string;
  occurence_end_time?: string;
  report_time?: string;
  coordinates?: Coordinates;
  gps_per_time: GpsPerTime[];
  speed_timeline: { speed: number; time: string }[];
  location?: string;
  temperature?: number;
  last_status?: Status;
  status: Status;
  level2_status: Status;
  comments: Comment[];
  cameras: Camera[];
  relations: EventRelation[];
  history: History[];
  thumbs: string[];
  weather_type: string;
  comment: string;
  review_time: string;
  vehicle_status: string;
  is_overlimit: boolean;
  speed_limit: number;
  has_video: boolean;
  has_telematics: boolean;
  score_before: number;
  score_after: number;
  videos_public: boolean;
  has_given_kudos: boolean;
  driver_requested_status_change: boolean;
  driver_review?: DriverReview;
}

export interface EventRelation {
  thumbs: string[];
  event_id: string;
  occupation_time: string;
  cameras: Camera[];
}

export type EventResponse = HttpResponse<Event>;

export interface ScreenEventParams {
  url: string;
  full_page?: boolean;
}

export interface EditEventBody {
  status: Status;
  status_details?: string;
  comment: string | undefined;
  driver_fatigue_asleep_at_wheel: string | undefined;
  driver_fatigue_accident_or_injury: string | undefined;
  driver_fatigue_signs_of_fatigue: string | undefined;
}

export interface CommentEventBody {
  comment: string;
  status: Status;
  mentions?: number[];
}

export interface TripsParams {
  page: number;
  per_page: number;
  sort_order: 'DESC' | 'ASC';
  vehicle_id: number | undefined;
}

export interface TripsElement {
  id: string;
  vehicle_registration_plate: string;
  status: TripStatus;
  from: string;
  to: string;
  created_at: string;
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
}

export type TripResponse = HttpResponse<Trip>;

export interface VehiclesParams {
  fleet_id: number;
  order: 'a-z' | 'active-first';
}

export interface VehiclesElement {
  id: number;
  registration_plate: string;
  status: 'Active' | 'Inactive' | 'Available';
}

export interface VehiclesMeta extends PageMeta {}

export type VehiclesResponse = HttpResponse<VehiclesElement[], VehiclesMeta>;

export interface TelemetryEvent {
  started_at: string;
  speed: number;
  action: VehicleAction;
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
}

export interface TelemetryData {
  telemetry: TelemetryEvent;
}

export interface DriverReview {
  id: string;
  event_id: string;
  status: Status;
  driver_explanation?: string;
  reason: string;
  rejection_reason: string;
}

export type TelemetryResponse = HttpResponse<TelemetryData>;
