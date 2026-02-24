import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SETTINGS_FEATURE_KEY, SettingsState } from './settings.reducer';

const getState = createFeatureSelector<SettingsState>(SETTINGS_FEATURE_KEY);

export const SettingsSelectors = {
  usersTreeParams: createSelector(getState, state => state.usersTreeParams),
  usersTree: createSelector(getState, state => state.usersTree),

  userLoading: createSelector(getState, state => state.userLoading),
  user: createSelector(getState, state => state.user),

  notifications: createSelector(getState, state => state.notifications),

  fleetsTreeParams: createSelector(getState, state => state.fleetsTreeParams),
  fleetsTree: createSelector(getState, state => state.fleetsTree),

  fleetLoading: createSelector(getState, state => state.fleetLoading),
  fleet: createSelector(getState, state => state.fleet),

  safetyScoreProfiles: createSelector(getState, state => state.safetyScoreProfiles),

  usersResponseParams: createSelector(getState, state => state.usersResponseParams),
  usersResponse: createSelector(getState, state => state.usersResponse),

  companyElements: createSelector(getState, state => state.companyElements),
  companyElement: createSelector(getState, state => state.companyElement),

  companyRoles: createSelector(getState, state => state.companyRoles),
  companyRolesSelect: createSelector(getState, state => state.companyRolesSelect),

  allRoles: createSelector(getState, state => state.allRoles),

  fleetAccess: createSelector(getState, state => state.fleetAccess),
  fleetAccessFilter: createSelector(getState, state => state.fleetAccessFilter),

  role: createSelector(getState, state => state.role),

  driverResponseParams: createSelector(getState, state => state.driverResponseParams),
  driverResponse: createSelector(getState, state => state.driverResponse),

  driver: createSelector(getState, state => state.driver),

  driversTreeParams: createSelector(getState, state => state.driversTreeParams),
  driversTree: createSelector(getState, state => state.driversTree),

  fleetAccessResponseParams: createSelector(getState, state => state.fleetAccessResponseParams),
  fleetAccessResponse: createSelector(getState, state => state.fleetAccessResponse),

  vehicleResponseParams: createSelector(getState, state => state.vehicleResponseParams),
  vehicleResponse: createSelector(getState, state => state.vehicleResponse),

  vehicleTreeParams: createSelector(getState, state => state.vehicleTreeParams),
  vehicleTree: createSelector(getState, state => state.vehicleTree),

  vehicle: createSelector(getState, state => state.vehicle),

  reportResponseParams: createSelector(getState, state => state.reportResponseParams),
  reportResponse: createSelector(getState, state => state.reportResponse),

  reportsTreeParams: createSelector(getState, state => state.reportsTreeParams),

  report: createSelector(getState, state => state.report),

  reportItemResponseParams: createSelector(getState, state => state.reportItemResponseParams),
  reportItemResponse: createSelector(getState, state => state.reportItemResponse),
  reportItem: createSelector(getState, state => state.reportItem),

  userNotifications: createSelector(getState, state => state.userNotifications),
  userNotificationsLoading: createSelector(getState, state => state.userNotificationsLoading),

  infotainmentLoading: createSelector(getState, state => state.infotainmentLoading),
  infotainment: createSelector(getState, state => state.infotainment),
  infotainments: createSelector(getState, state => state.infotainments),
  infotainmentParams: createSelector(getState, state => state.infotainmentParams),

  vehicleEventStrategiesLoading: createSelector(getState, state => state.vehicleEventStrategiesLoading),
  vehicleEventStrategies: createSelector(getState, state => state.vehicleEventStrategies),
  vehicleEventStrategy: createSelector(getState, state => state.vehicleEventStrategy),

  sharedClipsEmails: createSelector(getState, state => state.sharedClipsEmails),

  eventStrategiesResponseParams: createSelector(getState, state => state.eventStrategiesResponseParams),
  eventStrategiesResponse: createSelector(getState, state => state.eventStrategiesResponse),
  eventStrategiesLoading: createSelector(getState, state => state.eventStrategiesLoading),
  eventStrategy: createSelector(getState, state => state.eventStrategy),
  eventStrategyLoading: createSelector(getState, state => state.eventStrategyLoading),

  fleetEventStrategiesListParams: createSelector(getState, state => state.fleetEventStrategiesListParams),
  fleetEventStrategiesList: createSelector(getState, state => state.fleetEventStrategiesList),
  fleetEventStrategiesLoading: createSelector(getState, state => state.fleetEventStrategiesLoading),

  vehicleLookupLoading: createSelector(getState, state => state.vehicleLookupLoading),
  vehicleLookupResult: createSelector(getState, state => state.vehicleLookupResult),

  vehicleStepValidationLoading: createSelector(getState, state => state.vehicleStepValidation.loading),
  vehicleStepValidationCurrentStep: createSelector(getState, state => state.vehicleStepValidation.currentStep),
  vehicleStepValidationStepsValid: createSelector(getState, state => state.vehicleStepValidation.stepsValid),
  isVehicleStepValid: (step: number) => createSelector(getState, state => state.vehicleStepValidation.stepsValid[step]),

  providersResponse: createSelector(getState, state => state.providerResponse),
  providerResponseParams: createSelector(getState, state => state.providerParams),
  providerDetail: createSelector(getState, state => state.providerDetail),

  adminsResponse: createSelector(getState, state => state.adminsResponse),
  adminResponseParams: createSelector(getState, state => state.adminResponseParams),
  adminDetail: createSelector(getState, state => state.adminDetail),

  vehicleStrategiesLoading: createSelector(getState, state => state.vehicleStrategiesLoading),
  vehicleStrategiesReport: createSelector(getState, state => state.vehicleStrategiesReport),
  vehicleStrategiesReportLoading: createSelector(getState, state => state.vehicleStrategiesReportLoading),

  createdVehicleId: createSelector(getState, state => state.createdVehicleId),
  createdVehicle: createSelector(getState, state => state.createdVehicle),

  applicationSettingsParams: createSelector(getState, state => state.applicationSettingsParams),
  applicationSettingsResponse: createSelector(getState, state => state.applicationSettingsResponse),
  applicationSettingsLoading: createSelector(getState, state => state.applicationSettingsLoading),
  applicationSetting: createSelector(getState, state => state.applicationSetting),
  applicationSettingLoading: createSelector(getState, state => state.applicationSettingLoading)
};
