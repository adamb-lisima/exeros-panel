import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';

export const accessGroupsField = ['dashboard', 'leaderboard', 'vehicles', 'drivers', 'fleets', 'stream', 'events', 'escalated_events', 'reviewed_events', 'archived_events', 'reports_top_driver', 'reports_mileage', 'reports_driving_time', 'reports_vehicle_issues', 'reports_distance_driven', 'reports_events', 'reports_accidents', 'reports_trips', 'reports_alarms', 'reports_vehicles_checks', 'reports_vehicle_online_status', 'reports_user_logs', 'telematics', 'map_view', 'settings_profile', 'settings_notification_settings', 'settings_company_managements', 'settings_role_management', 'settings_fleet_management', 'settings_driver_managements', 'settings_driver_score_weights', 'settings_automated_reports', 'settings_infotainment', 'notifications', 'task_list', 'settings_shared_clips_emails', 'settings_vehicle_event_strategies', 'settings_commission_editor'] as const;
export type AccessGroupsField = (typeof accessGroupsField)[number];

export type AccessGroupsData = SelectControl<string>[];

const dashboardOptions = [{ value: 'dashboard_viewer', label: 'Viewer' }];
const leaderboardOptions = [
  { value: 'leaderboard_viewer', label: 'Viewer' },
  { value: 'leaderboard_downloader', label: 'Downloader' }
];
const vehiclesOptions = [
  { value: 'vehicles_viewer', label: 'Viewer' },
  { value: 'vehicles_editor', label: 'Editor' }
];
const driversOptions = [
  { value: 'drivers_viewer', label: 'Viewer' },
  { value: 'drivers_editor', label: 'Editor' }
];

const fleetsOptions = [{ value: 'fleets_viewer', label: 'Viewer' }];
const streamOptions = [{ value: 'stream_viewer', label: 'Viewer' }];
const eventsOptions = [
  { value: 'events_viewer', label: 'Viewer' },
  { value: 'events_editor', label: 'Editor' },
  { value: 'events_commenter', label: 'Commenter' }
];
const reviewedEventsOptions = [{ value: 'reviewed_events_viewer', label: 'Viewer' }];
const escalatedEventsOptions = [{ value: 'escalated_events_viewer', label: 'Viewer' }];
const archivedEventsOptions = [
  { value: 'archived_events_viewer', label: 'Viewer' },
  { value: 'archived_events_editor', label: 'Editor' }
];
const reportsTopDriverOptions = [
  { value: 'reports_top_driver_viewer', label: 'Viewer' },
  { value: 'reports_top_driver_downloader', label: 'Downloader' }
];
const reportsMileageOptions = [
  { value: 'reports_mileage_viewer', label: 'Viewer' },
  { value: 'reports_mileage_downloader', label: 'Downloader' }
];
const reportsDrivingTimeOptions = [
  { value: 'reports_driving_time_viewer', label: 'Viewer' },
  { value: 'reports_driving_time_downloader', label: 'Downloader' }
];
const reportsVehicleIssuesOptions = [{ value: 'reports_vehicle_issues_viewer', label: 'Viewer' }];
const reportsDistanceDrivenOptions = [
  { value: 'reports_distance_driven_viewer', label: 'Viewer' },
  { value: 'reports_distance_driven_downloader', label: 'Downloader' }
];
const reportsEventsOptions = [
  { value: 'reports_events_viewer', label: 'Viewer' },
  { value: 'reports_events_downloader', label: 'Downloader' }
];
const reportsAccidentsOptions = [
  { value: 'reports_accidents_viewer', label: 'Viewer' },
  { value: 'reports_accidents_downloader', label: 'Downloader' }
];
const reportsTripsOptions = [
  { value: 'reports_trips_viewer', label: 'Viewer' },
  { value: 'reports_trips_downloader', label: 'Downloader' }
];
const reportsVehiclesChecksOptions = [
  { value: 'reports_vehicles_checks_viewer', label: 'Viewer' },
  { value: 'reports_vehicles_checks_downloader', label: 'Downloader' }
];
const reportsAlarmsOptions = [
  { value: 'reports_alarms_viewer', label: 'Viewer' },
  { value: 'reports_alarms_downloader', label: 'Downloader' }
];
const reportsVehicleOnlineStatusOptions = [
  { value: 'reports_vehicle_online_status_viewer', label: 'Viewer' },
  { value: 'reports_vehicle_online_status_downloader', label: 'Downloader' }
];
const reportsUserLogsOptions = [
  { value: 'reports_user_logs_viewer', label: 'Viewer' },
  { value: 'reports_user_logs_downloader', label: 'Downloader' }
];
const telematicsOptions = [{ value: 'telematics_viewer', label: 'Viewer' }];
const mapViewOptions = [{ value: 'map_view_viewer', label: 'Viewer' }];
const profileOptions = [{ value: 'settings_profile_editor', label: 'Editor' }];
const notificationsSettingsOptions = [{ value: 'settings_notification_settings_editor', label: 'Editor' }];
const companySettingsOptions = [{ value: 'settings_company_managements_editor', label: 'Editor' }];
const fleetSettingsOptions = [{ value: 'settings_fleet_management_editor', label: 'Editor' }];
const roleSettingsOptions = [{ value: 'settings_role_management_editor', label: 'Editor' }];
const driverSettingsOptions = [{ value: 'settings_driver_managements_editor', label: 'Editor' }];
const driverScoreSettingsOptions = [{ value: 'settings_driver_score_weights_editor', label: 'Editor' }];
const automatedReportsOptions = [{ value: 'settings_automated_reports_editor', label: 'Editor' }];
const infotainmentOptions = [{ value: 'settings_infotainment_editor', label: 'Editor' }];
const settingsVehicleEventStrategiesEditorOptions = [{ value: 'settings_vehicle_event_strategies_editor', label: 'Editor' }];
const sharedClipsOptions = [{ value: 'settings_shared_clips_emails_editor', label: 'Editor' }];
const notificationsOptions = [{ value: 'notifications_viewer', label: 'Viewer' }];
const vehicleCommissionsOptions = [{ value: 'settings_commission_editor', label: 'Editor' }];
const taskListOptions = [{ value: 'task_list_viewer', label: 'Viewer' }];

