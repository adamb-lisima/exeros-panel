import { createAction, props } from '@ngrx/store';
import { UserData } from '../../store/auth/auth.model';
import { DriversTreeElement, DriversTreeParams, FleetsTreeElement, FleetsTreeParams, UsersTreeElement, UsersTreeParams, VehiclesTreeElement } from '../../store/common-objects/common-objects.model';
import { Vehicle } from '../vehicles/vehicles.model';
import { AddVehicleBody, AdminBody, AdminParams, AdminResponse, ApplicationSetting, ApplicationSettingsResponse, ApplicationsSettingsParams, AssignVehicleBody, AssignVehicleStrategies, ChangePrivilegesBody, CompanyElement, CompanyRolesParams, CompanyTreeParams, CompleteVehicleStrategies, CreateAdminBody, CreateDriverBody, CreateEventStrategyRequest, CreateFleetBody, CreateInfotainmentBody, CreateProviderBody, CreateRoleParams, CreateSafetyScoreProfileBody, CreateUpdateCompany, CreateUpdateDriver, CreateUpdateFleetAccess, CreateUpdateReportBody, CreateUpdateUser, CreateVehicleBody, CreateVehicleEventStrategyRequest, CreateVehicleEventStrategySimpleRequest, DriverElement, DriverParams, DriversResponse, EventStrategy, EventStrategyParams, EventStrategyResponse, Fleet, FleetAccess, FleetAccessParams, FleetAccessResponse, FleetEventStrategyListParams, FleetEventStrategyListResponse, Infotainment, InfotainmentParams, InfotainmentsResponse, MfaExecuteParams, MfaParams, NotificationsElement, NotificationsParams, ProviderBody, ProviderParams, ProviderResponse, Report, ReportItem, ReportItemParams, ReportItemResponse, ReportParams, ReportResponse, RoleElement, SafetyScoreProfilesElement, SafetyScoreProfilesParams, SharedClipsEmailsBody, SharedClipsEmailsElement, SingleAdminResponse, UpdateAuthBody, UpdateDriverBody, UpdateEventDefaultCameraChannelsBody, UpdateEventInNotificationBody, UpdateEventStrategyRequest, UpdateFleetEventStrategiesRequest, UpdateInfotainmentBody, UpdateNotificationBody, UpdatePasswordBody, UpdateSafetyScoreProfileBody, UpdateVehicleEventStrategyRequest, UserNotification, UserNotificationsElement, UsersParams, UsersResponse, VehicleElement, VehicleEventStrategy, VehicleEventStrategyResponse, VehicleParams, VehicleResponse } from './settings.model';

