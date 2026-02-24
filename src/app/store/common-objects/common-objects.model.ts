import { HttpResponse } from 'src/app/service/http/http.model';
import { MapCoordinates } from '../../model/map.model';
import { Privilege } from '../config/config.model';

interface MapVehiclesDriver {
  id: number;
  avatar?: string;
  name: string;
  licence_number: string;
}

export interface VehiclesTreeElement {
  id: number;
  device_id: string;
  fleet_id?: number;
  fleet_name?: string;
  model_name?: string;
  brand_name?: string;
  registration_plate: string;
  status: 'Active' | 'Inactive' | 'Available';
  driver: { id: number; avatar?: string; name: string; licence_number: string };
}

export type VehiclesTreeResponse = HttpResponse<VehiclesTreeElement[]>;

export interface VehicleDevicesElement {
  id: number;
  name: string;
}

export type VehicleDevicesResponse = HttpResponse<VehicleDevicesElement[]>;

export interface DriversTreeElement {
  id: number;
  name: string;
}

export type DriversTreeResponse = HttpResponse<DriversTreeElement[]>;

export interface UsersTreeParams {
  roles?: string;
  ignored_roles?: 'DRIVER' | string;
}

export interface UsersTreeElement {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  privileges: Privilege[];
  company_id: number;
}

export type UsersTreeResponse = HttpResponse<UsersTreeElement[]>;

export interface FleetsTreeParams {
  fleet_ids?: string;
  show_vehicles?: boolean;
  with_profiles?: boolean;
  company_id?: number;
}

export interface FleetsTreeVehicle {
  id: number;
  registration_plate: string;
  brand_name: string;
  model_name: string;
  type: 'HGV' | 'VAN' | 'BUS' | 'TRAIN' | 'COMPANY_CAR';
  cameras: FleetsTreeCamera[];
}
export interface FleetsTreeCamera {
  id: number;
  name: string;
}

export interface FleetsTreeElement {
  id: number;
  name: string;
  phase: string;
  logo?: string;
  children: FleetsTreeElement[];
  vehicles?: FleetsTreeVehicle[];
  parent_id: number;
  event_camera_channel_priorities: EventChannel[];
  profile?: { id: number; name: string };
  custom_event_types: string[];
  settings: { speeding_event_cooldown_minutes: number; speeding_event_percentage_trigger: number };
  driver_mode: string | null;
}

export interface EventChannel {
  id: number;
  event_type: string;
  default_camera_channel: number;
}

export type FleetsTreeResponse = HttpResponse<{ fleet_dtos: FleetsTreeElement[] }>;

export interface MapVehiclesParams {
  fleet_id?: FleetsTreeElement['id'];
  polygon?: PolygonPoints[];
  vehicle_id?: number[];
  driver_id?: number;
  from?: string;
  to?: string;
}

export interface PolygonPoints {
  lat: number;
  lng: number;
}

export interface MapVehiclesElement {
  fleet_id?: number;
  active: boolean;
  last_coordinates: MapCoordinates;
  registration_plate: string;
  vehicle_id: number;
  device_id: string;
  direction?: number;
  driver?: MapVehiclesDriver;
  time?: string;
}

export interface DriversTreeParams {
  company_id: string;
}

export type MapVehiclesResponse = HttpResponse<MapVehiclesElement[]>;
