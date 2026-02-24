import { createReducer, on } from '@ngrx/store';
import { UserData } from '../../store/auth/auth.model';
import { DriversTreeElement, DriversTreeParams, FleetsTreeElement, FleetsTreeParams, UsersTreeElement, UsersTreeParams, VehiclesTreeElement } from '../../store/common-objects/common-objects.model';
import { Vehicle } from '../vehicles/vehicles.model';
import { SettingsActions } from './settings.actions';
import { AdminBody, AdminParams, AdminResponse, ApplicationSetting, ApplicationSettingsResponse, CompanyElement, CreateUpdateCompany, DriverElement, DriverParams, DriversResponse, EventStrategy, EventStrategyParams, EventStrategyResponse, Fleet, FleetAccess, FleetAccessParams, FleetAccessResponse, FleetEventStrategyListParams, FleetEventStrategyListResponse, Infotainment, InfotainmentParams, InfotainmentsResponse, NotificationsElement, ProviderBody, ProviderParams, ProviderResponse, Report, ReportItem, ReportItemParams, ReportItemResponse, ReportParams, ReportResponse, RoleElement, SafetyScoreProfilesElement, SettingsModuleList, SharedClipsEmailsElement, UserNotificationsElement, UsersParams, UsersResponse, VehicleElement, VehicleEventStrategy, VehicleEventStrategyResponse, VehicleParams, VehicleResponse, VehicleTreeParams } from './settings.model';

export const SETTINGS_FEATURE_KEY = 'settings';

export interface SettingsState {
  fleetAdminIdModules: { [module in SettingsModuleList]?: number };

  usersTreeParams: UsersTreeParams;
  usersTree: UsersTreeElement[];

  userLoading: boolean;
  user: UserData | undefined;

  notifications: NotificationsElement | undefined;

  fleetsTreeParams: FleetsTreeParams;
  fleetsTree: FleetsTreeElement[];

  fleetLoading: boolean;
  fleet: Fleet | undefined;

  safetyScoreProfiles: SafetyScoreProfilesElement[];

  usersResponse: UsersResponse | undefined;
  usersResponseParams: UsersParams;

  companyLoading: boolean;
  companyElements: CompanyElement[];
  companyElement: CompanyElement | undefined;
  createUpdateCompany: CreateUpdateCompany | undefined;
  companyRoles: RoleElement[];
  companyRolesSelect: RoleElement[];

  allRoles: RoleElement[];

  role: RoleElement | undefined;

  fleetAccess: FleetAccess[];
  fleetAccessFilter: FleetAccess[];

  driverResponse: DriversResponse | undefined;
  driverResponseParams: DriverParams;

  driver: DriverElement | undefined;

  driversTreeParams: DriversTreeParams;
  driversTree: DriversTreeElement[];

  vehicleTreeParams: VehicleTreeParams;
  vehicleTree: VehiclesTreeElement[];

  fleetAccessResponse: FleetAccessResponse | undefined;
  fleetAccessResponseParams: FleetAccessParams;

  vehicleResponse: VehicleResponse | undefined;
  vehicleResponseParams: VehicleParams;

  vehicle: Vehicle | undefined;

  reportResponse: ReportResponse | undefined;
  reportResponseParams: ReportParams;

  report: Report | undefined;
  reportItem: ReportItem | undefined;

  reportsTreeParams: ReportParams;

  reportItemResponse: ReportItemResponse | undefined;
  reportItemResponseParams: ReportItemParams;

  userNotifications: UserNotificationsElement | undefined;
  userNotificationsLoading: boolean;

  infotainmentLoading: boolean;
  infotainment: Infotainment | undefined;
  infotainments: InfotainmentsResponse | undefined;
  infotainmentParams: InfotainmentParams;

  vehicleEventStrategies: VehicleEventStrategyResponse | undefined;
  vehicleEventStrategy: VehicleEventStrategy | undefined;
  vehicleEventStrategiesLoading: boolean;

