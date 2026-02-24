import { HttpResponse } from '../http.model';

interface Inspection {
  id: number;
  inspection_name: string;
  checked_parts: string;
  status: 'PASSED' | 'FAILED';
  comment: string;
  attachments: string[];
}

interface Trip {
  created_at: string;
  vehicle_registration_plate: string;
}

export interface VehicleChecksParams {
  vehicle_id?: number[] | string[] | undefined;
  driver_id?: number;
  fleet_id?: number;
  status?: 'All' | 'Passed' | 'Failed' | 'Complete' | 'Incomplete';
  with_offlines?: boolean;
}

export interface VehicleChecksElement {
  id: number;
  date: string;
  registration_plate: string;
  driver_name?: string;
  driver_id?: string;
  status: 'Complete' | 'Incomplete';
  vehicle_type: 'HGV' | 'VAN' | 'BUS' | 'TRAIN' | 'COMPANY_CAR';
  vehicle_check_status?: 'PASSED' | 'FAILED' | 'NOT_COMPLETED';
}

export type VehicleChecksResponse = HttpResponse<VehicleChecksElement[]>;

export interface VehicleCheck {
  status: 'PASSED' | 'FAILED';
  trip?: Trip;
  inspections: Inspection[];
}

export type VehicleCheckResponse = HttpResponse<VehicleCheck>;
