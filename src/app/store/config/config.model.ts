import { HttpResponse } from 'src/app/service/http/http.model';

interface NotificationData {
  _id: string;
  type: string;
  message: string;
  fleet_id: number;
  updated_at: string;
  created_at: string;
}

interface ProviderData {
  id: number;
  name: string;
  type: string;
}

export type AccessGroupType = 'dashboard' | 'events' | 'fleet' | 'notifications' | 'reports' | 'settings' | 'stream' | 'task_list' | 'telematics';
export type AccessType = 'viewer' | 'commenter' | 'editor' | 'downloader';

export type AccessGroups = {
  [key in AccessGroupType]: {
    [key in AccessType]?: string[];
  };
};

export type Privilege = 'EDIT' | 'VIEW';

export interface ReleaseNote {
  version: string;
  changes: string[];
}

export interface ConfigData {
  version: string;
  release_notes: ReleaseNote[];
  api_key: string;
  access_groups: AccessGroups;
  device_ids: string[];
  google_maps_api_key: string;
  notifications: NotificationData[];
  online_devices_count: number;
  speed_unit: 'MPH' | 'KPH';
  notification_types: string[];
  privileges?: Privilege[];
  role_reviewer_levels: string[];
  event_status_details: { [key: string]: { [subKey: string]: string[] } };
  event_types: EventType[];
  custom_event_types: CustomEventType[];
  event_types_groups: EventTypesGroup[];
  alarm_types: string[];
  socket_url: string;
  timeout_video_streaming: string;
  providers: ProviderData[];
  logo?: string;
  alarm_types_mapping: { [key: number]: string };
  event_phases_module: boolean;
  available_fleet_phases: string[];
  log_types: string[];
}

export interface EventTypesGroup {
  name: string;
  items: EventType[];
}

export interface EventType {
  name: string;
  default_name: string;
  event_icon: string;
  show_in_selects: boolean;
}

export interface CustomEventType {
  name: string;
}

export type ConfigResponse = HttpResponse<ConfigData>;