  sharedClipsEmails: SharedClipsEmailsElement | undefined;

  vehicleLookupLoading: boolean;
  vehicleLookupResult: Vehicle | undefined;

  vehicleStepValidation: {
    loading: boolean;
    currentStep: number;
    stepsValid: { [step: number]: boolean };
  };

  eventStrategiesResponseParams: EventStrategyParams;
  eventStrategiesResponse: EventStrategyResponse | null;
  eventStrategiesLoading: boolean;
  eventStrategy: EventStrategy | null;
  eventStrategyLoading: boolean;

  fleetEventStrategiesListParams: FleetEventStrategyListParams;
  fleetEventStrategiesList: FleetEventStrategyListResponse | null;
  fleetEventStrategiesLoading: boolean;

  providerResponse: ProviderResponse | undefined;
  providerDetail: ProviderBody | null;
  providerParams: ProviderParams;

  adminsResponse: AdminResponse | undefined;
  adminResponseParams: AdminParams;
  adminDetail: AdminBody | null;

  vehicleStrategiesLoading: boolean;
  vehicleStrategiesReport: Blob | null;
  vehicleStrategiesReportLoading: boolean;

  createdVehicleId: number | null;
  createdVehicle: VehicleElement | null;

  applicationSettingsParams: { page: number; per_page: number };
  applicationSettingsResponse: ApplicationSettingsResponse | undefined;
  applicationSettingsLoading: boolean;
  applicationSetting: ApplicationSetting | undefined;
  applicationSettingLoading: boolean;
}

export const settingsInitialState: SettingsState = {
  fleetAdminIdModules: {},

  usersTreeParams: { roles: 'FLEET_USER' },
  usersTree: [],

  userLoading: false,
  user: undefined,

  notifications: undefined,

  fleetsTreeParams: { show_vehicles: true, with_profiles: true },
  fleetsTree: [],

  fleetLoading: false,
  fleet: undefined,

  safetyScoreProfiles: [],

  usersResponse: undefined,
  usersResponseParams: {
    page: 1,
    per_page: 10
  },

  driverResponse: undefined,

  driverResponseParams: {
    page: 1,
    per_page: 10
  },

  fleetAccessResponse: undefined,
  fleetAccessResponseParams: {
    company_id: 1,
    page: 1,
    per_page: 10
  },

  companyLoading: false,
  companyElements: [],
  companyElement: undefined,

  companyRoles: [],
  companyRolesSelect: [],

  allRoles: [],

  role: undefined,

  fleetAccess: [],
  fleetAccessFilter: [],

  driver: undefined,

  createUpdateCompany: undefined,

  driversTreeParams: { company_id: '' },
  driversTree: [],

  vehicleTreeParams: { fleet_id: '' },
  vehicleTree: [],

  vehicleResponse: undefined,
  vehicleResponseParams: {
    page: 1,
    per_page: 10
  },

  vehicle: undefined,

  reportResponse: undefined,
  reportResponseParams: {
    page: 1,
    per_page: 10,
    id: 1
  },

  report: undefined,
  reportsTreeParams: { status: '', page: 1, per_page: 10, id: 1 },

  reportItemResponse: undefined,
  reportItemResponseParams: {
    page: 1,
    per_page: 10
  },

  reportItem: undefined,

  userNotifications: undefined,
  userNotificationsLoading: false,

  infotainmentLoading: false,
  infotainment: undefined,
  infotainments: undefined,
  infotainmentParams: {
    page: 1,
    per_page: 10
  },

  vehicleEventStrategies: undefined,
  vehicleEventStrategy: undefined,
  vehicleEventStrategiesLoading: false,

  sharedClipsEmails: undefined,

  eventStrategiesResponseParams: { page: 1, per_page: 10 },
  eventStrategiesResponse: null,
  eventStrategiesLoading: false,
  eventStrategy: null,
  eventStrategyLoading: false,

  fleetEventStrategiesListParams: { page: 1, per_page: 10 },
  fleetEventStrategiesList: null,
  fleetEventStrategiesLoading: false,

  vehicleLookupLoading: false,
  vehicleLookupResult: undefined,

  vehicleStepValidation: {
    loading: false,
    currentStep: 1,
    stepsValid: {}
  },

  providerResponse: undefined,
  providerDetail: null,
  providerParams: {
    page: 1,
    per_page: 10
  },

  adminsResponse: undefined,
  adminResponseParams: { page: 1, per_page: 15 },
  adminDetail: null,

  vehicleStrategiesLoading: false,
  vehicleStrategiesReport: null,
  vehicleStrategiesReportLoading: false,

  createdVehicleId: null,
  createdVehicle: null,

  applicationSettingsParams: {
    page: 1,
    per_page: 10
  },
  applicationSettingsResponse: undefined,
  applicationSettingsLoading: false,
  applicationSetting: undefined,
  applicationSettingLoading: false
};

