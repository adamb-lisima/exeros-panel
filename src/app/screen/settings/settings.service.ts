import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { HttpResponse } from '../../service/http/http.model';
import { CompanyResponse, UserResponse } from '../../store/auth/auth.model';
import { AddVehicleBody, AssignVehicleBody, ChangePrivilegesBody, CompanyRolesParams, CompanyTreeParams, CompanyTreeResponse, CreateDriverBody, CreateEventStrategyRequest, CreateFleetBody, CreateInfotainmentBody, CreateRoleParams, CreateSafetyScoreProfileBody, CreateUpdateCompany, CreateUpdateDriver, CreateUpdateFleetAccess, CreateUpdateReportBody, CreateUpdateUser, CreateVehicleBody, CreateVehicleEventStrategyRequest, CreateVehicleEventStrategySimpleRequest, DriverParams, DriverResponse, DriversResponse, EventStrategy, EventStrategyParams, EventStrategyResponse, FleetAccessParams, FleetAccessResponse, FleetEventStrategyListParams, FleetEventStrategyListResponse, FleetResponse, InfotainmentParams, InfotainmentResponse, InfotainmentsResponse, MfaExecuteParams, MfaParams, NotificationsParams, NotificationsResponse, ReportItemParams, ReportItemResponse, ReportParams, ReportResponse, ReportsTreeResponse, SafetyScoreProfilesResponse, SharedClipsEmailsBody, SharedClipsEmailsElement, SingleReportResponse, SingleVehicleResponse, UpdateAuthBody, UpdateDriverBody, UpdateEventDefaultCameraChannelsBody, UpdateEventInNotificationBody, UpdateEventStrategyRequest, UpdateFleetEventStrategiesRequest, UpdateInfotainmentBody, UpdateNotificationBody, UpdatePasswordBody, UpdateSafetyScoreProfileBody, UpdateVehicleEventStrategyRequest, UserNotificationsElement, UserNotificationsResponse, UsersParams, UsersResponse, VehicleEventStrategyDetailResponse, VehicleEventStrategyResponse, VehicleParams, VehicleResponse, VehicleLookupResponse, ProviderResponse, CreateProviderBody, ProviderBody, ProviderParams, AdminBody, AdminResponse, CreateAdminBody, AdminParams, SingleAdminResponse, AssignVehicleStrategies, CompleteVehicleStrategies, ApplicationSettingsResponse, ApplicationSetting, ApplicationSettingResponse, ApplicationsSettingsParams } from './settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private readonly httpService: HttpService) {}

  fetchUser(id: number): Observable<UserResponse> {
    return this.httpService.get$(`users/${id}`);
  }

  createUser(body: CreateUpdateUser): Observable<any> {
    return this.httpService.post$(`users/create`, body);
  }

  fetchFleet(id: number): Observable<FleetResponse> {
    return this.httpService.get$(`fleets/${id}`);
  }

  createFleet(body: CreateFleetBody): Observable<any> {
    return this.httpService.post$(`fleets/create`, body);
  }

  updateFleet(id: number, body: CreateFleetBody): Observable<any> {
    return this.httpService.put$(`fleets/${id}/edit`, body);
  }

  updateFleetLogo(fleetId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpService.post$(`v2/fleets/${fleetId}/set-logo`, formData);
  }

  fetchCompany(id: number): Observable<CompanyResponse> {
    return this.httpService.get$(`v2/companies/${id}`);
  }

  createCompany(body: CreateUpdateCompany): Observable<CompanyResponse> {
    return this.httpService.post$(`v2/companies/create`, body);
  }

  updateCompany(id: number, body: CreateUpdateCompany): Observable<CompanyResponse> {
    return this.httpService.put$(`v2/companies/${id}/edit`, body);
  }

  updateCompanyLogo(companyId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpService.post$(`v2/companies/${companyId}/set-logo`, formData);
  }

  deleteCompany(id: number): Observable<any> {
    return this.httpService.delete$(`v2/companies/${id}/delete`);
  }

  createVehicle(body: CreateVehicleBody): Observable<any> {
    return this.httpService.post$(`vehicles/create`, body);
  }

  updateVehicle(id: number, body: CreateVehicleBody): Observable<any> {
    return this.httpService.put$(`vehicles/${id}/edit`, body);
  }

  assignVehicle(vehicleId: number, body: AssignVehicleBody): Observable<any> {
    return this.httpService.put$(`v2/vehicles/${vehicleId}/change-fleet`, body);
  }

  assignVehicleV2(fleetId: number, vehicle_ids: number[]): Observable<any> {
    return this.httpService.put$(
      `v2/fleets/${fleetId}/assign-vehicles`,
      {},
      {
        vehicle_ids
      }
    );
  }

  updateEventDefaultCameraChannels(vehicleId: number, body: UpdateEventDefaultCameraChannelsBody): Observable<any> {
    return this.httpService.put$(`v2/fleets/${vehicleId}/set-event-default-camera-channels`, body);
  }

  updateUser(id: number, body: CreateUpdateUser): Observable<UserResponse> {
    return this.httpService.put$(`users/${id}/edit`, body);
  }

  updateAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpService.post$('auth/user/set-avatar', formData);
  }

  updatePassword(body: UpdatePasswordBody): Observable<any> {
    return this.httpService.post$('auth/user/change-password', body);
  }

  updateAuthUser(body: UpdateAuthBody): Observable<any> {
    return this.httpService.post$('auth/user/update', body);
  }

  sendMfa(body: MfaParams): Observable<any> {
    return this.httpService.post$('v2/auth/user/send-mfa', body);
  }

  executeMfa(body: MfaExecuteParams): Observable<any> {
    return this.httpService.post$('v2/auth/user/execute-mfa', body);
  }

  changePrivileges(id: number, body: ChangePrivilegesBody): Observable<any> {
    return this.httpService.put$(`v2/users/${id}/change-privileges`, body);
  }

  resetPassword(id: number): Observable<any> {
    return this.httpService.put$(`v2/users/${id}/reset-user-password`, {});
  }

  resetMfa(id: number): Observable<any> {
    return this.httpService.put$(`v2/users/${id}/reset-user-mfa`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.httpService.delete$(`users/${id}/delete`);
  }

  createFleetAccess(body: CreateUpdateFleetAccess): Observable<any> {
    return this.httpService.post$(`v2/fleet-accesses/create`, body);
  }

  updateFleetAccess(id: number, body: CreateUpdateFleetAccess): Observable<FleetAccessResponse> {
    return this.httpService.put$(`v2/fleet-accesses/${id}/edit`, body);
  }

  deleteFleetAccess(id: number): Observable<any> {
    return this.httpService.delete$(`v2/fleet-accesses/${id}/delete`);
  }

  deleteFleet(id: number): Observable<any> {
    return this.httpService.delete$(`fleets/${id}/delete`);
  }

  fetchNotifications(params: NotificationsParams): Observable<NotificationsResponse> {
    return this.httpService.get$('v2/settings/notification-settings', params);
  }

  updateNotifications(body: UpdateNotificationBody): Observable<NotificationsResponse> {
    return this.httpService.post$('v2/settings/notification-settings', body);
  }

  fetchSharedClips(id: number): Observable<HttpResponse<SharedClipsEmailsElement>> {
    return this.httpService.get$(`v2/companies/${id}/show-shared-clips`);
  }

  updateSharedClips(body: SharedClipsEmailsBody): Observable<HttpResponse<SharedClipsEmailsElement>> {
    return this.httpService.post$(`v2/companies/${body.company_id}/edit-shared-clips`, body);
  }

  updateEventInNotifications(id: number, body: UpdateEventInNotificationBody): Observable<NotificationsResponse> {
    return this.httpService.post$(`v2/settings/notification-settings/${id}/edit-event`, body);
  }

  fetchSafetyScoreProfiles(): Observable<SafetyScoreProfilesResponse> {
    return this.httpService.get$('v2/safety-score-profiles', { page: 1, per_page: 99999 });
  }

  updateSafetyScoreProfile(id: number, body: UpdateSafetyScoreProfileBody): Observable<any> {
    return this.httpService.put$(`v2/safety-score-profiles/${id}/edit`, body);
  }

  createSafetyScoreProfile(body: CreateSafetyScoreProfileBody): Observable<any> {
    return this.httpService.post$(`v2/safety-score-profiles/create`, body);
  }

  deleteSafetyScoreProfile(id: number): Observable<any> {
    return this.httpService.delete$(`v2/safety-score-profiles/${id}/delete`);
  }

  assignSafetyScoreProfile(profileId: number, fleetId: number): Observable<any> {
    return this.httpService.put$(`v2/safety-score-profiles/${profileId}/${fleetId}/assign`, {});
  }

  restoreSafetyScoreProfile(profileId: number): Observable<any> {
    return this.httpService.put$(`v2/safety-score-profiles/${profileId}/restore-default`, {});
  }

  fetchUsers(params: UsersParams): Observable<UsersResponse> {
    return this.httpService.get$('users', params);
  }

  fetchCompaniesTree(params: CompanyTreeParams): Observable<CompanyTreeResponse> {
    return this.httpService.get$('v2/companies-tree', params);
  }

  fetchCompanyRoles(params: CompanyRolesParams): Observable<any> {
    return this.httpService.get$('v2/roles', params);
  }

  fetchAllRoles(params: Omit<CompanyRolesParams, 'company_id'>): Observable<any> {
    return this.httpService.get$('v2/roles', params);
  }

  createRole(params: CreateRoleParams): Observable<any> {
    return this.httpService.post$('v2/roles/create', params);
  }

  fetchRole(id: number): Observable<any> {
    return this.httpService.get$(`v2/roles/${id}`);
  }

  editRole(params: CreateRoleParams, id: number): Observable<any> {
    return this.httpService.put$(`v2/roles/${id}/edit`, params);
  }

  deleteRole(id: number): Observable<any> {
    return this.httpService.delete$(`v2/roles/${id}/delete`);
  }

  fetchFleetAccess(params: FleetAccessParams): Observable<FleetAccessResponse> {
    return this.httpService.get$('v2/fleet-accesses', params);
  }

  fetchDrivers(params: DriverParams): Observable<DriversResponse> {
    return this.httpService.get$(`drivers`, params);
  }

  addVehicle(id: number, params: AddVehicleBody): Observable<any> {
    return this.httpService.post$(`drivers/${id}/assign-vehicle`, params);
  }

  fetchDriver(id: number): Observable<DriverResponse> {
    return this.httpService.get$(`drivers/${id}`);
  }

  createDriver(body: CreateDriverBody | CreateUpdateDriver): Observable<any> {
    return this.httpService.post$(`drivers/create`, body);
  }

  updateDriver(id: number, body: UpdateDriverBody | CreateUpdateDriver): Observable<DriversResponse> {
    return this.httpService.put$(`drivers/${id}/edit`, body);
  }

  deleteDriver(id: number): Observable<any> {
    return this.httpService.delete$(`drivers/${id}/delete`);
  }

  fetchVehicles(params: VehicleParams): Observable<VehicleResponse> {
    return this.httpService.get$('vehicles', params);
  }

  fetchVehicle(id: number): Observable<SingleVehicleResponse> {
    return this.httpService.get$(`vehicles/${id}`);
  }

  deleteVechile(id: number): Observable<any> {
    return this.httpService.delete$(`vehicles/${id}/delete`);
  }

  fetchReports(params: ReportParams): Observable<ReportResponse> {
    return this.httpService.get$('v2/automated-reports', params);
  }

  fetchReportsTree(params: ReportParams): Observable<ReportsTreeResponse> {
    return this.httpService.get$('v2/automated-reports', params);
  }

  createReport(body: CreateUpdateReportBody): Observable<any> {
    return this.httpService.post$('v2/automated-reports/create', body);
  }

  deleteReport(id: number): Observable<any> {
    return this.httpService.delete$(`v2/automated-reports/${id}/delete`);
  }

  fetchReportsItems(params: ReportItemParams): Observable<ReportItemResponse> {
    return this.httpService.get$('v2/automated-report-items', params);
  }

  updateReport(id: number, body: CreateUpdateReportBody): Observable<ReportResponse> {
    return this.httpService.put$(`v2/automated-reports/${id}/edit`, body);
  }

  fetchReport(id: number): Observable<SingleReportResponse> {
    return this.httpService.get$(`v2/automated-reports/${id}`);
  }

  downloadReportsItems(url: string): Observable<Blob> {
    return this.httpService.getFile$(`v2/automated-reports/${url}`);
  }

  updateUserNotifications(id: number, body: UserNotificationsElement): Observable<UserNotificationsResponse> {
    return this.httpService.post$(`users/${id}/update-notifications`, body);
  }

  fetchUserNotifications(id: number): Observable<UserNotificationsResponse> {
    return this.httpService.get$(`users/${id}/notifications`);
  }

  fetchInfotainments(params: InfotainmentParams): Observable<InfotainmentsResponse> {
    return this.httpService.get$('v2/infotainment', params);
  }

  fetchInfotainment(id: number): Observable<InfotainmentResponse> {
    return this.httpService.get$(`v2/infotainment/${id}`);
  }

  createInfotainment(body: CreateInfotainmentBody): Observable<InfotainmentResponse> {
    return this.httpService.post$('v2/infotainment/create', body);
  }

  updateInfotainment(id: number, body: UpdateInfotainmentBody): Observable<InfotainmentResponse> {
    return this.httpService.put$(`v2/infotainment/${id}/edit`, body);
  }

  deleteInfotainment(id: number): Observable<any> {
    return this.httpService.delete$(`v2/infotainment/${id}/delete`);
  }

  fetchVehicleEventStrategies(vehicleId: number, page: number = 1, perPage: number = 15): Observable<VehicleEventStrategyResponse> {
    return this.httpService.get$('v2/vehicle-event-strategies', {
      vehicle_id: vehicleId,
      page,
      per_page: perPage
    });
  }

  fetchVehicleEventStrategy(id: number): Observable<VehicleEventStrategyDetailResponse> {
    return this.httpService.get$(`v2/vehicle-event-strategies/${id}`);
  }

  createVehicleEventStrategy(body: CreateVehicleEventStrategyRequest): Observable<VehicleEventStrategyDetailResponse> {
    return this.httpService.post$('v2/vehicle-event-strategies/create', body);
  }

  updateVehicleEventStrategy(id: number, body: UpdateVehicleEventStrategyRequest): Observable<VehicleEventStrategyDetailResponse> {
    return this.httpService.put$(`v2/vehicle-event-strategies/${id}/edit`, body);
  }

  deleteVehicleEventStrategy(id: number): Observable<any> {
    return this.httpService.delete$(`v2/vehicle-event-strategies/${id}/delete`);
  }

  lookupVehicle(regPlate: string): Observable<VehicleLookupResponse> {
    return this.httpService.get$(`vehicles/lookup`, { reg_plate: regPlate });
  }

  fetchEventStrategies(params: Partial<EventStrategyParams>): Observable<EventStrategyResponse> {
    return this.httpService.get$('v2/event-strategies', params);
  }

  fetchEventStrategy(id: number): Observable<{ data: EventStrategy }> {
    return this.httpService.get$(`v2/event-strategies/${id}`);
  }

  createEventStrategy(body: CreateEventStrategyRequest): Observable<{ data: EventStrategy }> {
    return this.httpService.post$('v2/event-strategies/create', body);
  }

  updateEventStrategy(id: number, body: UpdateEventStrategyRequest): Observable<{ data: EventStrategy }> {
    return this.httpService.put$(`v2/event-strategies/${id}/edit`, body);
  }

  deleteEventStrategy(id: number): Observable<any> {
    return this.httpService.delete$(`v2/event-strategies/${id}/delete`);
  }

  fetchFleetEventStrategies(params: Partial<FleetEventStrategyListParams>): Observable<FleetEventStrategyListResponse> {
    return this.httpService.get$('v2/fleet-event-strategies', params);
  }

  updateFleetEventStrategies(fleetId: number, body: UpdateFleetEventStrategiesRequest): Observable<any> {
    return this.httpService.post$(`v2/fleet-event-strategies/${fleetId}/edit`, body);
  }

  createVehicleEventStrategySimple(body: CreateVehicleEventStrategySimpleRequest): Observable<VehicleEventStrategyDetailResponse> {
    return this.httpService.post$('v2/vehicle-event-strategies/create', body);
  }

  validateVehicleStep(body: CreateVehicleBody, step: number): Observable<any> {
    return this.httpService.post$('vehicles/create', {
      ...body,
      only_validation: true,
      step: step
    });
  }

  validateVehicleEditStep(id: number, body: CreateVehicleBody, step: number): Observable<any> {
    return this.httpService.put$(`vehicles/${id}/edit`, {
      ...body,
      only_validation: true,
      step: step
    });
  }

  fetchProvidersList(params?: Partial<ProviderParams>): Observable<ProviderResponse> {
    return this.httpService.get$('providers', params);
  }

  createProvider(body: CreateProviderBody): Observable<ProviderResponse> {
    return this.httpService.post$(`v2/providers/create`, body);
  }

  updateProvider(id: number, body: CreateProviderBody): Observable<ProviderResponse> {
    return this.httpService.put$(`v2/providers/${id}/edit`, body);
  }

  getProviderDetail(id: number): Observable<ProviderBody> {
    return this.httpService.get$(`v2/providers/${id}`);
  }

  fetchAdminsList(params?: Partial<AdminParams>): Observable<AdminResponse> {
    return this.httpService.get$('v2/admins', params);
  }

  createAdmin(body: CreateAdminBody): Observable<SingleAdminResponse> {
    return this.httpService.post$(`v2/admins/create`, body);
  }

  updateAdmin(id: number, body: CreateAdminBody): Observable<SingleAdminResponse> {
    return this.httpService.post$(`v2/admins/${id}/edit`, body);
  }

  getAdminDetail(id: number): Observable<AdminBody> {
    return this.httpService.get$(`v2/admins/${id}`);
  }

  assignVehicleStrategies(vehicleId: number, body: AssignVehicleStrategies): Observable<any> {
    return this.httpService.put$(`v2/vehicles/${vehicleId}/strategies-assign`, body);
  }

  completeVehicleStrategies(vehicleId: number, body: CompleteVehicleStrategies): Observable<any> {
    return this.httpService.put$(`v2/vehicles/${vehicleId}/strategies-complete`, body);
  }

  getVehicleStrategiesReport(vehicleId: number): Observable<Blob> {
    return this.httpService.getFile$(`v2/vehicles/${vehicleId}/strategies-report`);
  }

  fetchApplicationSettings(params: ApplicationsSettingsParams): Observable<ApplicationSettingsResponse> {
    return this.httpService.get$('v2/application-settings', params);
  }

  createApplicationSetting(body: ApplicationSetting): Observable<ApplicationSettingResponse> {
    return this.httpService.post$('v2/application-settings', body);
  }

  fetchApplicationSetting(settingId: number | string): Observable<ApplicationSettingResponse> {
    return this.httpService.get$(`v2/application-settings/${settingId}`);
  }

  updateApplicationSetting(settingId: number | string, body: ApplicationSetting): Observable<ApplicationSettingResponse> {
    return this.httpService.put$(`v2/application-settings/${settingId}`, body);
  }

  fetchApplicationSettingByName(name: string): Observable<ApplicationSettingResponse> {
    return this.httpService.get$(`v2/application-settings/name/${name}`);
  }
}