export const SettingsActions = {
  setUsersTreeParams: createAction('[Settings] SetUsersTreeParams', props<{ params: UsersTreeParams }>()),
  fetchUsersTree: createAction('[Settings] FetchUsersTree', props<{ params: Partial<UsersTreeParams> }>()),
  fetchUsersTreeSuccess: createAction('[Settings] FetchUsersTree Success', props<{ data: UsersTreeElement[] }>()),

  setUserLoading: createAction('[Settings] SetUserLoading', props<{ loading: boolean }>()),
  fetchUser: createAction('[Settings] FetchUser', props<{ id: number }>()),
  fetchUserSuccess: createAction('[Settings] FetchUser Success', props<{ data: UserData }>()),

  createUser: createAction('[Settings] CreateUser', props<{ body: CreateUpdateUser }>()),
  createUserSuccess: createAction('[Settings] CreateUser Success', props<{ data: UserData }>()),

  setFleetsTreeParams: createAction('[Settings] SetFleetsTreeParams', props<{ params: FleetsTreeParams }>()),
  fetchFleetsTree: createAction('[Settings] FetchFleetsTree', props<{ params: Partial<FleetsTreeParams> }>()),
  fetchFleetsTreeSuccess: createAction('[Settings] FetchFleetsTree Success', props<{ data: FleetsTreeElement[] }>()),

  setFleetLoading: createAction('[Settings] SetFleetLoading', props<{ loading: boolean }>()),
  fetchFleet: createAction('[Settings] FetchFleet', props<{ id: number }>()),
  fetchFleetSuccess: createAction('[Settings] FetchFleet Success', props<{ data: Fleet }>()),
  createFleet: createAction('[Settings] CreateFleet', props<{ body: CreateFleetBody }>()),
  createFleetSuccess: createAction('[Settings] CreateFleet Success', props<{ data: FleetsTreeElement[] }>()),

  updateFleet: createAction('[Settings] UpdateFleet', props<{ id: number; body: CreateFleetBody }>()),
  updateFleetSuccess: createAction('[Settings] UpdateFleet Success'),

  deleteFleet: createAction('[Settings] DeleteFleet', props<{ id: number }>()),
  deleteFleetSuccess: createAction('[Settings] DeleteFleet Success'),

  updateFleetLogo: createAction('[Settings] UpdateFleetLogo', props<{ fleetId: number; file: File }>()),
  updateFleetLogoSuccess: createAction('[Settings] UpdateFleetLogo Success', props<{ data: FleetsTreeElement[] }>()),

  createVehicle: createAction('[Settings] CreateVehicle', props<{ body: CreateVehicleBody }>()),
  createVehicleSuccess: createAction('[Settings] CreateVehicle Success', props<{ data: FleetsTreeElement[] }>()),

  updateVehicle: createAction('[Settings] UpdateVehicle', props<{ id: number; body: CreateVehicleBody }>()),
  updateVehicleSuccess: createAction('[Settings] UpdateVehicle Success', props<{ data: FleetsTreeElement[] }>()),

  assignVehicle: createAction('[Settings] AssignVehicle', props<{ vehicleId: number; body: AssignVehicleBody }>()),
  assignVehicleSuccess: createAction('[Settings] AssignVehicle Success', props<{ data: FleetsTreeElement[] }>()),

  assignVehicleV2: createAction('[Settings] AssignVehicleV2', props<{ fleetId: number; vehicleIds: number[] }>()),
  assignVehicleSuccessV2: createAction('[Settings] AssignVehicle SuccessV2'),

  updateEventDefaultCameraChannels: createAction('[Settings] UpdateEventDefaultCameraChannels', props<{ vehicleId: number; body: UpdateEventDefaultCameraChannelsBody }>()),
  updateEventDefaultCameraChannelsSuccess: createAction('[Settings] UpdateEventDefaultCameraChannels Success', props<{ data: FleetsTreeElement[] }>()),

  updateUser: createAction('[Settings] UpdateUser', props<{ id: number; body: CreateUpdateUser }>()),
  updateUserSuccess: createAction('[Settings] UpdateUser Success'),

  updateAuthUser: createAction('[Settings] UpdateAuthUser', props<{ body: UpdateAuthBody }>()),
  updateAuthUserSuccess: createAction('[Settings] UpdateAuthUserSuccess'),

  updateAvatar: createAction('[Settings] UpdateAvatar', props<{ file: File }>()),
  updateAvatarSuccess: createAction('[Settings] UpdateAvatar Success'),

  updatePassword: createAction('[Settings] UpdatePassword', props<{ body: UpdatePasswordBody }>()),
  updatePasswordSuccess: createAction('[Settings] UpdatePassword Success'),

  sendMfa: createAction('[Settings] SendMfa', props<{ body: MfaParams }>()),
  executeMfa: createAction('[Settings] ExecuteMfa', props<{ body: MfaExecuteParams }>()),
  executeMfaSuccess: createAction('[Settings] ExecuteMfa Success'),

  changePrivileges: createAction('[Settings] ChangePrivileges', props<{ id: number; body: ChangePrivilegesBody }>()),
  changePrivilegesSuccess: createAction('[Settings] ChangePrivileges Success', props<{ data: UsersTreeElement[] }>()),

  resetPassword: createAction('[Settings] ResetPassword', props<{ id: number }>()),
  resetPasswordSuccess: createAction('[Settings] ResetPassword Success', props<{ data: UsersTreeElement[] }>()),

  resetMfa: createAction('[Settings] ResetMfa', props<{ id: number }>()),
  resetMfaSuccess: createAction('[Settings] ResetMfa Success', props<{ data: UsersTreeElement[] }>()),

  deleteUser: createAction('[Settings] DeleteUser', props<{ id: number }>()),
  deleteUserSuccess: createAction('[Settings] DeleteUser Success', props<{ data: UsersTreeElement[] }>()),

  updateCompanyLogo: createAction('[Settings] UpdateCompanyLogo', props<{ companyId: number; file: File }>()),

  setCompanyLoading: createAction('[Settings] SetCompanyLoading', props<{ loading: boolean }>()),
  fetchCompany: createAction('[Settings] FetchCompany', props<{ id: number }>()),
  fetchCompanySuccess: createAction('[Settings] FetchCompanySuccess', props<{ data: CompanyElement }>()),

  deleteCompany: createAction('[Settings] DeleteCompany', props<{ id: number }>()),
  deleteCompanySuccess: createAction('[Settings] DeleteCompanySuccess', props<{ data: CompanyElement[] }>()),

  createCompany: createAction('[Settings] CreateCompany', props<{ body: CreateUpdateCompany }>()),
  updateCompanySuccess: createAction('[Settings] UpdateCompanySuccess', props<{ data: CompanyElement }>()),

  updateCompany: createAction('[Settings] UpdateCompany', props<{ id: number; body: CreateUpdateCompany }>()),

  createFleetAccess: createAction('[Settings] CreateFleetAccess', props<{ body: CreateUpdateFleetAccess }>()),
  createFleetAccessSuccess: createAction('[Settings] CreateFleetAccessSuccess'),

  updateFleetAccess: createAction('[Settings] UpdateFleetAccess', props<{ id: number; body: CreateUpdateFleetAccess }>()),
  updateFleetAccessSuccess: createAction('[Settings] UpdateFleetAccessSuccess'),

  deleteFleetAccess: createAction('[Settings] DeleteFleetAccess', props<{ id: number; company_id: number }>()),

  deleteFleetAccessSuccess: createAction('[Settings] DeleteFleetAccessSuccess', props<{ data: FleetAccess[] }>()),

  fetchNotifications: createAction('[Settings] FetchNotifications', props<{ params: NotificationsParams }>()),
  fetchNotificationsSuccess: createAction('[Settings] FetchNotificationsSuccess', props<{ data: NotificationsElement }>()),

  fetchSharedClips: createAction('[Settings] FetchSharedClips', props<{ company_id: number }>()),
  fetchSharedClipsSuccess: createAction('[Settings] FetchSharedClipsSuccess', props<{ data: SharedClipsEmailsElement }>()),
  updateSharedClips: createAction('[Settings] UpdateSharedClips', props<{ body: SharedClipsEmailsBody }>()),
  updateSharedClipsSuccess: createAction('[Settings] UpdateSharedClipsSuccess', props<{ data: SharedClipsEmailsElement }>()),

  updateNotifications: createAction('[Settings] UpdateNotifications', props<{ body: UpdateNotificationBody }>()),
  updateNotificationsSuccess: createAction('[Settings] UpdateNotificationsSuccess'),

  fetchSafetyScoreProfiles: createAction('[Settings] FetchSafetyScoreProfiles', props<{ params: SafetyScoreProfilesParams }>()),
  fetchSafetyScoreProfilesSuccess: createAction('[Settings] FetchSafetyScoreProfilesSuccess', props<{ data: SafetyScoreProfilesElement[] }>()),

  updateSafetyScoreProfile: createAction('[Settings] UpdateSafetyScoreProfile', props<{ id: number; body: UpdateSafetyScoreProfileBody }>()),
  updateSafetyScoreProfileSuccess: createAction('[Settings] UpdateSafetyScoreProfileSuccess', props<{ data: SafetyScoreProfilesElement[] }>()),

  createSafetyScoreProfile: createAction('[Settings] CreateSafetyScoreProfile', props<{ body: CreateSafetyScoreProfileBody }>()),
  createSafetyScoreProfileSuccess: createAction('[Settings] CreateSafetyScoreProfileSuccess', props<{ data: SafetyScoreProfilesElement[] }>()),

  deleteSafetyScoreProfile: createAction('[Settings] DeleteSafetyScoreProfile', props<{ id: number }>()),
  deleteSafetyScoreProfileSuccess: createAction('[Settings] DeleteSafetyScoreProfileSuccess'),

  assignSafetyScoreProfile: createAction('[Settings] AssignSafetyScoreProfile', props<{ profileId: number; fleetId: number }>()),
  assignSafetyScoreProfileSuccess: createAction('[Settings] AssignSafetyScoreProfileSuccess', props<{ data: FleetsTreeElement[] }>()),

  restoreSafetyScoreProfile: createAction('[Settings] RestoreSafetyScoreProfile', props<{ profile: SafetyScoreProfilesElement }>()),
  restoreSafetyScoreProfileSuccess: createAction('[Settings] RestoreSafetyScoreProfileSuccess', props<{ data: SafetyScoreProfilesElement[] }>()),

  setUsersResponseParams: createAction('[Settings] SetUsersResponseParams', props<{ params: UsersParams }>()),
  fetchUsersResponse: createAction('[Settings] fetchUsersResponse', props<{ params: Partial<UsersParams> }>()),
  fetchUsersResponseSuccess: createAction('[Settings] fetchUsersResponseSuccess', props<{ data: UsersResponse }>()),

  setFleetAccessParams: createAction('[Settings] setFleetAccessParams', props<{ params: FleetAccessParams }>()),
  fetchFleetAccessResponse: createAction('[Settings] fetchFleetAccessResponse', props<{ params: Partial<FleetAccessParams> }>()),
  fetchFleetAccessResponseSuccess: createAction('[Settings] fetchFleetAccessResponseSuccess', props<{ data: FleetAccessResponse }>()),

  createRole: createAction('[Settings] CreateRole', props<{ body: CreateRoleParams }>()),
  createRoleSuccess: createAction('[Settings] CreateRoleSuccess'),

  editRole: createAction('[Settings] EditRole', props<{ body: CreateRoleParams; id: number }>()),
  editRoleSuccess: createAction('[Settings] EditRoleSuccess'),

  fetchCompaniesTree: createAction('[Settings] FetchCompaniesTree', props<{ params: CompanyTreeParams }>()),
  fetchCompaniesTreeSuccess: createAction('[Settings] FetchCompaniesTreeSuccess', props<{ data: CompanyElement[] }>()),
  fetchCompaniesTreeReset: createAction('[Settings] FetchCompaniesTreeReset'),

  fetchCompanyRoles: createAction('[Settings] fetchCompanyRoles', props<{ params: CompanyRolesParams; onlySelect: boolean }>()),
  fetchCompanyRolesSuccess: createAction('[Settings] fetchCompanyRolesSuccess', props<{ data: RoleElement[]; onlySelect: boolean }>()),

  fetchCompaniesResponse: createAction('[Settings] fetchCompaniesResponse', props<{ params: Partial<CreateUpdateCompany> }>()),

  fetchAllRoles: createAction('[Settings] fetchAllRoles'),
  fetchAllRolesSuccess: createAction('[Settings] fetchAllRolesSuccess', props<{ data: RoleElement[] }>()),

  fetchRole: createAction('[Settings] fetchRole', props<{ id: number }>()),
  fetchRoleSuccess: createAction('[Settings] fetchRoleSuccess', props<{ data: RoleElement }>()),

  deleteRole: createAction('[Settings] deleteRole', props<{ id: number }>()),
  deleteRoleSuccess: createAction('[Settings] deleteRoleSuccess'),

  fetchVehicle: createAction('[Settings] fetchVehicle', props<{ id: number }>()),
  fetchVehicleSuccess: createAction('[Settings] fetchVehicleSuccess', props<{ data: Vehicle }>()),
  fetchVehicleReset: createAction('[Settings] fetchVehicleReset'),

  fetchFleetAccess: createAction('[Settings] fetchFleetAccess', props<{ params: FleetAccessParams }>()),
  fetchFleetAccessSuccess: createAction('[Settings] fetchFleetAccessSuccess', props<{ data: FleetAccess[] }>()),

  fetchFleetAccessFilter: createAction('[Settings] fetchFleetAccessFilter', props<{ params: FleetAccessParams }>()),
  fetchFleetAccessFilterSuccess: createAction('[Settings] fetchFleetAccessFilterSuccess', props<{ data: FleetAccess[] }>()),

  resetUser: createAction('[Settings] ResetUser'),
  resetFleet: createAction('[Settings] ResetFleet'),
  reset: createAction('[Settings] Reset'),

  setDriverResponseParams: createAction('[Settings] SetDriverResponseParams', props<{ params: DriverParams }>()),
  fetchDriverResponse: createAction('[Settings] fetchDriverResponse', props<{ params: Partial<DriverParams> }>()),
  fetchDriverResponseSuccess: createAction('[Settings] fetchDriverResponseSuccess', props<{ data: DriversResponse }>()),

  fetchDriver: createAction('[Settings] FetchDriver', props<{ id: number }>()),
  fetchDriverSuccess: createAction('[Settings] FetchDriverSuccess', props<{ data: DriverElement }>()),

  deleteDriver: createAction('[Settings] DeleteDriver', props<{ id: number }>()),
  deleteDriverSuccess: createAction('[Settings] DeleteDriverSuccess', props<{ data: DriversTreeElement[] }>()),

  createDriver: createAction('[Settings] CreateDriver', props<{ body: CreateDriverBody | CreateUpdateDriver }>()),
  createDriverSuccess: createAction('[Settings] CreateDriverSuccess', props<{ data: DriversTreeElement[] }>()),

  updateDriver: createAction('[Settings] UpdateDriver', props<{ id: number; body: UpdateDriverBody | CreateUpdateDriver }>()),
  updateDriverSuccess: createAction('[Settings] UpdateDriverSuccess'),
  //updateDriverSuccess: createAction('[Settings] UpdateDriverSuccess', props<{ data: DriverElement }>()),

  fetchDriversTree: createAction('[Settings] FetchDriversTree', props<{ params: Partial<DriversTreeParams> }>()),
  fetchDriversTreeSuccess: createAction('[Settings] FetchDriversTree Success', props<{ data: DriversTreeElement[] }>()),
  setDriversTreeParams: createAction('[Settings] SetDriversTreeParams', props<{ params: DriversTreeParams }>()),

  updateEventInNotifications: createAction('[Settings] UpdateEventInNotifications', props<{ id: number; body: UpdateEventInNotificationBody }>()),
  updateEventInNotificationsSuccess: createAction('[Settings] UpdateEventInNotificationsSuccess'),

  setVehicleResponseParams: createAction('[Settings] SetVehicleResponseParams', props<{ params: VehicleParams }>()),
  fetchVehicleResponse: createAction('[Settings] fetchVehicleResponse', props<{ params: Partial<VehicleParams> }>()),
  fetchVehicleResponseSuccess: createAction('[Settings] fetchVehicleResponseSuccess', props<{ data: VehicleResponse }>()),

  deleteVehicle: createAction('[Settings] deleteVehicle', props<{ id: number }>()),
  deleteVehicleSuccess: createAction('[Settings] deleteVehicleSuccess', props<{ data: VehiclesTreeElement[] }>()),

  addVehicle: createAction('[Settings] AddVehicle', props<{ id: number; body: AddVehicleBody }>()),
  addVehicleSuccess: createAction('[Settings] AddVehicle Success'),

  setReportResponseParams: createAction('[Settings] SetReportResponseParams', props<{ params: ReportParams }>()),
  fetchReportResponse: createAction('[Settings] fetchReportResponse', props<{ params: Partial<ReportParams> }>()),
  fetchReportResponseSuccess: createAction('[Settings] fetchReportResponseSuccess', props<{ data: ReportResponse }>()),

  fetchReport: createAction('[Settings] fetchReport', props<{ id: number }>()),
  fetchReportSuccess: createAction('[Settings] fetchReportSuccess', props<{ data: Report }>()),
  fetchReportReset: createAction('[Settings] fetchReportReset'),

  createReport: createAction('[Settings] CreateReport', props<{ body: CreateUpdateReportBody }>()),
  createReportSuccess: createAction('[Settings] CreateReportSuccess', props<{ data: ReportParams[] }>()),

  deleteReport: createAction('[Settings] DeleteReport', props<{ id: number }>()),
  deleteReportSuccess: createAction('[Settings] DeleteReportSuccess', props<{ data: ReportParams[] }>()),

  setReportItemResponseParams: createAction('[Settings] SetReportItemResponseParams', props<{ params: ReportItemParams }>()),
  fetchReportItemResponse: createAction('[Settings] fetchReportItemResponse', props<{ params: Partial<ReportItemParams> }>()),
  fetchReportItemResponseSuccess: createAction('[Settings] fetchReportItemResponseSuccess', props<{ data: ReportItemResponse }>()),

  fetchReportItem: createAction('[Settings] FetchReportItem', props<{ id: number }>()),
  fetchReportItemSuccess: createAction('[Settings] fetchReportItemSuccess', props<{ data: ReportItem }>()),

  updateReport: createAction('[Settings] UpdateReport', props<{ id: number; body: CreateUpdateReportBody }>()),
  updateReportSuccess: createAction('[Settings] UpdateReportSuccess'),

  updateUserNotifications: createAction('[Settings] UpdateUserNotifications', props<{ id: number; body: UserNotificationsElement }>()),

  updateUserNotificationsSuccess: createAction('[Settings] UpdateUserNotificationsSuccess', props<{ data: UserNotification[] }>()),

  updateUserNotificationsFailure: createAction('[Settings] UpdateUserNotificationsFailure', props<{ error: any }>()),

  fetchUserNotifications: createAction('[Settings] FetchUserNotifications', props<{ id: number }>()),

  fetchUserNotificationsSuccess: createAction('[Settings] FetchUserNotificationsSuccess', props<{ data: UserNotificationsElement }>()),

  setUserNotificationsLoading: createAction('[Settings] SetUserNotificationsLoading', props<{ loading: boolean }>()),

  setInfotainmentParams: createAction('[Settings] SetInfotainmentParams', props<{ params: InfotainmentParams }>()),

  fetchInfotainments: createAction('[Settings] FetchInfotainments', props<{ params: Partial<InfotainmentParams> }>()),
  fetchInfotainmentsSuccess: createAction('[Settings] FetchInfotainmentsSuccess', props<{ data: InfotainmentsResponse }>()),

  fetchInfotainment: createAction('[Settings] FetchInfotainment', props<{ id: number }>()),
  fetchInfotainmentSuccess: createAction('[Settings] FetchInfotainmentSuccess', props<{ data: Infotainment }>()),

  createInfotainment: createAction('[Settings] CreateInfotainment', props<{ body: CreateInfotainmentBody }>()),
  createInfotainmentSuccess: createAction('[Settings] CreateInfotainmentSuccess', props<{ data: Infotainment }>()),

  updateInfotainment: createAction('[Settings] UpdateInfotainment', props<{ id: number; body: UpdateInfotainmentBody }>()),
  updateInfotainmentSuccess: createAction('[Settings] UpdateInfotainmentSuccess', props<{ data: Infotainment }>()),

  deleteInfotainment: createAction('[Settings] DeleteInfotainment', props<{ id: number }>()),
  deleteInfotainmentSuccess: createAction('[Settings] DeleteInfotainmentSuccess'),

  resetInfotainment: createAction('[Settings] ResetInfotainment'),

  fetchVehicleEventStrategies: createAction('[Settings] FetchVehicleEventStrategies', props<{ vehicleId: number; page?: number; perPage?: number }>()),
  fetchVehicleEventStrategiesSuccess: createAction('[Settings] FetchVehicleEventStrategiesSuccess', props<{ data: VehicleEventStrategyResponse }>()),

  fetchVehicleEventStrategy: createAction('[Settings] FetchVehicleEventStrategy', props<{ id: number }>()),
  fetchVehicleEventStrategySuccess: createAction('[Settings] FetchVehicleEventStrategySuccess', props<{ data: VehicleEventStrategy }>()),

  createVehicleEventStrategy: createAction('[Settings] CreateVehicleEventStrategy', props<{ body: CreateVehicleEventStrategyRequest }>()),
  createVehicleEventStrategySuccess: createAction('[Settings] CreateVehicleEventStrategySuccess', props<{ data: VehicleEventStrategy }>()),

  updateVehicleEventStrategy: createAction('[Settings] UpdateVehicleEventStrategy', props<{ id: number; body: UpdateVehicleEventStrategyRequest }>()),
  updateVehicleEventStrategySuccess: createAction('[Settings] UpdateVehicleEventStrategySuccess', props<{ data: VehicleEventStrategy }>()),

  deleteVehicleEventStrategy: createAction('[Settings] DeleteVehicleEventStrategy', props<{ id: number }>()),
  deleteVehicleEventStrategySuccess: createAction('[Settings] DeleteVehicleEventStrategySuccess'),

  resetVehicleEventStrategies: createAction('[Settings] ResetVehicleEventStrategies'),

  setVehicleLookupLoading: createAction('[Settings] SetVehicleLookupLoading', props<{ loading: boolean }>()),
  lookupVehicle: createAction('[Settings] LookupVehicle', props<{ regPlate: string }>()),
  lookupVehicleSuccess: createAction('[Settings] LookupVehicleSuccess', props<{ data: Vehicle }>()),
  resetVehicleLookup: createAction('[Settings] ResetVehicleLookup'),

  setEventStrategyResponseParams: createAction('[Settings] SetEventStrategyResponseParams', props<{ params: EventStrategyParams }>()),
  fetchEventStrategiesResponse: createAction('[Settings] fetchEventStrategiesResponse', props<{ params: Partial<EventStrategyParams> }>()),
  fetchEventStrategiesResponseSuccess: createAction('[Settings] fetchEventStrategiesResponseSuccess', props<{ data: EventStrategyResponse }>()),

  fetchEventStrategy: createAction('[Settings] fetchEventStrategy', props<{ id: number }>()),
  fetchEventStrategySuccess: createAction('[Settings] fetchEventStrategySuccess', props<{ data: EventStrategy }>()),
  fetchEventStrategyReset: createAction('[Settings] fetchEventStrategyReset'),

  createEventStrategy: createAction('[Settings] createEventStrategy', props<{ body: CreateEventStrategyRequest }>()),
  createEventStrategySuccess: createAction('[Settings] createEventStrategySuccess', props<{ data: EventStrategy }>()),

  updateEventStrategy: createAction('[Settings] updateEventStrategy', props<{ id: number; body: UpdateEventStrategyRequest }>()),
  updateEventStrategySuccess: createAction('[Settings] updateEventStrategySuccess', props<{ data: EventStrategy }>()),

  deleteEventStrategy: createAction('[Settings] deleteEventStrategy', props<{ id: number }>()),
  deleteEventStrategySuccess: createAction('[Settings] deleteEventStrategySuccess'),

  setFleetEventStrategyListParams: createAction('[Settings] SetFleetEventStrategyListParams', props<{ params: FleetEventStrategyListParams }>()),
  fetchFleetEventStrategies: createAction('[Settings] fetchFleetEventStrategies', props<{ params: Partial<FleetEventStrategyListParams> }>()),
  fetchFleetEventStrategiesSuccess: createAction('[Settings] fetchFleetEventStrategiesSuccess', props<{ data: FleetEventStrategyListResponse }>()),

  updateFleetEventStrategies: createAction('[Settings] updateFleetEventStrategies', props<{ fleetId: number; body: UpdateFleetEventStrategiesRequest }>()),
  updateFleetEventStrategiesSuccess: createAction('[Settings] updateFleetEventStrategiesSuccess'),

  createVehicleEventStrategySimple: createAction('[Settings] CreateVehicleEventStrategySimple', props<{ body: CreateVehicleEventStrategySimpleRequest }>()),
  createVehicleEventStrategySimpleSuccess: createAction('[Settings] CreateVehicleEventStrategySimpleSuccess', props<{ data: VehicleEventStrategy }>()),

  validateVehicleStep: createAction('[Settings] ValidateVehicleStep', props<{ body: CreateVehicleBody; step: number }>()),
  validateVehicleStepSuccess: createAction('[Settings] ValidateVehicleStepSuccess', props<{ data: any; step: number }>()),

  validateVehicleEditStep: createAction('[Settings] ValidateVehicleEditStep', props<{ id: number; body: CreateVehicleBody; step: number }>()),

  fetchProvidersList: createAction('[Settings] fetchProvidersList', props<{ params?: Partial<ProviderParams> }>()),
  fetchProvidersListSuccess: createAction('[Settings] fetchProvidersListSuccess', props<{ data: ProviderResponse }>()),

  createProvider: createAction('[Settings] createProvider', props<{ body: CreateProviderBody }>()),
  createProviderSuccess: createAction('[Settings] createProviderSuccess', props<{ data: ProviderResponse }>()),

  fetchProviderDetail: createAction('[Settings] fetchProviderDetail', props<{ id: number }>()),

  fetchProviderDetailSuccess: createAction('[Settings] fetchProviderDetailSuccess', props<{ data: ProviderBody }>()),

  updateProvider: createAction('[Settings] updateProvider', props<{ id: number; body: CreateProviderBody }>()),
  updateProviderSuccess: createAction('[Settings] updateProviderSuccess', props<{ data: ProviderResponse }>()),
  resetProviderDetail: createAction('[Settings] resetProviderDetail'),
  providerResponseParams: createAction('[Settings] providerResponseParams', props<{ params: ProviderParams }>()),

  fetchAdminsList: createAction('[Settings] fetchAdminsList', props<{ params: Partial<AdminParams> }>()),
  fetchAdminsListSuccess: createAction('[Settings] fetchAdminsListSuccess', props<{ data: AdminResponse }>()),
  fetchAdminsListFailure: createAction('[Settings] fetchAdminsListFailure', props<{ error: any }>()),

  fetchAdminDetail: createAction('[Settings] fetchAdminDetail', props<{ id: number }>()),
  fetchAdminDetailSuccess: createAction('[Settings] fetchAdminDetailSuccess', props<{ data: AdminBody }>()),
  createAdmin: createAction('[Settings] createAdmin', props<{ body: CreateAdminBody }>()),
  createAdminSuccess: createAction('[Settings] createAdminSuccess', props<{ data: SingleAdminResponse }>()),
  updateAdmin: createAction('[Settings] updateAdmin', props<{ id: number; body: CreateAdminBody }>()),
  updateAdminSuccess: createAction('[Settings] updateAdminSuccess', props<{ data: SingleAdminResponse }>()),

  resetAdminDetail: createAction('[Settings] resetAdminDetail'),

  assignVehicleStrategies: createAction('[Settings] AssignVehicleStrategies', props<{ vehicleId: number; body: AssignVehicleStrategies }>()),
  assignVehicleStrategiesSuccess: createAction('[Settings] AssignVehicleStrategiesSuccess', props<{ vehicleId: number }>()),
  completeVehicleStrategies: createAction('[Settings] CompleteVehicleStrategies', props<{ vehicleId: number; body: CompleteVehicleStrategies }>()),
  completeVehicleStrategiesSuccess: createAction('[Settings] CompleteVehicleStrategiesSuccess', props<{ vehicleId: number }>()),
  getVehicleStrategiesReport: createAction('[Settings] GetVehicleStrategiesReport', props<{ vehicleId: number }>()),
  getVehicleStrategiesReportSuccess: createAction('[Settings] GetVehicleStrategiesReportSuccess', props<{ vehicleId: number; reportBlob: Blob }>()),

  setCreatedVehicleId: createAction('[Settings] SetCreatedVehicleId', props<{ id: number }>()),
  setCreatedVehicle: createAction('[Settings] SetCreatedVehicle', props<{ vehicle: VehicleElement }>()),

  setApplicationSettingsParams: createAction('[Settings] SetApplicationSettingsParams', props<{ params: { page?: number; per_page?: number } }>()),

  fetchApplicationSettings: createAction('[Settings] FetchApplicationSettings', props<{ params: Partial<ApplicationsSettingsParams> }>()),
  fetchApplicationSettingsSuccess: createAction('[Settings] FetchApplicationSettingsSuccess', props<{ data: ApplicationSettingsResponse }>()),

  fetchApplicationSetting: createAction('[Settings] FetchApplicationSetting', props<{ id: number | string }>()),
  fetchApplicationSettingSuccess: createAction('[Settings] FetchApplicationSettingSuccess', props<{ data: ApplicationSetting }>()),

  fetchApplicationSettingByName: createAction('[Settings] FetchApplicationSettingByName', props<{ name: string }>()),
  fetchApplicationSettingByNameSuccess: createAction('[Settings] FetchApplicationSettingByNameSuccess', props<{ data: ApplicationSetting }>()),

  createApplicationSetting: createAction('[Settings] CreateApplicationSetting', props<{ body: ApplicationSetting }>()),
  createApplicationSettingSuccess: createAction('[Settings] CreateApplicationSettingSuccess', props<{ data: ApplicationSetting }>()),

  updateApplicationSetting: createAction('[Settings] UpdateApplicationSetting', props<{ id: number | string; body: ApplicationSetting }>()),
  updateApplicationSettingSuccess: createAction('[Settings] UpdateApplicationSettingSuccess', props<{ data: ApplicationSetting }>()),

  resetApplicationSetting: createAction('[Settings] ResetApplicationSetting')
};
