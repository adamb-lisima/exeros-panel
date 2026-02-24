import { PageMeta } from 'src/app/model/page.model';
import { HttpResponse } from 'src/app/service/http/http.model';

export interface EventTrendsChart {
  events_per_day?: ChartDataPerDay;
  events_per_day_of_week?: ChartData;
  hour_of_the_day?: ChartDataEventByHour;
  hour_of_the_day_per_bus?: ChartDataEventByHour;
  event_locations?: EventLocation[];
  total_event_locations?: number;
  statuses?: ChartDataEventByHour;
}

export interface EventTrendsChartParams {
  fleet_id: number;
  from: string;
  to: string;
  event_types: string[];
  statuses: string[];
}

export interface ChartDataPerDay {
  data: number[];
  y: string[];
}

export interface ChartData {
  key: string;
  value: string;
}

export interface EventLocation {
  lat: string;
  lon: string;
  event_id: string;
  registration_plate: string;
  event_type: string;
  occurence_time: string;
}

export interface ChartDataEventByHour {
  data: HourOfTheDay;
  y: string[];
}

export interface HourOfTheDay {
  [eventType: string]: number[];
}

export interface EventsStatsElement {
  fleet_id: number;
  active_vehicles?: number;
  events_to_review?: number;
  escalations?: number;
  fatigue?: number;
  distraction?: number;
  no_driver?: number;
  event_per_vehicles?: EventPerVehicle[];
  event_stats?: EventTrends[];
}

export interface EventPerVehicle {
  vehicle_id: number;
  registration_plate: string;
  event_count: number;
}

export interface EventTrends {
  event_icon: string;
  display_name: string;
  total_events: number;
  total_escalations: number;
  avg_speed: number;
}

export interface EventsStatsParams {
  fleet_id: number;
  from: string;
  to: string;
}

export interface EventsParams {
  fleet_id: number;
  vehicle_id: number | undefined;
}

export interface EventsElement {
  id: string;
  event_type: string;
  event_icon: string;
  driver_name: string;
  occurence_time: string;
  status: 'REVIEW_REQUIRED' | 'REVIEWED' | 'ESCALATED' | 'FALSE_EVENT';
  temperature?: number;
}

export interface FleetsRouteParams {
  id?: string;
}

export interface EventsMeta extends PageMeta {}

export type EventsStatsMeta = PageMeta;

export type EventsStatsResponse = HttpResponse<EventsStatsElement[], EventsStatsMeta>;
export type EventsStatsElementResponse = HttpResponse<EventsStatsElement>;

export type ChartDataByHourResponse = HttpResponse<ChartDataEventByHour[]>;
export type ChartDataResponse = HttpResponse<ChartData[]>;

export type EventsTrendsChartResponse = HttpResponse<EventTrendsChart>;
