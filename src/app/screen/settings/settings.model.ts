import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PageMeta } from 'src/app/model/page.model';
import { HttpResponse } from 'src/app/service/http/http.model';
import { SelectControl } from '../../shared/component/control/select-control/select-control.model';
import { LicenseRenewalRemindMeBefore } from '../../store/auth/auth.model';
import { Privilege } from '../../store/config/config.model';
import { Vehicle } from '../vehicles/vehicles.model';
import { Escalation } from './settings-core/settings-core-notifications/settings-core-notifications.model';

export type SettingsRolesUserList = 'details' | 'notifications' | 'password' | 'delete';

export type SettingsModuleList = 'profile' | 'companies' | 'notifications' | 'fleets' | 'driver' | 'safety-scores' | 'roles' | 'automated_reports' | 'infotainment' | 'shared-clips-emails' | 'event-strategies' | 'providers' | 'admins' | 'app-settings';

export interface EventStrategy {
  id: number;
  name: string;
  alarm_type_id: number;
  main_stream: boolean;
  sub_stream: boolean;
  time_before: number;
  time_after: number;
  bbox_gps: boolean;
  bbox_log: boolean;
  bbox_acc: boolean;
  bbox: string;
  video_channel: string;
  pic_channel: string;
  status: number;
  flag?: number;
  cmd_type?: number;
  remark?: string;
  interval_sec?: number;
  alarm_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EventStrategyParams {
  alarm_type_id?: number;
  fleet_id?: number;
  page: number;
  per_page: number;
  search?: string;
}

export type EventStrategyMeta = PageMeta;
export type EventStrategyResponse = HttpResponse<EventStrategy[], EventStrategyMeta>;

export interface CreateEventStrategyRequest {
  alarm_type_id: number;
  main_stream?: boolean;
  sub_stream?: boolean;
  time_before?: number;
  time_after?: number;
  bbox_gps?: boolean;
  bbox_log?: boolean;
  bbox_acc?: boolean;
  bbox?: string;
  video_channel?: string;
  pic_channel?: string;
  status?: number;
  flag?: number;
  cmd_type?: number;
  remark?: string;
  interval_sec?: number;
  alarm_count?: number;
}

export interface UpdateEventStrategyRequest {
  main_stream?: boolean;
  sub_stream?: boolean;
  time_before?: number;
  time_after?: number;
  bbox_gps?: boolean;
  bbox_log?: boolean;
  bbox_acc?: boolean;
  bbox?: string;
  video_channel?: string;
  pic_channel?: string;
  status?: number;
  flag?: number;
  cmd_type?: number;
  remark?: string;
  interval_sec?: number;
  alarm_count?: number;
}

export interface FleetEventStrategyElement {
  fleet_id: number;
  fleet_name: string;
  event_strategies: { [key: string]: string };
}

export interface FleetEventStrategyListParams {
  page: number;
  per_page: number;
}

export type FleetEventStrategyListMeta = PageMeta;
export type FleetEventStrategyListResponse = HttpResponse<FleetEventStrategyElement[], FleetEventStrategyListMeta>;

export interface UpdateFleetEventStrategiesRequest {
  event_strategy_ids: number[];
}

export interface Fleet {
  event_camera_channel_priorities?: [{ default_camera_channel: number; event_type: string }];
}

export type FleetResponse = HttpResponse<Fleet>;

export type CreateFleetBody = {
  name: string;
  phase: string;
  parent_id: string;
  vehicle_ids: number[];
  eventTypes: { [key in string]: number };
  custom_event_types: string[];
  settings: { speeding_event_cooldown_minutes: number; speeding_event_percentage_trigger: number };
  driver_mode: string | null;
};

export interface CreateVehicleBody {
  brand_name: string;
  model_name: string;
  registration_plate: string;
  bus_id: string;
  type: 'HGV' | 'VAN' | 'BUS' | 'TRAIN' | 'COMPANY_CAR';
  driver_mode: string;
  fleet_id: number;
  mot_expiry_due: string;
  service_due: string;
  providers: FormArray<FormGroup<ProviderForm>>;
  channel_count: string;
  protocol: string;
  transmit_ip: string;
  transmit_port: number;
  route: string;
  colour: string;
  fuel_type: string;
  fuel_capacity: number;
  gross_vehicle_weight: number;
  camera_channels?: CameraChannel[];
  channels?: { [key: string]: string };

