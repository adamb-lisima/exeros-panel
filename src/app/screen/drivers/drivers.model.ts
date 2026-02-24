import { PageMeta } from 'src/app/model/page.model';
import { HttpResponse } from 'src/app/service/http/http.model';
import { MapCoordinates } from '../../model/map.model';

interface Vehicle {
  id: number;
  device_id: string;
}

type TripStatus = 'DURING' | 'COMPLETED';

interface EventTimeline {
  name: string;
  time: string;
  latitude: number;
  longitude: number;
}

export interface TripLine {
  latitude: number;
  longitude: number;
  time: string;
}

interface GpsTimeline {
  coordinates: MapCoordinates;
}

export interface DriversRouteParams {
  id?: string;
}

export interface DriversParams {
  fleet_id: number;
  driver_id: number | undefined;
  search: string;
  order: 'a-z' | 'active-first';
  vehicle_id: number[] | undefined | string[];
}

export interface DriversElement {
  id: number;
  name: string;
  licence_number: string;
}

export type DriversMeta = PageMeta;

export type DriversResponse = HttpResponse<DriversElement[], DriversMeta>;

export interface Driver {
  id: number;
  name: string;
  vehicle?: Vehicle;
  distance_driven: number;
  driving_time: number;
  events_count: number;
}

export type DriverResponse = HttpResponse<Driver>;

export interface CreateMessageBody {
  message_type: string;
  receiver_id: number;
  message: string;
}

export interface CreateMessageResponse {
  status: string;
  message: string;
}

export interface TripsParams {
  page: number;
  per_page: number;
  sort_order: 'DESC' | 'ASC';
  driver_id: number | undefined;
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

export interface SafetyScoresParams {
  fleet_id: number;
  driver_id: number | undefined;
}

export interface SafetyScoresElement {
  id: string;
  issued_at: string;
  score: number;
  star_score: number;
  cumulative_score: number;
  trend_value: number;
}

export interface SpiderChartSeries {
  name: string;
  data: number[];
}

export interface SpiderChartData {
  categories: string[];
  series: SpiderChartSeries[];
}

export interface EventImpact {
  count: number;
  impact_score: number;
  impact_percentage: number;
}

export interface EventsImpactData {
  [eventName: string]: EventImpact;
}

export interface SafetyScoreMeta extends PageMeta {
  rank: number;
  rank_max: number;
  rank_change: number;
  driver_vehicle_checks_percentage: number;
  overall_score: number;
  overall_star_rating: number;
  current_score: number;
  current_star_rating: number;
  spider_chart_data: SpiderChartData;
  by_events?: EventsImpactData;
}

export type SafetyScoreResponse = HttpResponse<SafetyScoresElement[], SafetyScoreMeta>;

export interface AlarmsParams {
  page: number;
  per_page: number;
  driver_id: number | undefined;
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
  driver_id: number | undefined;
}

export interface EventsElement {
  id: string;
  event_type: string;
  display_name: string;
  star_rating: number;
  event_icon: string;
  driver_name: string;
  occurence_time: string;
  status: 'REVIEW_REQUIRED' | 'REVIEWED' | 'ESCALATED' | 'FALSE_EVENT';
  temperature?: number;
}

export interface EventsMeta extends PageMeta {}

export type EventsResponse = HttpResponse<EventsElement[], EventsMeta>;
