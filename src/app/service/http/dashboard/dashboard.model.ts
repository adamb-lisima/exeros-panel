import { HttpResponse } from 'src/app/service/http/http.model';

interface Mdvr {
  active_count: number;
  all_count: number;
}

interface DrivingTime {
  date: string;
  value: number;
  unit: string;
}

interface Event {
  name: string;
  value: number;
  color: string;
  date: string;
}

interface EventChart {
  date: string;
  value: number;
  events: Event[];
}

export interface DashboardParams {
  fleet_id: number;
}

export interface Dashboard {
  accident_qty: number;
  mdvr: Mdvr;
  driver_checks: number;
  distance_driven: number;
  driving_time: DrivingTime[];
  event_chart: EventChart[];
}

export type DashboardResponse = HttpResponse<Dashboard>;
