import { PageMeta } from '../../../model/page.model';
import { HttpResponse } from '../http.model';

interface Vehicle {
  registration_plate: string;
}

interface Driver {
  id: number;
  name: string;
}

interface ThirdPartyVehicle {
  accident_id: number;
  colour: string;
  comment: string;
  contact_information: string;
  created_at: string;
  driver_name: string;
  driving_licence: string;
  id: number;
  insurance_provider: string;
  make: string;
  model: string;
  occupants_number: number;
  phone_number: string;
  registration_plate: string;
  updated_at: string;
  vehicle_type: string;
}

export interface AccidentsParams {
  page: number;
  per_page: number;
  vehicle_id?: number;
  driver_id?: number;
  fleet_id?: number;
}

export interface AccidentsElement {
  id: string;
  driver: Driver;
  vehicle: Vehicle;
  status: 'COMPLETED' | 'NOT_COMPLETED';
  date: string;
}

export interface AccidentsMeta extends PageMeta {}

export type AccidentsResponse = HttpResponse<AccidentsElement[], AccidentsMeta>;

export interface Accident {
  id: number;
  any_injured_parties_description: string;
  any_injured_parties_driving_licence: string;
  attachments: { attachment_id: string; type: string; url: string }[];
  coordinates: { lat: number; lng: number };
  full_name: string;
  has_any_injured_parties: boolean;
  status: string;
  vehicle: { registration_plate: string };
  driver: { id: number; name: string; avatar: string; licence_number: string };
  address: string;
  email: string;
  phone_number: string;
  date: string;
  location: string;
  weather_condition: string;
  description: string;
  approximate_speed_of_collision: string;
  are_you_safe: boolean;
  is_anyone_injured: boolean;
  can_you_move_your_vehicles_safely_to_unblock_traffic: boolean;
  witnesses: { id: number; full_name: string; phone_number: string; email: string }[];
  other_details: { id: number; driver_name: string; make: string; model: string; phone_number: string; insurance_provider: string }[];
  third_party_vehicle_details: ThirdPartyVehicle[];
  close_up_third_party_vehicle_pictures: string[];
  close_up_vehicle_pictures: string[];
  wide_angle_scene_pictures: string[];
  wide_angle_third_part_vehicle_pictures: string[];
  wide_angle_vehicle_pictures: string[];
}

export type AccidentResponse = HttpResponse<Accident>;
