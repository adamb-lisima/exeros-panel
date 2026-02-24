import { PageMeta } from '../../model/page.model';
import { HttpResponse } from '../../service/http/http.model';

export interface TopDriversElement {
  id: number;
  name: string;
  rank?: number;
  score: number;
  rank_change?: number;
  star_rating?: number;
}

export interface TopDriversParams {
  driver_id?: number[];
  fleet_id?: number;
  order?: 'asc' | 'desc';
}

export type TopDriversResponse = HttpResponse<TopDriversElement[]>;

export interface MileageParams {
  vehicle_id: number[] | undefined | string[];
  driver_id: number | undefined;
  fleet_id?: number;
}

export interface MileageElement {
  date: string;
  value: number;
  unit: string;
}

export type MileageResponse = HttpResponse<{ mileage_chart: MileageElement[] }>;

export interface DrivingTimeParams {
  vehicle_id: number[] | undefined | string[];
  driver_id: number | undefined;
  fleet_id?: number;
}

export interface DrivingTimeElement {
  date: string;
  value: number;
  unit: string;
}

export type DrivingTimeResponse = HttpResponse<{ driving_time_chart: DrivingTimeElement[] }>;

export interface VehicleIssuesParams {
  page: number;
  per_page: number;
  fleet_id?: number;
}

export interface VehicleIssuesElement {
  registration_plate: string;
  vehicle_type: 'HGV' | 'VAN' | 'COMPANY_CAR' | 'BUS';
  status: 'PASSED' | 'FAILED' | 'INCOMPLETE';
  vehicle_check_id: number;
  issues: string[];
}

export interface EventsReportParams {
  fleet_id: number;
  event_type: string[] | undefined;
  driver_id: number[] | undefined | string[];
  vehicle_id: number[] | undefined | string[];
}

export interface EventsReportParamsRequest {
  fleet_id: number;
  event_type: string | undefined;
  driver_id: number | undefined | string;
  vehicle_id: number | undefined | string;
  stacked: string | undefined;
  page: number;
  per_page: number;
  fetch_in_background: number | undefined | boolean;
}

export interface VehicleIssuesMeta extends PageMeta {}

export type VehicleIssuesResponse = HttpResponse<VehicleIssuesElement[], VehicleIssuesMeta>;

export interface AlarmsReportParamsRequest {
  driver_id: number | undefined;
  vehicle_id: number | undefined;
}

export interface AlarmsElement {
  id: string;
  time: string;
  end_time: string | null;
  type: string;
  content: string;
  event_id?: string;
  speed: number;
  driver?: { id: number; name: string };
  vehicle: { id: number; registration_plate: string };
}

export interface AlarmsMeta extends PageMeta {}

export type AlarmsResponse = HttpResponse<AlarmsElement[], AlarmsMeta>;

export interface DistanceDrivenParamsRequest {
  fleet_id: number;
  vehicle_id: number | undefined | string;
}

export interface VehicleOnlineStatusParamsRequest {
  stacked: string | undefined;
  fleet_id?: number;
}

export interface DistanceDrivenElement {
  vehicle_id: number;
  registration_plate: string;
  type: string;
  route: string;
  mileage: string;
}

export interface VehicleOnlineStatusElement {
  registration_plate: string;
  device_id: string;
  vehicle_id: number;
  fleet_id: number;
  date: string;
  count_of_online: number;
  vehicle_check_id: number | undefined;
  driver_id: number | undefined;
}

export interface UserLogsElement {
  log_type: string;
  user_id: number;
  desc: string;
  created_at: string;
}

export interface UserLogsParams {
  order: 'asc' | 'desc';
  company_id: number | null;
  user_ids: string | null; // multiple seperated by ','
  log_types: string | null; // multiple seperated by ','
}

export type UserLogsResponse = HttpResponse<UserLogsElement[]>;

export type DistanceDrivenResponse = HttpResponse<DistanceDrivenElement[]>;

export type VehicleOnlineStatusResponse = HttpResponse<VehicleOnlineStatusElement[]>;

export interface TripsParams {
  page: number;
  per_page: number;
  vehicle_id: number[] | undefined | string[];
  driver_id: number | undefined;
  fleet_id?: number;
}

export interface TripsElement {
  id: string;
  driver_name: string;
  vehicle_registration_plate: string;
  vehicle_id: number;
  status: 'DURING' | 'COMPLETED';
  from: string;
  to: string;
}

export interface GlobalFiltersParams {
  vehicle_id?: number[] | string[] | null;
  driver_id?: number | string | null;
  date_range?: { start: Date; end: Date } | null;
  fleet_id?: number;
}

export type TripsMeta = PageMeta;

export type TripsResponse = HttpResponse<TripsElement[], TripsMeta>;