export const settingsReducer = createReducer(
  settingsInitialState,

  on(SettingsActions.setUsersTreeParams, (state, { params }): SettingsState => ({ ...state, usersTreeParams: params })),
  on(SettingsActions.fetchUsersTreeSuccess, (state, { data }): SettingsState => ({ ...state, usersTree: data })),

  on(SettingsActions.setUserLoading, (state, { loading }): SettingsState => ({ ...state, userLoading: loading })),
  on(SettingsActions.fetchUserSuccess, (state, { data }): SettingsState => ({ ...state, user: data })),

  on(SettingsActions.createUserSuccess, (state, { data }): SettingsState => ({ ...state, user: data })),

  on(SettingsActions.setFleetsTreeParams, (state, { params }): SettingsState => ({ ...state, fleetsTreeParams: params })),
  on(SettingsActions.fetchFleetsTreeSuccess, (state, { data }): SettingsState => ({ ...state, fleetsTree: data })),

  on(SettingsActions.setFleetLoading, (state, { loading }): SettingsState => ({ ...state, fleetLoading: loading })),
  on(SettingsActions.fetchFleetSuccess, (state, { data }): SettingsState => ({ ...state, fleet: data })),

  on(SettingsActions.createFleetSuccess, (state, { data }): SettingsState => ({ ...state, fleetsTree: data })),

  on(SettingsActions.updateFleetLogoSuccess, (state, { data }): SettingsState => ({ ...state, fleetsTree: data })),

  on(SettingsActions.setCompanyLoading, (state, { loading }): SettingsState => ({ ...state, companyLoading: loading })),
  on(SettingsActions.fetchCompanySuccess, (state, { data }): SettingsState => ({ ...state, companyElement: data })),

  on(SettingsActions.updateCompanySuccess, (state, { data }): SettingsState => ({ ...state, companyElement: data })),

  on(SettingsActions.createVehicleSuccess, (state, { data }): SettingsState => ({ ...state, fleetsTree: data })),

  on(SettingsActions.updateVehicleSuccess, (state, { data }): SettingsState => ({ ...state, fleetsTree: data })),

  on(SettingsActions.assignVehicleSuccess, (state, { data }): SettingsState => ({ ...state, fleetsTree: data })),

  on(SettingsActions.updateEventDefaultCameraChannelsSuccess, (state, { data }): SettingsState => ({ ...state, fleetsTree: data })),

  on(SettingsActions.changePrivilegesSuccess, (state, { data }): SettingsState => ({ ...state, usersTree: data })),

  on(SettingsActions.resetPasswordSuccess, (state, { data }): SettingsState => ({ ...state, usersTree: data })),

  on(SettingsActions.deleteUserSuccess, (state, { data }): SettingsState => ({ ...state, usersTree: data })),

  on(SettingsActions.fetchNotificationsSuccess, (state, { data }): SettingsState => ({ ...state, notifications: data })),

  on(SettingsActions.fetchSafetyScoreProfilesSuccess, (state, { data }): SettingsState => ({ ...state, safetyScoreProfiles: data })),

  on(SettingsActions.updateSafetyScoreProfileSuccess, (state, { data }): SettingsState => ({ ...state, safetyScoreProfiles: data })),

  on(SettingsActions.createSafetyScoreProfileSuccess, (state, { data }): SettingsState => ({ ...state, safetyScoreProfiles: data })),

  on(SettingsActions.assignSafetyScoreProfileSuccess, (state, { data }): SettingsState => ({ ...state, fleetsTree: data })),

  on(SettingsActions.restoreSafetyScoreProfileSuccess, (state, { data }): SettingsState => ({ ...state, safetyScoreProfiles: data })),

  on(SettingsActions.setUsersResponseParams, (state, { params }): SettingsState => ({ ...state, usersResponseParams: params })),
  on(SettingsActions.fetchUsersResponseSuccess, (state, { data }): SettingsState => ({ ...state, usersResponse: data })),

  on(SettingsActions.setFleetAccessParams, (state, { params }): SettingsState => ({ ...state, fleetAccessResponseParams: params })),
  on(SettingsActions.fetchFleetAccessResponseSuccess, (state, { data }): SettingsState => ({ ...state, fleetAccessResponse: data })),

  on(SettingsActions.fetchCompaniesTreeSuccess, (state, { data }): SettingsState => ({ ...state, companyElements: data })),
  on(SettingsActions.fetchCompaniesTreeReset, (state): SettingsState => ({ ...state, companyElements: [] })),

  on(SettingsActions.fetchCompanyRolesSuccess, (state, { data, onlySelect }): SettingsState => (onlySelect ? { ...state, companyRolesSelect: data } : { ...state, companyRoles: data, companyRolesSelect: data })),

  on(SettingsActions.fetchAllRolesSuccess, (state, { data }): SettingsState => ({ ...state, allRoles: data })),

  on(SettingsActions.fetchRoleSuccess, (state, { data }): SettingsState => ({ ...state, role: data })),

  on(SettingsActions.fetchFleetAccessSuccess, (state, { data }): SettingsState => ({ ...state, fleetAccess: data })),
  on(SettingsActions.fetchFleetAccessFilterSuccess, (state, { data }): SettingsState => ({ ...state, fleetAccessFilter: data })),

  on(SettingsActions.setDriverResponseParams, (state, { params }): SettingsState => ({ ...state, driverResponseParams: params })),
  on(SettingsActions.fetchDriverResponseSuccess, (state, { data }): SettingsState => ({ ...state, driverResponse: data })),

  on(SettingsActions.fetchDriverSuccess, (state, { data }): SettingsState => ({ ...state, driver: data })),

  on(SettingsActions.setVehicleResponseParams, (state, { params }): SettingsState => ({ ...state, vehicleResponseParams: params })),
  on(SettingsActions.fetchVehicleResponseSuccess, (state, { data }): SettingsState => ({ ...state, vehicleResponse: data })),

  on(SettingsActions.fetchVehicleSuccess, (state, { data }): SettingsState => ({ ...state, vehicle: data })),
  on(SettingsActions.fetchVehicleReset, (state): SettingsState => ({ ...state, vehicle: undefined })),

  on(SettingsActions.resetUser, (state): SettingsState => ({ ...state, user: undefined })),
  on(SettingsActions.resetFleet, (state): SettingsState => ({ ...state, fleet: undefined })),
  on(SettingsActions.reset, (): SettingsState => ({ ...settingsInitialState })),

  on(SettingsActions.setReportResponseParams, (state, { params }): SettingsState => ({ ...state, reportResponseParams: params })),
  on(SettingsActions.fetchReportResponseSuccess, (state, { data }): SettingsState => ({ ...state, reportResponse: data })),

  on(SettingsActions.fetchReportSuccess, (state, { data }): SettingsState => ({ ...state, report: data })),
  on(SettingsActions.fetchReportReset, (state): SettingsState => ({ ...state, report: undefined })),

  on(SettingsActions.fetchReportItemSuccess, (state, { data }): SettingsState => ({ ...state, reportItem: data })),

  on(SettingsActions.setReportItemResponseParams, (state, { params }): SettingsState => ({ ...state, reportItemResponseParams: params })),
  on(SettingsActions.fetchReportItemResponseSuccess, (state, { data }): SettingsState => ({ ...state, reportItemResponse: data })),

  on(SettingsActions.setUserNotificationsLoading, (state, { loading }): SettingsState => ({ ...state, userNotificationsLoading: loading })),

  on(SettingsActions.fetchUserNotificationsSuccess, (state, { data }): SettingsState => ({ ...state, userNotifications: data })),

  on(SettingsActions.updateUserNotificationsSuccess, (state, { data }): SettingsState => ({ ...state, userNotifications: { notifications: data } })),

  on(SettingsActions.setInfotainmentParams, (state, { params }): SettingsState => ({ ...state, infotainmentParams: { ...state.infotainmentParams, ...params } })),

  on(SettingsActions.fetchInfotainments, (state): SettingsState => ({ ...state, infotainmentLoading: true })),

  on(SettingsActions.fetchInfotainmentsSuccess, (state, { data }): SettingsState => ({ ...state, infotainments: data, infotainmentLoading: false })),
  on(SettingsActions.fetchInfotainment, (state): SettingsState => ({ ...state, infotainmentLoading: true })),

  on(SettingsActions.fetchInfotainmentSuccess, (state, { data }): SettingsState => ({ ...state, infotainment: data, infotainmentLoading: false })),
  on(SettingsActions.createInfotainmentSuccess, (state, { data }): SettingsState => ({ ...state, infotainment: data })),
  on(SettingsActions.updateInfotainmentSuccess, (state, { data }): SettingsState => ({ ...state, infotainment: data })),
  on(SettingsActions.deleteInfotainmentSuccess, (state): SettingsState => ({ ...state, infotainment: undefined })),
  on(SettingsActions.resetInfotainment, (state): SettingsState => ({ ...state, infotainment: undefined, infotainmentLoading: false })),

  on(SettingsActions.fetchVehicleEventStrategies, (state): SettingsState => ({ ...state, vehicleEventStrategiesLoading: true })),
  on(
    SettingsActions.fetchVehicleEventStrategiesSuccess,
    (state, { data }): SettingsState => ({
      ...state,
      vehicleEventStrategies: data,
      vehicleEventStrategiesLoading: false
    })
  ),

  on(SettingsActions.fetchVehicleEventStrategy, (state): SettingsState => ({ ...state, vehicleEventStrategiesLoading: true })),
  on(
    SettingsActions.fetchVehicleEventStrategySuccess,
    (state, { data }): SettingsState => ({
      ...state,
      vehicleEventStrategy: data,
      vehicleEventStrategiesLoading: false
    })
  ),

  on(
    SettingsActions.createVehicleEventStrategySuccess,
    (state, { data }): SettingsState => ({
      ...state,
      vehicleEventStrategy: data,
      vehicleEventStrategiesLoading: false
    })
  ),

  on(
    SettingsActions.updateVehicleEventStrategySuccess,
    (state, { data }): SettingsState => ({
      ...state,
      vehicleEventStrategy: data,
      vehicleEventStrategiesLoading: false
    })
  ),

  on(
    SettingsActions.deleteVehicleEventStrategySuccess,
    (state): SettingsState => ({
      ...state,
      vehicleEventStrategy: undefined,
      vehicleEventStrategiesLoading: false
    })
  ),

  on(
    SettingsActions.resetVehicleEventStrategies,
    (state): SettingsState => ({
      ...state,
      vehicleEventStrategies: undefined,
      vehicleEventStrategy: undefined,
      vehicleEventStrategiesLoading: false
    })
  ),

  on(SettingsActions.fetchSharedClipsSuccess, (state, { data }): SettingsState => ({ ...state, sharedClipsEmails: data })),

  on(SettingsActions.updateSharedClipsSuccess, (state, { data }): SettingsState => ({ ...state, sharedClipsEmails: data })),

  on(SettingsActions.setVehicleLookupLoading, (state, { loading }): SettingsState => ({ ...state, vehicleLookupLoading: loading })),
  on(SettingsActions.lookupVehicle, (state): SettingsState => ({ ...state, vehicleLookupLoading: true, vehicleLookupResult: undefined })),
  on(SettingsActions.lookupVehicleSuccess, (state, { data }): SettingsState => ({ ...state, vehicleLookupLoading: false, vehicleLookupResult: data })),
  on(SettingsActions.resetVehicleLookup, (state): SettingsState => ({ ...state, vehicleLookupLoading: false, vehicleLookupResult: undefined })),

  on(SettingsActions.validateVehicleStep, (state, { step }): SettingsState => ({ ...state, vehicleStepValidation: { ...state.vehicleStepValidation, loading: true, currentStep: step } })),
  on(SettingsActions.validateVehicleStepSuccess, (state, { data, step }): SettingsState => {
    const isValid = data && data.valid === true;
    return { ...state, vehicleStepValidation: { ...state.vehicleStepValidation, loading: false, stepsValid: { ...state.vehicleStepValidation.stepsValid, [step]: isValid } } };
  }),
  on(SettingsActions.resetVehicleLookup, (state): SettingsState => ({ ...state, vehicleLookupLoading: false, vehicleLookupResult: undefined })),
  on(SettingsActions.updateSharedClipsSuccess, (state, { data }): SettingsState => ({ ...state, sharedClipsEmails: data })),

  on(SettingsActions.setEventStrategyResponseParams, (state, { params }) => ({
    ...state,
    eventStrategiesResponseParams: { ...state.eventStrategiesResponseParams, ...params }
  })),

  on(SettingsActions.fetchEventStrategiesResponse, (state, { params }) => ({
    ...state,
    eventStrategiesResponseParams: { ...state.eventStrategiesResponseParams, ...params },
    eventStrategiesLoading: true
  })),

  on(SettingsActions.fetchEventStrategiesResponseSuccess, (state, { data }) => ({
    ...state,
    eventStrategiesResponse: data,
    eventStrategiesLoading: false
  })),

  on(SettingsActions.fetchEventStrategy, state => ({
    ...state,
    eventStrategyLoading: true
  })),

  on(SettingsActions.fetchEventStrategySuccess, (state, { data }) => ({
    ...state,
    eventStrategy: data,
    eventStrategyLoading: false
  })),

  on(SettingsActions.fetchEventStrategyReset, state => ({
    ...state,
    eventStrategy: null,
    eventStrategyLoading: false
  })),

  on(SettingsActions.createEventStrategySuccess, state => ({
    ...state,
    eventStrategyLoading: false
  })),

  on(SettingsActions.updateEventStrategySuccess, state => ({
    ...state,
    eventStrategyLoading: false
  })),

  on(SettingsActions.deleteEventStrategySuccess, state => ({
    ...state,
    eventStrategiesLoading: false
  })),

  on(SettingsActions.setFleetEventStrategyListParams, (state, { params }) => ({
    ...state,
    fleetEventStrategiesListParams: { ...state.fleetEventStrategiesListParams, ...params }
  })),

  on(SettingsActions.fetchFleetEventStrategies, state => ({
    ...state,
    fleetEventStrategiesLoading: true
  })),

  on(SettingsActions.fetchFleetEventStrategiesSuccess, (state, { data }) => ({
    ...state,
    fleetEventStrategiesList: data,
    fleetEventStrategiesLoading: false
  })),

  on(SettingsActions.updateFleetEventStrategiesSuccess, state => ({
    ...state,
    fleetEventStrategiesLoading: false
  })),

  on(SettingsActions.fetchProvidersList, state => ({ ...state, providersLoading: true, providersError: null })),
  on(SettingsActions.fetchProvidersListSuccess, (state, { data }) => ({ ...state, providerResponse: data, loading: false })),
  on(SettingsActions.fetchProviderDetailSuccess, (state, { data }) => ({ ...state, providerDetail: data })),
  on(SettingsActions.resetProviderDetail, (state): SettingsState => ({ ...state, providerDetail: null })),
  on(SettingsActions.providerResponseParams, (state, { params }): SettingsState => ({ ...state, providerParams: params })),
  on(SettingsActions.fetchAdminsList, (state, { params }) => ({
    ...state,
    adminResponseParams: { ...state.adminResponseParams, ...params }
  })),
  on(SettingsActions.fetchAdminsListSuccess, (state, { data }) => ({
    ...state,
    adminsResponse: data
  })),

  on(SettingsActions.fetchAdminDetailSuccess, (state, { data }) => ({
    ...state,
    adminDetail: data
  })),

  on(SettingsActions.resetAdminDetail, state => ({
    ...state,
    adminDetail: null
  })),

  on(SettingsActions.assignVehicleStrategies, (state): SettingsState => ({ ...state, vehicleStrategiesLoading: true })),
  on(SettingsActions.assignVehicleStrategiesSuccess, (state): SettingsState => ({ ...state, vehicleStrategiesLoading: false })),
  on(SettingsActions.completeVehicleStrategies, (state): SettingsState => ({ ...state, vehicleStrategiesLoading: true })),
  on(SettingsActions.completeVehicleStrategiesSuccess, (state): SettingsState => ({ ...state, vehicleStrategiesLoading: false })),
  on(SettingsActions.getVehicleStrategiesReport, (state): SettingsState => ({ ...state, vehicleStrategiesReportLoading: true })),
  on(SettingsActions.getVehicleStrategiesReportSuccess, (state, { reportBlob }): SettingsState => ({ ...state, vehicleStrategiesReport: reportBlob, vehicleStrategiesReportLoading: false })),
  on(SettingsActions.setCreatedVehicleId, (state, { id }) => ({ ...state, createdVehicleId: id })),
  on(SettingsActions.setCreatedVehicle, (state, { vehicle }) => ({ ...state, createdVehicle: vehicle, createdVehicleId: vehicle.id })),

  on(SettingsActions.setApplicationSettingsParams, (state, { params }): SettingsState => ({ ...state, applicationSettingsParams: { ...state.applicationSettingsParams, ...params } })),
  on(SettingsActions.fetchApplicationSettings, (state): SettingsState => ({ ...state, applicationSettingsLoading: true })),
  on(SettingsActions.fetchApplicationSettingsSuccess, (state, { data }): SettingsState => ({ ...state, applicationSettingsResponse: data, applicationSettingsLoading: false })),
  on(SettingsActions.fetchApplicationSetting, (state): SettingsState => ({ ...state, applicationSettingLoading: true })),
  on(SettingsActions.fetchApplicationSettingSuccess, (state, { data }): SettingsState => ({ ...state, applicationSetting: data, applicationSettingLoading: false })),
  on(SettingsActions.fetchApplicationSettingByName, (state): SettingsState => ({ ...state, applicationSettingLoading: true })),
  on(SettingsActions.fetchApplicationSettingByNameSuccess, (state, { data }): SettingsState => ({ ...state, applicationSetting: data, applicationSettingLoading: false })),
  on(SettingsActions.createApplicationSetting, (state): SettingsState => ({ ...state, applicationSettingLoading: true })),
  on(SettingsActions.createApplicationSettingSuccess, (state, { data }): SettingsState => ({ ...state, applicationSetting: data, applicationSettingLoading: false })),
  on(SettingsActions.updateApplicationSetting, (state): SettingsState => ({ ...state, applicationSettingLoading: true })),
  on(SettingsActions.updateApplicationSettingSuccess, (state, { data }): SettingsState => ({ ...state, applicationSetting: data, applicationSettingLoading: false })),
  on(SettingsActions.resetApplicationSetting, (state): SettingsState => ({ ...state, applicationSetting: undefined, applicationSettingLoading: false }))
);