export const accessSelectMapper: { [key in AccessGroupsField]: AccessGroupsData } = {
  dashboard: dashboardOptions,
  leaderboard: leaderboardOptions,
  vehicles: vehiclesOptions,
  drivers: driversOptions,
  fleets: fleetsOptions,
  stream: streamOptions,
  events: eventsOptions,
  reviewed_events: reviewedEventsOptions,
  escalated_events: escalatedEventsOptions,
  archived_events: archivedEventsOptions,
  reports_top_driver: reportsTopDriverOptions,
  reports_mileage: reportsMileageOptions,
  reports_driving_time: reportsDrivingTimeOptions,
  reports_vehicle_issues: reportsVehicleIssuesOptions,
  reports_distance_driven: reportsDistanceDrivenOptions,
  reports_events: reportsEventsOptions,
  reports_accidents: reportsAccidentsOptions,
  reports_trips: reportsTripsOptions,
  reports_vehicles_checks: reportsVehiclesChecksOptions,
  reports_alarms: reportsAlarmsOptions,
  reports_vehicle_online_status: reportsVehicleOnlineStatusOptions,
  reports_user_logs: reportsUserLogsOptions,
  telematics: telematicsOptions,
  map_view: mapViewOptions,
  settings_profile: profileOptions,
  settings_notification_settings: notificationsSettingsOptions,
  settings_company_managements: companySettingsOptions,
  settings_fleet_management: fleetSettingsOptions,
  settings_role_management: roleSettingsOptions,
  settings_driver_managements: driverSettingsOptions,
  settings_driver_score_weights: driverScoreSettingsOptions,
  settings_automated_reports: automatedReportsOptions,
  settings_infotainment: infotainmentOptions,
  settings_vehicle_event_strategies: settingsVehicleEventStrategiesEditorOptions,
  settings_shared_clips_emails: sharedClipsOptions,
  settings_commission_editor: vehicleCommissionsOptions,
  notifications: notificationsOptions,
  task_list: taskListOptions
};