  only_validation?: boolean;
  step?: number;
}

export interface CameraChannel {
  channel: number;
  name: string;
  active: boolean;
  id?: number;
}

export interface ValidationResponse {
  valid: boolean;
}

export type ProviderForm = {
  provider_id: FormControl<number | null>;
  device_id: FormControl<string | null>;
  order: FormControl<number | null>;
  transmit_ip?: FormControl<string | null>;
  transmit_port?: FormControl<number | null>;
};

export interface UpdateEventDefaultCameraChannelsBody {
  [eventType: string]: number;
}

export interface AssignVehicleBody {
  fleet_id: number;
}

export interface UpdatePasswordBody {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ChangePrivilegesBody {
  privileges: Privilege[];
}

export interface NotificationsParams {
  company_id?: number;
}

export enum NotificationType {
  VEHICLE_CHECKS = 'VEHICLE_CHECKS',
  EVENT_OCCURRED = 'EVENT_OCCURRED',
  EVENT_ESCALATED = 'EVENT_ESCALATED',
  ACCIDENTS = 'ACCIDENTS',
  VEHICLE_ISSUES = 'VEHICLE_ISSUES'
}

export enum AccessGroup {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DASHBOARD_VIEWER = 'dashboard_viewer',
  LEADERBOARD_VIEWER = 'leaderboard_viewer',
  LEADERBOARD_DOWNLOADER = 'leaderboard_downloader',
  DRIVERS_VIEWER = 'drivers_viewer',
  DRIVERS_EDITOR = 'drivers_editor',
  VEHICLES_VIEWER = 'vehicles_viewer',
  VEHICLES_EDITOR = 'vehicles_editor',
  FLEETS_VIEWER = 'fleets_viewer',
  STREAM_VIEWER = 'stream_viewer',
  EVENTS_VIEWER = 'events_viewer',
  ESCALATED_EVENTS_VIEWER = 'escalated_events_viewer',
  REVIEWED_EVENTS_VIEWER = 'reviewed_events_viewer',
  ARCHIVED_EVENTS_VIEWER = 'archived_events_viewer',
  ARCHIVED_EVENTS_EDITOR = 'archived_events_editor',
  EVENTS_EDITOR = 'events_editor',
  EVENTS_COMMENTER = 'events_commenter',
  TOP_DRIVER_REPORTS_VIEWER = 'reports_top_driver_viewer',
  TOP_DRIVER_REPORTS_DOWNLOADER = 'reports_top_driver_downloader',
  MILEAGE_REPORTS_VIEWER = 'reports_mileage_viewer',
  MILEAGE_REPORTS_DOWNLOADER = 'reports_mileage_downloader',
  DRIVING_TIME_REPORTS_VIEWER = 'reports_driving_time_viewer',
  DRIVING_TIME_REPORTS_DOWNLOADER = 'reports_driving_time_downloader',
  VEHICLE_ISSUES_REPORTS_VIEWER = 'reports_vehicle_issues_viewer',
  DISTANCE_DRIVEN_REPORTS_VIEWER = 'reports_distance_driven_viewer',
  DISTANCE_DRIVEN_REPORTS_DOWNLOADER = 'reports_distance_driven_downloader',
  EVENTS_REPORTS_VIEWER = 'reports_events_viewer',
  EVENTS_REPORTS_DOWNLOADER = 'reports_events_downloader',
  ALARMS_REPORTS_VIEWER = 'reports_alarms_viewer',
  ALARMS_REPORTS_DOWNLOADER = 'reports_alarms_downloader',
  ACCIDENTS_REPORTS_VIEWER = 'reports_accidents_viewer',
  ACCIDENTS_REPORTS_DOWNLOADER = 'reports_accidents_downloader',
  TRIPS_REPORTS_VIEWER = 'reports_trips_viewer',
  TRIPS_REPORTS_DOWNLOADER = 'reports_trips_downloader',
  VEHICLES_CHECKS_REPORTS_VIEWER = 'reports_vehicles_checks_viewer',
  VEHICLES_CHECKS_REPORTS_DOWNLOADER = 'reports_vehicles_checks_downloader',
  VEHICLE_ONLINE_STATUS_REPORTS_VIEWER = 'reports_vehicle_online_status_viewer',
  VEHICLE_ONLINE_STATUS_REPORTS_DOWNLOADER = 'reports_vehicle_online_status_downloader',
  USER_LOGS_REPORTS_VIEWER = 'reports_user_logs_viewer',
  USER_LOGS_REPORTS_DOWNLOADER = 'reports_user_logs_downloader',
  TELEMATICS_VIEWER = 'telematics_viewer',
  SETTINGS_NOTIFICATION_SETTINGS = 'settings_notification_settings_editor',
  SETTINGS_PROFILE = 'settings_profile_editor',
  SETTINGS_FLEET_MANAGEMENT = 'settings_fleet_management_editor',
  SETTINGS_ROLE_MANAGEMENT = 'settings_role_management_editor',
  SETTINGS_DRIVER_MANAGEMENTS = 'settings_driver_managements_editor',
  SETTINGS_DRIVER_SCORE_WEIGHTS = 'settings_driver_score_weights_editor',
  SETTINGS_COMPANY_MANAGEMENTS = 'settings_company_managements_editor',
  SETTINGS_AUTOMATED_REPORTS = 'settings_automated_reports_editor',
  SETTINGS_INFOTAINMENT = 'settings_infotainment_editor',
  SETTINGS_VEHICLE_EVENT_STRATEGIES = 'settings_vehicle_event_strategies_editor',
  SETTINGS_SHARED_CLIPS_EMAILS = 'settings_shared_clips_emails_editor',
  NOTIFICATIONS_VIEWER = 'notifications_viewer',
  TASK_LIST_VIEWER = 'task_list_viewer',
  MAP_VIEW = 'map_view_viewer',
  SETTINGS_COMMISSION_EDITOR = 'settings_commission_editor'
}

export interface NotificationsElement {
  id: number;
  company_id: number;
  allowed_notifications: NotificationType[];
  escalation_settings: {
    vehicle_checks: number[];
    event_occurred: { [key: string]: { [key: string]: { data: number[]; default_name: string; name: string; event_icon: string } } };
    event_escalated: {
      [key: string]: {
        [key: string]: {
          data: number[];
          default_name: string;
          name: string;
          event_icon: string;
        };
      };
    };
    accidents: number[];
    vehicle_issues: number[];
  };
}

export type NotificationsResponse = HttpResponse<NotificationsElement[]>;

export interface UpdateNotificationBody {
  allowed_notifications: NotificationType[];
  vehicle_check_user_ids: number[];
  event_occurred_user_ids: { [key: string]: Escalation[] };
  event_escalated_user_ids: { [key: string]: Escalation[] };
  accident_user_ids: number[];
  vehicleIssueUserIds: number[];
}

export interface UpdateEventInNotificationBody {
  name: string;
  user_ids: string;
  context?: 'event_occurred' | 'event_escalated';
}

export interface SafetyScoreProfilesParams {}

export interface ScoreWeight {
  id: number;
  event_type: { name: string; default_name: string; event_icon: string };
  group_id: number;
  value: number;
}

export interface SafetyScoreProfilesElement {
  id: number;
  name: string;
  safety_score_profile_weights: ScoreWeight[];
}

export type SafetyScoreProfilesResponse = HttpResponse<SafetyScoreProfilesElement[]>;

export interface UpdateSafetyScoreProfileBody {
  name: string;
  company_id: number;
  weights: { value: number; event_type: string }[];
}

export interface CreateSafetyScoreProfileBody {
  name: string;
  company_id: number;
  weights: { group_id: number; value: number; event_type: string }[];
}

export interface UpdateAuthBody {
  name: string;
  email: string;
  role: number;
  allowed_notifications: NotificationType[];
}

export interface MfaParams {
  type: 'ENABLE' | 'DISABLE' | 'LOCK';
}

export interface MfaExecuteParams {
  type: 'ENABLE' | 'DISABLE' | 'LOCK';
  code: string;
}

export interface UsersParams {
  role?: string;
  search?: string;
  company_id?: number;
  page: number;
  per_page: number;
  fleet_access?: number;
}

export interface DriverParams {
  role?: string;
  search?: string;
  company_id?: number;
  page: number;
  per_page: number;
}

export interface CompanyTreeParams {
  search?: string;
  with_users: boolean;
  with_drivers: boolean;
  with_score: boolean;
}

export interface UserElement {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  company_id: number;
  company_name: string;
  is_mfa_enabled: boolean;
  last_login_at: string | undefined | null;
  last_login_history: string[];
}

export type UsersMeta = PageMeta;

export type UsersResponse = HttpResponse<UserElement[], UsersMeta>;

export interface CreateRoleParams {
  name: string;
  reviewer_level: string;
  access_groups: string[];
  allowed_event_types: string[];
  company_id?: number;
}

export interface CompanyElement {
  id: number;
  licence_end_date: string;
  license_renewal_remind_me_before: LicenseRenewalRemindMeBefore[];
  logo: string | undefined;
  name: string;
  roles_count: number;
  users_count: number;
  branches_count: number;
  vehicles_count: number;
  score_profiles?: CompanyScoreProfile[];
  mfa_status: string;
  video_timeout: number;
  review_required_event_types: string[];
  users_limit: number;
  fleet_ids: number[];
  role_ids: number[];
}

export interface CompanyScoreProfile {
  id: number;
  company_id: number;
  name: string;
  safety_score_profile_weights: CompanyScoreWeight[];
}

export interface CompanyScoreWeight {
  id: number;
  event_type: string;
  group_id: number;
  profile_id: number;
  value: number;
}

export type CompanyTreeResponse = HttpResponse<CompanyElement[]>;

export interface CompanyRolesParams {
  company_id: number | null;
  page: number;
  per_page: number;
  only_custom_roles: boolean | null;
}

export interface RoleElement {
  id: number;
  name: string;
  reviewer_level: string;
  access_groups: string[];
  allowed_event_types: string;
}

export interface FleetAccessParams {
  company_id: number;
  page: number;
  per_page: number;
}

export interface FleetAccess {
  id: number;
  name: string;
  company_fleet_access_users: UserElement[];
  company_fleet_access_items: CompanyFleetAccess[];
  company_fleet_access_camera_channels: CompanyFleetAccessCameraChannel[];
  vehicles_count: number;
}

export interface CompanyFleetAccess {
  id: number;
  fleet_access_id: number;
  fleet_id: number;
  vehicle_id: number;
}

export interface CompanyFleetAccessCameraChannel {
  id: number;
  fleet_access_id: number;
  camera_channel_id: number;
  vehicle_id: number;
}

export type FleetAccessMeta = PageMeta;

export type FleetAccessResponse = HttpResponse<FleetAccess[], FleetAccessMeta>;

export interface CreateUpdateUser {
  name: string;
  email: string;
  company_id: number;
  role_id: number;
  fleet_access_ids: string;
}

export interface CreateUpdateDriver {
  name: string;
  email: string;
  username?: string;
  company_id: number;
  licence_number?: string;
  fleet_access_ids: string;
  allow_automated_assignment: boolean;
}

export interface CreateDriverBody {
  name: string;
  email: string;
  username: string;
  company_id: number;
  password: string;
  confirmPassword: string;
  licence_number: string;
}

export interface UpdateDriverBody {
  name: string;
  email: string;
  role: string;
  license_renewal_remind_me_before: LicenseRenewalRemindMeBefore[];
  fleet_access_ids: string;
  licence_number: string;
  first_name: string;
  last_name: string;
  username: string;
  company_id: number;
  license_number: number;
  password: string;
  confirmPassword: string;
}

export interface DriverElement {
  id: number;
  name: string;
  email: string;
  username: string;
  company_id: number;
  company_name: string;
  password: string;
  confirmPassword: string;
  licence_number: string;
  fleet_access_ids: number[];
  status: string;
  vehicle_id: number;
  registration_plate: string;
  user_id: number;
  allow_automated_assignment: boolean;
}

export type DriverMeta = PageMeta;

export type DriverResponse = HttpResponse<DriverElement>;

export type DriversResponse = HttpResponse<DriverElement[], DriverMeta>;

export interface CreateUpdateCompany {
  name: string;
  fleet_ids: string;
  role_ids: string;
  licence_end_date: string;
  license_renewal_remind_me_before: LicenseRenewalRemindMeBefore[];
  mfa_status: string;
  video_timeout: number;
  review_required_event_types: string[];
  users_limit: number | null;
}

export interface CreateUpdateFleetAccess {
  company_id: number | string;
  name: string;
  fleet_ids: string;
  vehicle_ids: string;
  camera_channel_ids: string;
}

export interface VehicleParams {
  id?: number;
  fleet_id?: number;
  brand_name?: string;
  registration_plate?: string;
  model_name?: string;
  company_name?: string;
  branch?: string;
  page: number;
  per_page: number;
  search?: string;
}

export interface AddVehicleBody {
  vehicle_id?: number;
}

export interface ReportElement {
  page: number;
  per_page: number;
  id: number;
  name: string;
  type: string;
  status: string;
}

export interface ReportItemParams {
  automated_report_id?: number;
  page: number;
  per_page: number;
  sent_at?: string;
  file_dir?: string;
}

export interface ReportItemElement {
  id: number;
  page: number;
  per_page: number;
  sent_at: string;
  from: string;
  to: string;
  file_dir: string;
  file_url: string;
}

export interface Report {
  id: number;
  name: string;
  type: string;
  status: 'ACTIVE' | 'INACTIVE';
  fleet_names?: string[];
  receivers?: string[];
  fleet_ids?: number[];
  event_types?: string[];
  report_type: string;
  resource_type: string;
  vehicle_ids?: number[];
  driver_ids?: number[];
  vehicle_plates?: string[];
}

export interface ReportItem {
  automated_report_id: number;
  sent_at: string;
  file_dir: string;
  file_url: string;
}

export interface ReportParams {
  id: number;
  name?: string;
  type?: number;
  page: number;
  per_page: number;
  search?: string;
  status?: string;
  fleet_names?: string[];
  receivers?: string;
  fleet_ids?: string;
  event_type?: string;
  report_type?: string;
  resource_type?: string;
  vehicle_ids?: string;
  vehicle_plates?: string[];
}

export interface ReportsTreeElement {
  id: number;
  fleet_ids?: string;
  status: 'ACTIVE' | 'INACTIVE';
  name: string;
  type?: number;
  fleet_names?: string;
  receivers?: string;
  event_type?: string;
}

export interface CreateUpdateReportBody {
  name: string;
  fleet_ids: number[];
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  receivers: string;
  status: 'ACTIVE' | 'INACTIVE';
  event_types: string[] | undefined;
  report_type: string;
  vehicle_ids: number[];
  driver_ids: number[];
  resource_type: 'FLEET' | 'VEHICLE' | 'DRIVER';
}

export type ReportsTreeResponse = HttpResponse<ReportParams[]>;

export type ReportMeta = PageMeta;

export type ReportItemMeta = PageMeta;

export type SingleReportResponse = HttpResponse<Report>;

export type ReportResponse = HttpResponse<ReportParams[], ReportMeta>;

export type ReportItemResponse = HttpResponse<ReportItemElement[], ReportItemMeta>;

export interface VehicleElement {
  id: number;
  brand_name: string;
  registration_plate: string;
  model_name: string;
  company_name: string;
  page: number;
  per_page: number;
  fleet_name?: string;
  commission_status: string;
}

export interface VehicleTreeParams {
  fleet_id: string;
}

export type VehicleMeta = PageMeta;

export type VehicleResponse = HttpResponse<VehicleElement[], VehicleMeta>;

export type SingleVehicleResponse = HttpResponse<Vehicle>;

export interface CreateVehicleEventStrategySimpleRequest {
  vehicle_id: number;
  event_strategy_id: number;
  user_id?: number;
  send_email?: number;
  email_address?: string;
}

export interface VehicleEventStrategySimple {
  id: number;
  name: string;
  vehicle_id: number;
  vehicle_registration: string;
  event_strategy_id: number;
  alarm_type_id: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleEventStrategy {
  id: number;
  name: string;
  vehicle_id: number;
  vehicle_registration: string;
  streamax_object_id: number;
  alarm_type_id: number;
  main_stream: boolean;
  sub_stream: boolean;
  time_before: number;
  time_after: number;
  bbox_gps: boolean;
  bbox_log: boolean;
  bbox_acc: boolean;
  bbox: string;
  video_channel: string;
  pic_channel: string;
  status: number;
  flag?: number;
  cmd_type?: number;
  time?: string;
  user_id?: number;
  remark?: string;
  interval_sec?: number;
  alarm_count?: number;
  send_email?: number;
  email_address?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleEventStrategyResponse {
  data: VehicleEventStrategy[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface VehicleEventStrategyDetailResponse {
  data: VehicleEventStrategy;
  meta: any[];
}

export interface CreateVehicleEventStrategyRequest {
  vehicle_id: number;
  alarm_type_id: number;
  main_stream: boolean;
  sub_stream: boolean;
  time_before: number;
  time_after: number;
  bbox_gps: boolean;
  bbox_log: boolean;
  bbox_acc: boolean;
  bbox: string;
  video_channel: string;
  pic_channel: string;
  status: number;
  flag?: number;
  cmd_type?: number;
  user_id?: number;
  remark?: string;
  interval_sec?: number;
  alarm_count?: number;
  send_email?: number;
  email_address?: string;
}

export interface UpdateVehicleEventStrategyRequest {
  main_stream?: boolean;
  sub_stream?: boolean;
  time_before?: number;
  time_after?: number;
  bbox_gps?: boolean;
  bbox_log?: boolean;
  bbox_acc?: boolean;
  bbox?: string;
  video_channel?: string;
  pic_channel?: string;
  status?: number;
  flag?: number;
  cmd_type?: number;
  user_id?: number;
  remark?: string;
  interval_sec?: number;
  alarm_count?: number;
  send_email?: number;
  email_address?: string;
}

export interface UserNotification {
  name: string;
  enabled: boolean;
  context?: 'event_occurred' | 'event_escalated';
}

export interface UserNotificationsElement {
  notifications: Array<{
    name: string;
    enabled: boolean;
    context?: 'event_occurred' | 'event_escalated';
  }>;
}

export type InfotainmentStatus = 'pending' | 'completed' | 'draft';

export interface Infotainment {
  id: number;
  title: string;
  content: string;
  send_time: string;
  status: InfotainmentStatus;
  start_hour?: string;
  end_hour?: string;
}

export interface InfotainmentParams {
  status?: InfotainmentStatus;
  page?: number;
  per_page?: number;
}

export interface SharedClipsEmailsElement {
  id: number;
  company_id: number;
  company_name: number;
  access_type: string;
  contacts: { name: string; email: string }[];
}

export interface SharedClipsEmailsBody {
  company_id: number;
  access_type: string;
  contacts: { name: string; email: string }[];
}

export interface CreateInfotainmentBody {
  title: string;
  content: string;
  send_time: string;
  schedule_email: boolean;
  start_hour?: string;
  end_hour?: string;
}

export interface UpdateInfotainmentBody extends CreateInfotainmentBody {}

export type InfotainmentMeta = PageMeta;
export type InfotainmentResponse = HttpResponse<Infotainment>;
export type InfotainmentsResponse = HttpResponse<Infotainment[], InfotainmentMeta>;

export type UserNotificationsResponse = HttpResponse<UserNotification[]>;

export const ALARM_TYPES = [
  { id: 1, name: 'Video loss' }, // Video loss
  { id: 2, name: 'Motion detection' }, // Motion detection
  { id: 3, name: 'Camera-covering alarm' }, // Cover
  { id: 4, name: 'Abnormal storage alarm' }, // Storage exception
  { id: 5, name: 'IO 1' }, // IO 1
  { id: 6, name: 'IO 2' }, // IO 2
  { id: 7, name: 'IO 3' }, // IO 3
  { id: 8, name: 'IO 4' }, // IO 4
  { id: 9, name: 'IO 5' }, // IO 5
  { id: 10, name: 'IO 6' }, // IO 6
  { id: 11, name: 'IO 7' }, // IO 7
  { id: 12, name: 'IO 8' }, // IO 8
  { id: 13, name: 'Emergency alarm' }, // PANIC_ALARM
  { id: 14, name: 'Low-speed' }, // Low-speed
  { id: 15, name: 'High-speed alarm' }, // High-speed
  { id: 16, name: 'Low voltage alarm' }, // Low voltage
  { id: 17, name: 'Acceleration alarm' }, // ACC
  { id: 18, name: 'Geo-fencing alarm' }, // Fence
  { id: 19, name: 'Illegal power off' }, // Illegal power off
  { id: 20, name: 'Illegal shutdown' }, // Illegal shutdown
  { id: 29, name: 'Temperature alarm' }, // Temperature alarm
  { id: 36, name: 'Distance alarm' }, // Distance alarm
  { id: 47, name: 'Alarm for abnormal temperature changes' }, // Temperature change alarm
  { id: 58, name: 'Driver Fatigue' }, // DMS fatigue driving
  { id: 59, name: 'No driver' }, // DSM no driver
  { id: 60, name: 'Phone Detection' }, // DSM driver call
  { id: 61, name: 'Smoking Detection' }, // DSM driver smoke
  { id: 62, name: 'Driver Distraction' }, // DSM driver under distraction
  { id: 63, name: 'Lane departure' }, // DSM lane departure
  { id: 64, name: 'Forward Collision Warning' }, // DSM font car collision
  { id: 74, name: 'Abnormal boot alarm' }, // Abnormal boot alarm
  { id: 99, name: 'Front panel alarm' }, // Front panel alarm
  { id: 160, name: 'Speeding Alarm' }, // Speeding
  { id: 161, name: 'Impeding violation' }, // Impeding
  { id: 162, name: 'Following Distance Monitoring' }, // DSM car-distance too close
  { id: 163, name: 'Pedestrian Collision Warning' }, // DSM Pedestrian collision
  { id: 164, name: 'Yawning Detection' }, // DSM driver yawns
  { id: 165, name: 'Left blind spot detection' }, // DSM Left blind zone
  { id: 166, name: 'Right blind spot detection' }, // DSM Right blind zone
  { id: 169, name: 'Seat Belt Detection' }, // DSM Seat Belt Detection
  { id: 172, name: 'Rolling Stop Alarm' }, // DSM Rolling Stop Alarm
  { id: 173, name: 'Left BSD warning' }, // Left BSD warning
  { id: 174, name: 'Left BSD alarm' }, // Left BSD alarm
  { id: 175, name: 'Right BSD warning' }, // Right BSD warning
  { id: 176, name: 'Right BSD alarm' }, // Right BSD alarm
  { id: 179, name: 'Behind blind area' }, // Behind blind area
  { id: 294, name: 'Idle alarm' }, // Idle alarm
  { id: 325, name: 'Low Bridge Warning' }, // Low Bridge Warning
  { id: 326, name: 'Low Bridge Alarm' }, // Low Bridge Alarm
  { id: 392, name: 'Forward blind area' }, // DSM Forward blind area
  { id: 394, name: 'Low Bridge Recognition' }, // Low Bridge Recognition
  { id: 451, name: 'Left radar alarm' }, // Left radar alarm
  { id: 453, name: 'Right radar alarm' }, // Right radar alarm
  { id: 455, name: 'Rear radar alarm' }, // Rear radar alarm
  { id: 1000, name: 'Frequency anomaly' } // Frequency anomaly
];

export function getAlarmTypeName(id: number): string {
  const alarm = ALARM_TYPES.find(a => a.id === id);
  return alarm ? alarm.name : `Unknown (${id})`;
}

export interface VehicleLookupParams {
  reg_plate: string;
}

export type VehicleLookupResponse = HttpResponse<Vehicle>;

export interface ProviderParams {
  page: number;
  per_page: number;
}

export interface ProviderBody {
  id: number;
  name: string;
  type: ProviderType;
  settings?: any;
}

export type ProviderMeta = PageMeta;
export type ProviderResponse = HttpResponse<ProviderBody[], ProviderMeta>;

export enum ProviderType {
  FLESPI = 'FLESPI',
  STREAMAX = 'STREAMAX',
  MANUAL = 'MANUAL',
  ANALYTIC = 'ANALYTIC',
  FT_CLOUD = 'FT_CLOUD'
}

export interface ProviderSelectControl extends SelectControl {
  type?: string;
}

export interface CreateStreamaxProvider {
  api_login: string;
  api_password: string;
  domain: string;
  mongo_host: string;
  mongo_port: number;
  mongo_database: string;
  mongo_username: string;
  mongo_password: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface CreateFlespiProvider {
  flespi_provider_url: string;
}

export interface CreateManualProvider {}

export interface CreateAnalyticProvider {}

export interface CreateProviderBody {
  name: string;
  type: ProviderType;
  settings: CreateFlespiProvider | CreateStreamaxProvider | CreateManualProvider | CreateAnalyticProvider;
}

export interface AdminParams {
  page: number;
  per_page: number;
}

export interface AdminBody {
  id: number;
  name: string;
  email: string;
  company_ids: number[];
}

export interface CreateAdminBody {
  name: string;
  email: string;
  company_ids: number[];
}

export type AdminMeta = PageMeta;
export type AdminResponse = HttpResponse<AdminBody[], AdminMeta>;
export type SingleAdminResponse = HttpResponse<AdminBody>;

export interface AssignVehicleStrategies {
  event_strategy_ids: number[];
  fleet_id: number;
}

export interface CompleteVehicleStrategies {
  event_id?: string;
}

export interface ApplicationsSettingsParams {
  page: number;
  per_page: number;
}

export enum ApplicationSettingType {
  STRING = 'string',
  BOOLEAN = 'boolean',
  INTEGER = 'integer',
  FLOAT = 'float',
  ARRAY = 'array',
  JSON = 'json'
}

export interface ApplicationSetting {
  id: number;
  name: string;
  value: string;
  type: ApplicationSettingType;
  input_type: string;
}

export type ApplicationSettingsMeta = PageMeta;

export type ApplicationSettingsResponse = HttpResponse<ApplicationSetting[], ApplicationSettingsMeta>;
export type ApplicationSettingResponse = HttpResponse<ApplicationSetting>;
