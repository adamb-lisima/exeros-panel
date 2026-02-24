import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concat, concatMap, EMPTY, map, of, switchMap, withLatestFrom } from 'rxjs';
import { AlertActions } from '../../store/alert/alert.actions';
import { applicationLoading } from '../../store/application/application.actions';
import { AuthActions } from '../../store/auth/auth.actions';
import { AuthService } from '../../store/auth/auth.service';
import { CommonObjectsService } from '../../store/common-objects/common-objects.service';
import { SettingsActions } from './settings.actions';
import { SettingsSelectors } from './settings.selectors';
import { SettingsService } from './settings.service';

@Injectable()
export class SettingsEffects {
  fetchUsersTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchUsersTree),
      withLatestFrom(this.store.select(SettingsSelectors.usersTreeParams)),
      switchMap(([{ params }, usersTreeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchUsersTree$' })),
          of({ ...usersTreeParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setUsersTreeParams({ params: newParams })),
                this.commonObjectsService.fetchUsersTree(newParams).pipe(
                  map(({ data }) => SettingsActions.fetchUsersTreeSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchUsersTree$' }))
        )
      )
    )
  );

  fetchUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchUser),
      switchMap(({ id }) =>
        concat(
          of(SettingsActions.setUserLoading({ loading: true })),
          this.settingsService.fetchUser(id).pipe(
            map(({ data }) => SettingsActions.fetchUserSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(SettingsActions.setUserLoading({ loading: false }))
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createUser),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createUser$' })),
          this.settingsService.createUser(body).pipe(
            map(({ data }) => SettingsActions.createUserSuccess({ data })),
            // withLatestFrom(this.store.select(SettingsSelectors.usersTreeParams)),
            // switchMap(([, params]) => this.commonObjectsService.fetchUsersTree(params)),
            // map(({ data }) => SettingsActions.createUserSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createUser$' }))
        )
      )
    )
  );

  fetchFleetsTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchFleetsTree),
      withLatestFrom(this.store.select(SettingsSelectors.fleetsTreeParams)),
      switchMap(([{ params }, fleetsTreeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchFleetsTree$' })),
          of({ ...fleetsTreeParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setFleetsTreeParams({ params: newParams })),
                this.commonObjectsService.fetchFleetsTree(newParams).pipe(
                  map(({ data }) => SettingsActions.fetchFleetsTreeSuccess({ data: data.fleet_dtos })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchFleetsTree$' }))
        )
      )
    )
  );

  fetchFleet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchFleet),
      switchMap(({ id }) =>
        concat(
          of(SettingsActions.setFleetLoading({ loading: true })),
          this.settingsService.fetchFleet(id).pipe(
            map(({ data }) => SettingsActions.fetchFleetSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(SettingsActions.setFleetLoading({ loading: false }))
        )
      )
    )
  );

  createFleet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createFleet),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createFleet$' })),
          this.settingsService.createFleet(body).pipe(
            withLatestFrom(this.store.select(SettingsSelectors.fleetsTreeParams)),
            switchMap(([, params]) => this.commonObjectsService.fetchFleetsTree(params)),
            map(({ data }) => SettingsActions.createFleetSuccess({ data: data.fleet_dtos })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createFleet$' }))
        )
      )
    )
  );

  updateFleet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateFleet),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateFleet$' })),
          this.settingsService.updateFleet(id, body).pipe(
            concatMap(() => [SettingsActions.updateFleetSuccess()]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateFleet$' }))
        )
      )
    )
  );

  deleteFleet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteFleet),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteFleet$' })),
          this.settingsService.deleteFleet(id).pipe(
            map(() => SettingsActions.deleteFleetSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteFleet$' }))
        )
      )
    )
  );

  /**
   * @deprecated The method should not be used, we moved it to company
   */
  updateFleetLogo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateFleetLogo),
      switchMap(({ fleetId, file }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateFleetLogo$' })),
          this.settingsService.updateFleetLogo(fleetId, file).pipe(
            withLatestFrom(this.store.select(SettingsSelectors.fleetsTreeParams)),
            switchMap(([, params]) => this.commonObjectsService.fetchFleetsTree(params)),
            map(({ data }) => SettingsActions.updateFleetLogoSuccess({ data: data.fleet_dtos })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateFleetLogo$' }))
        )
      )
    )
  );

  fetchCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchCompany),
      switchMap(({ id }) =>
        concat(
          of(SettingsActions.setCompanyLoading({ loading: true })),
          this.settingsService.fetchCompany(id).pipe(
            map(({ data }) => SettingsActions.fetchCompanySuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(SettingsActions.setCompanyLoading({ loading: false }))
        )
      )
    )
  );

  createCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createCompany),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createCompany$' })),
          this.settingsService.createCompany(body).pipe(
            concatMap(({ data }) => [SettingsActions.updateCompanySuccess({ data })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createCompany$' }))
        )
      )
    )
  );

  updateCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateCompany),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateCompany$' })),
          this.settingsService.updateCompany(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.updateCompanySuccess({ data })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateCompany$' }))
        )
      )
    )
  );

  updateCompanyLogo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateCompanyLogo),
      switchMap(({ companyId, file }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateCompanyLogo$' })),
          this.settingsService.updateCompanyLogo(companyId, file).pipe(
            concatMap(({ data }) => [SettingsActions.updateCompanySuccess({ data })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateCompanyLogo$' }))
        )
      )
    )
  );

  fetchVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchVehicle),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehicle$' })),
          this.settingsService.fetchVehicle(id).pipe(
            map(({ data }) => SettingsActions.fetchVehicleSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehicle$' }))
        )
      )
    )
  );

  createFleetAccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createFleetAccess),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createFleetAccess$' })),
          this.settingsService.createFleetAccess(body).pipe(
            concatMap(({ data }) => [SettingsActions.createFleetAccessSuccess()]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createFleetAccess$' }))
        )
      )
    )
  );

  updateFleetAccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateFleetAccess),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateFleetAccess$' })),
          this.settingsService.updateFleetAccess(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.updateFleetAccessSuccess()]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateFleetAccess$' }))
        )
      )
    )
  );

  createVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createVehicle),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createVehicle$' })),
          this.settingsService.createVehicle(body).pipe(
            switchMap(response => {
              const actions = [SettingsActions.createVehicleSuccess({ data: response.data.fleet_dtos }), SettingsActions.setCreatedVehicle({ vehicle: response.data })];
              return actions;
            }),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createVehicle$' }))
        )
      )
    )
  );

  updateVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateVehicle),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateVehicle$' })),
          this.settingsService.updateVehicle(id, body).pipe(
            map(({ data }) => SettingsActions.updateVehicleSuccess({ data: data.fleet_dtos })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateVehicle$' }))
        )
      )
    )
  );

  assignVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.assignVehicle),
      switchMap(({ vehicleId, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'assignVehicle$' })),
          this.settingsService.assignVehicle(vehicleId, body).pipe(
            withLatestFrom(this.store.select(SettingsSelectors.fleetsTreeParams)),
            switchMap(([, params]) => this.commonObjectsService.fetchFleetsTree(params)),
            map(({ data }) => SettingsActions.assignVehicleSuccess({ data: data.fleet_dtos })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'assignVehicle$' }))
        )
      )
    )
  );

  assignVehicleV2$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.assignVehicleV2),
      switchMap(({ fleetId, vehicleIds }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'assignVehicleV2$' })),
          this.settingsService.assignVehicleV2(fleetId, vehicleIds).pipe(
            map(() => SettingsActions.assignVehicleSuccessV2()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'assignVehicleV2$' }))
        )
      )
    )
  );

  updateEventDefaultCameraChannels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateEventDefaultCameraChannels),
      switchMap(({ vehicleId, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateEventDefaultCameraChannels$' })),
          this.settingsService.updateEventDefaultCameraChannels(vehicleId, body).pipe(
            withLatestFrom(this.store.select(SettingsSelectors.fleetsTreeParams)),
            switchMap(([, params]) => this.commonObjectsService.fetchFleetsTree(params)),
            map(({ data }) => SettingsActions.updateEventDefaultCameraChannelsSuccess({ data: data.fleet_dtos })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateEventDefaultCameraChannels$' }))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateUser),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateUser$' })),
          this.settingsService.updateUser(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.updateUserSuccess()]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateUser$' }))
        )
      )
    )
  );

  updateAuthUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateAuthUser),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateAuthUser$' })),
          this.settingsService.updateAuthUser(body).pipe(
            concatMap(() => [SettingsActions.updateAuthUserSuccess(), AuthActions.fetchUser()]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateAuthUser$' }))
        )
      )
    )
  );

  updateAvatar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateAvatar),
      switchMap(({ file }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateAvatar$' })),
          this.settingsService.updateAvatar(file).pipe(
            switchMap(() => this.authService.fetchUser()),
            concatMap(({ data }) => [SettingsActions.updateAvatarSuccess(), AuthActions.setLoggedInUser({ loggedInUser: data })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateAvatar$' }))
        )
      )
    )
  );

  updatePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updatePassword),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updatePassword$' })),
          this.settingsService.updatePassword(body).pipe(
            concatMap(() => [SettingsActions.updatePasswordSuccess(), AlertActions.display({ alert: { type: 'success', message: `User's password updated!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updatePassword$' }))
        )
      )
    )
  );

  executeMfa$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.executeMfa),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'executeMfa$' })),
          this.settingsService.executeMfa(body).pipe(
            concatMap(() => [SettingsActions.executeMfaSuccess(), AuthActions.fetchUser(), AlertActions.display({ alert: { type: 'success', message: `MFA executed with success!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'executeMfa$' }))
        )
      )
    )
  );

  sendMfa$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.sendMfa),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: false, key: 'sendMfa$' })),
          this.settingsService.sendMfa(body).pipe(
            concatMap(() => [AlertActions.display({ alert: { type: 'success', message: `MFA code has been emailed!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'sendMfa$' }))
        )
      )
    )
  );

  changePrivileges$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.changePrivileges),
      withLatestFrom(this.store.select(SettingsSelectors.usersTreeParams)),
      switchMap(([{ id, body }, usersTreeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'changePrivileges$' })),
          this.settingsService.changePrivileges(id, body).pipe(
            switchMap(() => this.commonObjectsService.fetchUsersTree(usersTreeParams)),
            concatMap(({ data }) => [SettingsActions.changePrivilegesSuccess({ data }), AlertActions.display({ alert: { type: 'success', message: `User's privileges updated!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'changePrivileges$' }))
        )
      )
    )
  );

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.resetPassword),
      withLatestFrom(this.store.select(SettingsSelectors.usersTreeParams)),
      switchMap(([{ id }, usersTreeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'resetPassword$' })),
          this.settingsService.resetPassword(id).pipe(
            switchMap(() => this.commonObjectsService.fetchUsersTree(usersTreeParams)),
            concatMap(({ data }) => [SettingsActions.resetPasswordSuccess({ data }), AlertActions.display({ alert: { type: 'success', message: `User's password reset!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'resetPassword$' }))
        )
      )
    )
  );

  resetMfa$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.resetMfa),
      withLatestFrom(this.store.select(SettingsSelectors.usersTreeParams)),
      switchMap(([{ id }, usersTreeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'resetMfa$' })),
          this.settingsService.resetMfa(id).pipe(
            switchMap(() => this.commonObjectsService.fetchUsersTree(usersTreeParams)),
            concatMap(({ data }) => [SettingsActions.resetMfaSuccess({ data }), AlertActions.display({ alert: { type: 'success', message: `User's MFA reset!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'resetMfa$' }))
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteUser),
      withLatestFrom(this.store.select(SettingsSelectors.usersTreeParams)),
      switchMap(([{ id }, usersTreeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteUser$' })),
          this.settingsService.deleteUser(id).pipe(
            switchMap(() => this.commonObjectsService.fetchUsersTree(usersTreeParams)),
            concatMap(({ data }) => [
              SettingsActions.deleteUserSuccess({ data }),
              SettingsActions.fetchUsersResponse({
                params: {
                  page: 1,
                  per_page: 10
                }
              }),
              AlertActions.display({ alert: { type: 'success', message: `User has been deleted!` } })
            ]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteUser$' }))
        )
      )
    )
  );

  deleteCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteCompany),
      withLatestFrom(this.store.select(SettingsSelectors.companyElements)),
      switchMap(([{ id }]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteCompany$' })),
          this.settingsService.deleteCompany(id).pipe(
            concatMap(({ data }) => [SettingsActions.deleteCompanySuccess({ data }), SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }), AlertActions.display({ alert: { type: 'success', message: `Company has been deleted!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteCompany$' }))
        )
      )
    )
  );

  deleteFleetAccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteFleetAccess),
      withLatestFrom(this.store.select(SettingsSelectors.fleetAccess)),
      switchMap(([{ id, company_id }]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteFleetAccess$' })),
          this.settingsService.deleteFleetAccess(id).pipe(
            concatMap(({ data }) => [SettingsActions.deleteFleetAccessSuccess({ data }), SettingsActions.fetchFleetAccess({ params: { company_id: company_id, page: 1, per_page: 10 } }), AlertActions.display({ alert: { type: 'success', message: `Fleet Access has been deleted!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteFleetAccess$' }))
        )
      )
    )
  );

  fetchNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchNotifications),
      switchMap(({ params }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchNotifications$' })),
          this.settingsService.fetchNotifications(params).pipe(
            map(({ data }) => SettingsActions.fetchNotificationsSuccess({ data: data?.[0] })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchNotifications$' }))
        )
      )
    )
  );

  updateNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateNotifications),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateNotifications$' })),
          this.settingsService.updateNotifications(body).pipe(
            concatMap(() => [SettingsActions.updateNotificationsSuccess(), AlertActions.display({ alert: { type: 'success', message: `Notifications updated!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateNotifications$' }))
        )
      )
    )
  );

  fetchSharedClips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchSharedClips),
      switchMap(({ company_id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchSharedClips$' })),
          this.settingsService.fetchSharedClips(company_id).pipe(
            map(({ data }) => SettingsActions.fetchSharedClipsSuccess({ data: data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchSharedClips$' }))
        )
      )
    )
  );

  updateSharedClips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateSharedClips),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateSharedClips$' })),
          this.settingsService.updateSharedClips(body).pipe(
            map(({ data }) => SettingsActions.updateSharedClipsSuccess({ data: data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateSharedClips$' }))
        )
      )
    )
  );

  fetchSafetyScoreProfiles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchSafetyScoreProfiles),
      switchMap(() =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchSafetyScoreProfiles$' })),
          this.settingsService.fetchSafetyScoreProfiles().pipe(
            map(({ data }) => SettingsActions.fetchSafetyScoreProfilesSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchSafetyScoreProfiles$' }))
        )
      )
    )
  );

  updateSafetyScoreProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateSafetyScoreProfile),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateSafetyScoreProfile$' })),
          this.settingsService.updateSafetyScoreProfile(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.updateSafetyScoreProfileSuccess({ data }), SettingsActions.fetchCompaniesTree({ params: { with_users: false, with_drivers: false, with_score: true } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateSafetyScoreProfile$' }))
        )
      )
    )
  );

  createSafetyScoreProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createSafetyScoreProfile),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createSafetyScoreProfile$' })),
          this.settingsService.createSafetyScoreProfile(body).pipe(
            concatMap(({ data }) => [SettingsActions.createSafetyScoreProfileSuccess({ data }), SettingsActions.fetchCompaniesTree({ params: { with_users: false, with_drivers: false, with_score: true } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createSafetyScoreProfile$' }))
        )
      )
    )
  );

  deleteSafetyScoreProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteSafetyScoreProfile),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteSafetyScore$' })),
          this.settingsService.deleteSafetyScoreProfile(id).pipe(
            concatMap(() => [SettingsActions.deleteSafetyScoreProfileSuccess(), SettingsActions.fetchCompaniesTree({ params: { with_users: false, with_drivers: false, with_score: true } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteSafetyScore$' }))
        )
      )
    )
  );

  assignSafetyScoreProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.assignSafetyScoreProfile),
      switchMap(({ profileId, fleetId }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'assignSafetyScoreProfile$' })),
          this.settingsService.assignSafetyScoreProfile(profileId, fleetId).pipe(
            withLatestFrom(this.store.select(SettingsSelectors.fleetsTreeParams)),
            switchMap(([, params]) => this.commonObjectsService.fetchFleetsTree(params)),
            map(({ data }) => SettingsActions.assignSafetyScoreProfileSuccess({ data: data.fleet_dtos })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'assignSafetyScoreProfile$' }))
        )
      )
    )
  );

  restoreSafetyScoreProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.restoreSafetyScoreProfile),
      switchMap(({ profile }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'restoreSafetyScoreProfile$' })),
          this.settingsService.restoreSafetyScoreProfile(profile.id).pipe(
            switchMap(() => this.settingsService.fetchSafetyScoreProfiles()),
            map(({ data }) => SettingsActions.restoreSafetyScoreProfileSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'restoreSafetyScoreProfile$' }))
        )
      )
    )
  );

  fetchUsersResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchUsersResponse),
      withLatestFrom(this.store.select(SettingsSelectors.usersResponseParams)),
      switchMap(([{ params }, usersParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchUsers$' })),
          of({ ...usersParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setUsersResponseParams({ params: newParams })),
                this.settingsService.fetchUsers(newParams).pipe(
                  map(data => SettingsActions.fetchUsersResponseSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchUsers$' }))
        )
      )
    )
  );

  fetchFleetAccessResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchFleetAccessResponse),
      withLatestFrom(this.store.select(SettingsSelectors.fleetAccessResponseParams)),
      switchMap(([{ params }, fleetParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchFleetAccessResponse$' })),
          of({ ...fleetParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setFleetAccessParams({ params: newParams })),
                this.settingsService.fetchFleetAccess(newParams).pipe(
                  map(data => SettingsActions.fetchFleetAccessResponseSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchFleetAccessResponse$' }))
        )
      )
    )
  );

  fetchDriverResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchDriverResponse),
      withLatestFrom(this.store.select(SettingsSelectors.driverResponseParams)),
      switchMap(([{ params }, usersParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchDriver$' })),
          of({ ...usersParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setDriverResponseParams({ params: newParams })),
                this.settingsService.fetchDrivers(newParams).pipe(
                  map(data => SettingsActions.fetchDriverResponseSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchDriver$' }))
        )
      )
    )
  );

  updateDriver$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateDriver),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateDriver$' })),
          this.settingsService.updateDriver(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.updateDriverSuccess(), SettingsActions.fetchDriverResponse({ params: { company_id: body.company_id, page: 1, per_page: 10 } }), AlertActions.display({ alert: { type: 'success', message: `Driver updated!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateDriver$' }))
        )
      )
    )
  );

  createRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createRole),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createRole$' })),
          this.settingsService.createRole(body).pipe(
            concatMap(() => [SettingsActions.createRoleSuccess(), SettingsActions.fetchCompanyRoles({ params: { company_id: body.company_id!, page: 1, per_page: 100, only_custom_roles: false }, onlySelect: false })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createRole$' }))
        )
      )
    )
  );

  fetchCompaniesTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchCompaniesTree),
      switchMap(({ params }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchCompaniesTree$' })),
          this.settingsService.fetchCompaniesTree(params).pipe(
            map(({ data }) => SettingsActions.fetchCompaniesTreeSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchCompaniesTree$' }))
        )
      )
    )
  );

  fetchDriver$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchDriver),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchDriver$' })),
          this.settingsService.fetchDriver(id).pipe(
            map(({ data }) => SettingsActions.fetchDriverSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchDriver$' }))
        )
      )
    )
  );

  fetchCompanyRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchCompanyRoles),
      switchMap(({ params, onlySelect }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchCompanyRoles$' })),
          this.settingsService.fetchCompanyRoles(params).pipe(
            map(({ data }) => SettingsActions.fetchCompanyRolesSuccess({ data, onlySelect })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchCompanyRoles$' }))
        )
      )
    )
  );

  fetchAllRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchAllRoles),
      switchMap(() =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchAllRoles$' })),
          this.settingsService.fetchAllRoles({ page: 1, per_page: 999, only_custom_roles: true }).pipe(
            map(({ data }) => SettingsActions.fetchAllRolesSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchAllRoles$' }))
        )
      )
    )
  );

  fetchRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchRole),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchRole$' })),
          this.settingsService.fetchRole(id).pipe(
            map(({ data }) => SettingsActions.fetchRoleSuccess(data)),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchRole$' }))
        )
      )
    )
  );

  editRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.editRole),
      switchMap(({ body, id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'editRole$' })),
          this.settingsService.editRole(body, id).pipe(
            concatMap(() => [SettingsActions.editRoleSuccess(), SettingsActions.fetchCompanyRoles({ params: { company_id: body.company_id!, page: 1, per_page: 10, only_custom_roles: false }, onlySelect: false })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'editRole$' }))
        )
      )
    )
  );

  deleteRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteRole),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteRole$' })),
          this.settingsService.deleteRole(id).pipe(
            map(() => SettingsActions.deleteRoleSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteRole$' }))
        )
      )
    )
  );

  fetchFleetAccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchFleetAccess),
      switchMap(({ params }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchFleetAccess$' })),
          this.settingsService.fetchFleetAccess(params).pipe(
            map(({ data }) => SettingsActions.fetchFleetAccessSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchFleetAccess$' }))
        )
      )
    )
  );

  fetchFleetAccessFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchFleetAccessFilter),
      switchMap(({ params }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchFleetAccessFilter$' })),
          this.settingsService.fetchFleetAccess(params).pipe(
            map(({ data }) => SettingsActions.fetchFleetAccessFilterSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchFleetAccessFilter$' }))
        )
      )
    )
  );

  createDriver$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createDriver),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createDriver$' })),
          this.settingsService.createDriver(body).pipe(
            concatMap(({ data }) => [SettingsActions.createDriverSuccess({ data }), SettingsActions.fetchDriverResponse({ params: { page: 1, per_page: 10 } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createDriver$' }))
        )
      )
    )
  );

  deleteDriver$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteDriver),
      withLatestFrom(this.store.select(SettingsSelectors.driversTreeParams)),
      switchMap(([{ id }, driversTreeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteDriver$' })),
          this.settingsService.deleteDriver(id).pipe(
            switchMap(() => this.commonObjectsService.fetchDriversTree(driversTreeParams)),
            concatMap(({ data }) => [SettingsActions.deleteDriverSuccess({ data }), SettingsActions.fetchDriverResponse({ params: { page: 1, per_page: 10 } }), AlertActions.display({ alert: { type: 'success', message: `Driver has been deleted!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteDriver$' }))
        )
      )
    )
  );

  fetchDriversTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchDriversTree),
      withLatestFrom(this.store.select(SettingsSelectors.driversTreeParams)),
      switchMap(([{ params }, driversTreeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchDriversTree$' })),
          of({ ...driversTreeParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setDriversTreeParams({ params: newParams })),
                this.commonObjectsService.fetchDriversTree(newParams).pipe(
                  map(({ data }) => SettingsActions.fetchDriversTreeSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchUsersTree$' }))
        )
      )
    )
  );

  updateEventInNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateEventInNotifications),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateEventInNotifications$' })),
          this.settingsService.updateEventInNotifications(id, body).pipe(
            map(({ data }) => SettingsActions.updateEventInNotificationsSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateEventInNotifications$' }))
        )
      )
    )
  );

  fetchVehicleResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchVehicleResponse),
      withLatestFrom(this.store.select(SettingsSelectors.vehicleResponseParams)),
      switchMap(([{ params }, vehicleParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehicleResponse$' })),
          of({ ...vehicleParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setVehicleResponseParams({ params: newParams })),
                this.settingsService.fetchVehicles(newParams).pipe(
                  map(data => SettingsActions.fetchVehicleResponseSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehicleResponse$' }))
        )
      )
    )
  );

  deleteVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteVehicle),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteVehicle$' })),
          this.settingsService.deleteVechile(id).pipe(
            concatMap(({ data }) => [SettingsActions.deleteVehicleSuccess({ data }), SettingsActions.fetchVehicleResponse({ params: {} }), AlertActions.display({ alert: { type: 'success', message: `Vehicle has been deleted!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteVehicle$' }))
        )
      )
    )
  );

  addVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.addVehicle),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'addVehicle$' })),
          this.settingsService.addVehicle(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.addVehicleSuccess(), SettingsActions.fetchVehicleResponse({ params: {} }), AlertActions.display({ alert: { type: 'success', message: `Vehicle has been added!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'addVehicle$' }))
        )
      )
    )
  );

  fetchReportResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchReportResponse),
      withLatestFrom(this.store.select(SettingsSelectors.reportResponseParams)),
      switchMap(([{ params }, reportParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchReportResponse$' })),
          of({ ...reportParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setReportResponseParams({ params: newParams })),
                this.settingsService.fetchReports(newParams).pipe(
                  map(data => SettingsActions.fetchReportResponseSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchReportResponse$' }))
        )
      )
    )
  );

  createReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createReport),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createReport$' })),
          this.settingsService.createReport(body).pipe(
            concatMap(({ data }) => [SettingsActions.createReportSuccess({ data }), SettingsActions.fetchReportResponse({ params: { page: 1, per_page: 10 } }), AlertActions.display({ alert: { type: 'success', message: `Report automation has been created!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createReport$' }))
        )
      )
    )
  );

  deleteReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteReport),
      withLatestFrom(this.store.select(SettingsSelectors.reportsTreeParams)),
      switchMap(([{ id }, reportsTreeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteReport$' })),
          this.settingsService.deleteReport(id).pipe(
            switchMap(() => this.settingsService.fetchReports(reportsTreeParams)),
            switchMap(() => this.settingsService.fetchReports(reportsTreeParams)),
            concatMap(({ data }) => [SettingsActions.deleteReportSuccess({ data }), SettingsActions.fetchReportResponse({ params: { page: 1, per_page: 10 } }), AlertActions.display({ alert: { type: 'success', message: `Report automation has been deleted!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteReport$' }))
        )
      )
    )
  );

  fetchReportItemResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchReportItemResponse),
      withLatestFrom(this.store.select(SettingsSelectors.reportItemResponseParams)),
      switchMap(([{ params }, reportItemParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchReportItemResponse$' })),
          of({ ...reportItemParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setReportItemResponseParams({ params: newParams })),
                this.settingsService.fetchReportsItems(newParams).pipe(
                  map(data => SettingsActions.fetchReportItemResponseSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchReportItemResponse$' }))
        )
      )
    )
  );

  updateReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateReport),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateReport$' })),
          this.settingsService.updateReport(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.updateReportSuccess(), SettingsActions.fetchReportResponse({ params: { page: 1, per_page: 10 } }), AlertActions.display({ alert: { type: 'success', message: `Report updated!` } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateReport$' }))
        )
      )
    )
  );

  fetchReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchReport),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchReport$' })),
          this.settingsService.fetchReport(id).pipe(
            map(({ data }) => SettingsActions.fetchReportSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchReport$' }))
        )
      )
    )
  );

  updateUserNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateUserNotifications),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateUserNotifications$' })),
          this.settingsService.updateUserNotifications(id, body).pipe(
            map(({ data }) => SettingsActions.updateUserNotificationsSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateUserNotifications$' }))
        )
      )
    )
  );

  fetchUserNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchUserNotifications),
      switchMap(({ id }) =>
        concat(
          of(SettingsActions.setUserNotificationsLoading({ loading: true })),
          this.settingsService.fetchUserNotifications(id).pipe(
            map(({ data }) => SettingsActions.fetchUserNotificationsSuccess({ data: { notifications: data } })),
            catchError(() => EMPTY)
          ),
          of(SettingsActions.setUserNotificationsLoading({ loading: false }))
        )
      )
    )
  );

  fetchInfotainments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchInfotainments),
      withLatestFrom(this.store.select(SettingsSelectors.infotainmentParams)),
      switchMap(([{ params }, infotainmentParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchInfotainments$' })),
          of({ ...infotainmentParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setInfotainmentParams({ params: newParams })),
                this.settingsService.fetchInfotainments(newParams).pipe(
                  map(data => SettingsActions.fetchInfotainmentsSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchInfotainments$' }))
        )
      )
    )
  );

  fetchInfotainment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchInfotainment),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchInfotainment$' })),
          this.settingsService.fetchInfotainment(id).pipe(
            map(({ data }) => SettingsActions.fetchInfotainmentSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchInfotainment$' }))
        )
      )
    )
  );

  createInfotainment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createInfotainment),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createInfotainment$' })),
          this.settingsService.createInfotainment(body).pipe(
            concatMap(({ data }) => [SettingsActions.createInfotainmentSuccess({ data }), AlertActions.display({ alert: { type: 'success', message: 'Infotainment created successfully!' } }), SettingsActions.fetchInfotainments({ params: { page: 1, per_page: 10 } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createInfotainment$' }))
        )
      )
    )
  );

  updateInfotainment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateInfotainment),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateInfotainment$' })),
          this.settingsService.updateInfotainment(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.updateInfotainmentSuccess({ data }), AlertActions.display({ alert: { type: 'success', message: 'Infotainment updated successfully!' } }), SettingsActions.fetchInfotainments({ params: { page: 1, per_page: 10 } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateInfotainment$' }))
        )
      )
    )
  );

  deleteInfotainment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteInfotainment),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteInfotainment$' })),
          this.settingsService.deleteInfotainment(id).pipe(
            concatMap(() => [SettingsActions.deleteInfotainmentSuccess(), AlertActions.display({ alert: { type: 'success', message: 'Infotainment deleted successfully!' } }), SettingsActions.fetchInfotainments({ params: { page: 1, per_page: 10 } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteInfotainment$' }))
        )
      )
    )
  );

  fetchVehicleEventStrategies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchVehicleEventStrategies),
      switchMap(({ vehicleId, page, perPage }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehicleEventStrategies$' })),
          this.settingsService.fetchVehicleEventStrategies(vehicleId, page, perPage).pipe(
            map(data => SettingsActions.fetchVehicleEventStrategiesSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehicleEventStrategies$' }))
        )
      )
    )
  );

  fetchVehicleEventStrategy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchVehicleEventStrategy),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchVehicleEventStrategy$' })),
          this.settingsService.fetchVehicleEventStrategy(id).pipe(
            map(({ data }) => SettingsActions.fetchVehicleEventStrategySuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchVehicleEventStrategy$' }))
        )
      )
    )
  );

  createVehicleEventStrategy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createVehicleEventStrategy),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createVehicleEventStrategy$' })),
          this.settingsService.createVehicleEventStrategy(body).pipe(
            concatMap(({ data }) => [SettingsActions.createVehicleEventStrategySuccess({ data }), AlertActions.display({ alert: { type: 'success', message: 'Event strategy created successfully!' } }), SettingsActions.fetchVehicleEventStrategies({ vehicleId: body.vehicle_id })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createVehicleEventStrategy$' }))
        )
      )
    )
  );

  updateVehicleEventStrategy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateVehicleEventStrategy),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateVehicleEventStrategy$' })),
          this.settingsService.updateVehicleEventStrategy(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.updateVehicleEventStrategySuccess({ data }), AlertActions.display({ alert: { type: 'success', message: 'Event strategy updated successfully!' } }), SettingsActions.fetchVehicleEventStrategies({ vehicleId: data.vehicle_id })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateVehicleEventStrategy$' }))
        )
      )
    )
  );

  deleteVehicleEventStrategy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteVehicleEventStrategy),
      withLatestFrom(this.store.select(SettingsSelectors.vehicleEventStrategy)),
      switchMap(([{ id }, strategy]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteVehicleEventStrategy$' })),
          this.settingsService.deleteVehicleEventStrategy(id).pipe(
            concatMap(() => [SettingsActions.deleteVehicleEventStrategySuccess(), AlertActions.display({ alert: { type: 'success', message: 'Event strategy deleted successfully!' } }), strategy ? SettingsActions.fetchVehicleEventStrategies({ vehicleId: strategy.vehicle_id }) : SettingsActions.resetVehicleEventStrategies()]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteVehicleEventStrategy$' }))
        )
      )
    )
  );

  fetchEventStrategiesResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchEventStrategiesResponse),
      withLatestFrom(this.store.select(SettingsSelectors.eventStrategiesResponseParams)),
      switchMap(([{ params }, eventStrategiesParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchEventStrategiesResponse$' })),
          of({ ...eventStrategiesParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setEventStrategyResponseParams({ params: newParams })),
                this.settingsService.fetchEventStrategies(newParams).pipe(
                  map(data => SettingsActions.fetchEventStrategiesResponseSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchEventStrategiesResponse$' }))
        )
      )
    )
  );

  fetchEventStrategy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchEventStrategy),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchEventStrategy$' })),
          this.settingsService.fetchEventStrategy(id).pipe(
            map(({ data }) => SettingsActions.fetchEventStrategySuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchEventStrategy$' }))
        )
      )
    )
  );

  createEventStrategy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createEventStrategy),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createEventStrategy$' })),
          this.settingsService.createEventStrategy(body).pipe(
            concatMap(({ data }) => [SettingsActions.createEventStrategySuccess({ data }), AlertActions.display({ alert: { type: 'success', message: 'Event strategy created successfully!' } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createEventStrategy$' }))
        )
      )
    )
  );

  updateEventStrategy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateEventStrategy),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateEventStrategy$' })),
          this.settingsService.updateEventStrategy(id, body).pipe(
            concatMap(({ data }) => [SettingsActions.updateEventStrategySuccess({ data }), AlertActions.display({ alert: { type: 'success', message: 'Event strategy updated successfully!' } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateEventStrategy$' }))
        )
      )
    )
  );

  deleteEventStrategy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.deleteEventStrategy),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'deleteEventStrategy$' })),
          this.settingsService.deleteEventStrategy(id).pipe(
            concatMap(() => [SettingsActions.deleteEventStrategySuccess(), AlertActions.display({ alert: { type: 'success', message: 'Event strategy deleted successfully!' } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'deleteEventStrategy$' }))
        )
      )
    )
  );

  fetchFleetEventStrategies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchFleetEventStrategies),
      withLatestFrom(this.store.select(SettingsSelectors.fleetEventStrategiesListParams)),
      switchMap(([{ params }, currentParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchFleetEventStrategies$' })),
          of({ ...currentParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setFleetEventStrategyListParams({ params: newParams })),
                this.settingsService.fetchFleetEventStrategies(newParams).pipe(
                  map(data => SettingsActions.fetchFleetEventStrategiesSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchFleetEventStrategies$' }))
        )
      )
    )
  );

  updateFleetEventStrategies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateFleetEventStrategies),
      switchMap(({ fleetId, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateFleetEventStrategies$' })),
          this.settingsService.updateFleetEventStrategies(fleetId, body).pipe(
            concatMap(() => [SettingsActions.updateFleetEventStrategiesSuccess(), AlertActions.display({ alert: { type: 'success', message: 'Fleet event strategies updated successfully!' } }), SettingsActions.fetchFleetEventStrategies({ params: { page: 1 } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateFleetEventStrategies$' }))
        )
      )
    )
  );

  createVehicleEventStrategySimple$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createVehicleEventStrategySimple),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createVehicleEventStrategySimple$' })),
          this.settingsService.createVehicleEventStrategySimple(body).pipe(
            concatMap(({ data }) => [SettingsActions.createVehicleEventStrategySimpleSuccess({ data }), AlertActions.display({ alert: { type: 'success', message: 'Event strategy template assigned successfully!' } }), SettingsActions.fetchVehicleEventStrategies({ vehicleId: body.vehicle_id })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createVehicleEventStrategySimple$' }))
        )
      )
    )
  );

  lookupVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.lookupVehicle),
      switchMap(({ regPlate }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'lookupVehicle$' })),
          of(SettingsActions.setVehicleLookupLoading({ loading: true })),
          this.settingsService.lookupVehicle(regPlate).pipe(
            map(({ data }) => SettingsActions.lookupVehicleSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'lookupVehicle$' }))
        )
      )
    )
  );

  validateVehicleStep$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.validateVehicleStep),
      switchMap(({ body, step }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'validateVehicleStep$' })),
          this.settingsService.validateVehicleStep(body, step).pipe(
            map(response => SettingsActions.validateVehicleStepSuccess({ data: response, step })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'validateVehicleStep$' }))
        )
      )
    )
  );

  validateVehicleEditStep$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.validateVehicleEditStep),
      switchMap(({ id, body, step }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'validateVehicleEditStep$' })),
          this.settingsService.validateVehicleEditStep(id, body, step).pipe(
            map(response => SettingsActions.validateVehicleStepSuccess({ data: response, step })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'validateVehicleEditStep$' }))
        )
      )
    )
  );

  fetchProviders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchProvidersList),
      switchMap(({ params }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchProviders$' })),
          this.settingsService.fetchProvidersList(params).pipe(
            map(data => SettingsActions.fetchProvidersListSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchProviders$' }))
        )
      )
    )
  );

  createProvider$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createProvider),
      switchMap(({ body }) =>
        this.settingsService.createProvider(body).pipe(
          concatMap(data => [
            SettingsActions.createProviderSuccess({ data }),
            SettingsActions.fetchProvidersList({}),
            AlertActions.display({ alert: { type: 'success', message: 'Provider created successfully!' } }) // Add success alert
          ]),
          catchError(() => EMPTY)
        )
      )
    )
  );

  fetchProviderDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchProviderDetail),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchProviderDetail$' })),
          this.settingsService.getProviderDetail(id).pipe(
            map(data => SettingsActions.fetchProviderDetailSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchProviderDetail$' }))
        )
      )
    )
  );

  updateProvider$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateProvider),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateProvider$' })),
          this.settingsService.updateProvider(id, body).pipe(
            concatMap(data => [
              SettingsActions.updateProviderSuccess({ data }),
              SettingsActions.fetchProvidersList({}),
              AlertActions.display({ alert: { type: 'success', message: 'Provider updated successfully!' } }) // Add success alert
            ]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateProvider$' }))
        )
      )
    )
  );

  fetchAdminsList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchAdminsList),
      withLatestFrom(this.store.select(SettingsSelectors.adminResponseParams)),
      switchMap(([{ params }, adminParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchAdminsList$' })),
          of({ ...adminParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                this.settingsService.fetchAdminsList(newParams).pipe(
                  map(data => SettingsActions.fetchAdminsListSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchAdminsList$' }))
        )
      )
    )
  );

  fetchAdminDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchAdminDetail),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchAdminDetail$' })),
          this.settingsService.getAdminDetail(id).pipe(
            map(data => SettingsActions.fetchAdminDetailSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchAdminDetail$' }))
        )
      )
    )
  );

  createAdmin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createAdmin),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createAdmin$' })),
          this.settingsService.createAdmin(body).pipe(
            concatMap(data => [SettingsActions.createAdminSuccess({ data }), SettingsActions.fetchAdminsList({ params: { page: 1, per_page: 15 } }), AlertActions.display({ alert: { type: 'success', message: 'Admin created successfully!' } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createAdmin$' }))
        )
      )
    )
  );

  updateAdmin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateAdmin),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateAdmin$' })),
          this.settingsService.updateAdmin(id, body).pipe(
            concatMap(data => [SettingsActions.updateAdminSuccess({ data }), SettingsActions.fetchAdminsList({ params: { page: 1, per_page: 15 } }), AlertActions.display({ alert: { type: 'success', message: 'Admin updated successfully!' } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateAdmin$' }))
        )
      )
    )
  );

  assignVehicleStrategies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.assignVehicleStrategies),
      switchMap(({ vehicleId, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'assignVehicleStrategies$' })),
          this.settingsService.assignVehicleStrategies(vehicleId, body).pipe(
            concatMap(() => [
              SettingsActions.assignVehicleStrategiesSuccess({ vehicleId }),
              AlertActions.display({
                alert: { type: 'success', message: 'Vehicle strategies assigned successfully!' }
              }),
              SettingsActions.fetchVehicleEventStrategies({ vehicleId })
            ]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'assignVehicleStrategies$' }))
        )
      )
    )
  );

  completeVehicleStrategies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.completeVehicleStrategies),
      switchMap(({ vehicleId, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'completeVehicleStrategies$' })),
          this.settingsService.completeVehicleStrategies(vehicleId, body).pipe(
            concatMap(() => [
              SettingsActions.completeVehicleStrategiesSuccess({ vehicleId }),
              AlertActions.display({
                alert: { type: 'success', message: 'Vehicle strategies completed successfully!' }
              }),
              SettingsActions.fetchVehicle({ id: vehicleId }),
              SettingsActions.fetchFleetsTree({ params: { show_vehicles: true, with_profiles: false, fleet_ids: undefined } })
            ]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'completeVehicleStrategies$' }))
        )
      )
    )
  );

  getVehicleStrategiesReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.getVehicleStrategiesReport),
      switchMap(({ vehicleId }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'getVehicleStrategiesReport$' })),
          this.settingsService.getVehicleStrategiesReport(vehicleId).pipe(
            map(reportBlob => {
              const url = window.URL.createObjectURL(reportBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `vehicle-strategies-report-${vehicleId}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);

              return SettingsActions.getVehicleStrategiesReportSuccess({
                vehicleId,
                reportBlob
              });
            }),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'getVehicleStrategiesReport$' }))
        )
      )
    )
  );

  fetchApplicationSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchApplicationSettings),
      withLatestFrom(this.store.select(SettingsSelectors.applicationSettingsParams)),
      switchMap(([{ params }, storeParams]) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchApplicationSettings$' })),
          of({ ...storeParams, ...params }).pipe(
            switchMap(newParams =>
              concat(
                of(SettingsActions.setApplicationSettingsParams({ params: newParams })),
                this.settingsService.fetchApplicationSettings(newParams).pipe(
                  map(data => SettingsActions.fetchApplicationSettingsSuccess({ data })),
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          of(applicationLoading({ loading: false, key: 'fetchApplicationSettings$' }))
        )
      )
    )
  );

  fetchApplicationSetting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchApplicationSetting),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchApplicationSetting$' })),
          this.settingsService.fetchApplicationSetting(id).pipe(
            map(({ data }) => SettingsActions.fetchApplicationSettingSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchApplicationSetting$' }))
        )
      )
    )
  );

  fetchApplicationSettingByName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.fetchApplicationSettingByName),
      switchMap(({ name }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'fetchApplicationSettingByName$' })),
          this.settingsService.fetchApplicationSettingByName(name).pipe(
            map(({ data }) => SettingsActions.fetchApplicationSettingByNameSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'fetchApplicationSettingByName$' }))
        )
      )
    )
  );

  createApplicationSetting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.createApplicationSetting),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'createApplicationSetting$' })),
          this.settingsService.createApplicationSetting(body).pipe(
            concatMap(({ data }) => [
              SettingsActions.createApplicationSettingSuccess({ data }),
              AlertActions.display({
                alert: {
                  type: 'success',
                  message: 'Application setting created successfully!'
                }
              })
            ]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'createApplicationSetting$' }))
        )
      )
    )
  );

  updateApplicationSetting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.updateApplicationSetting),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'updateApplicationSetting$' })),
          this.settingsService.updateApplicationSetting(id, body).pipe(
            concatMap(({ data }) => [
              SettingsActions.updateApplicationSettingSuccess({ data }),
              AlertActions.display({
                alert: {
                  type: 'success',
                  message: 'Application setting updated successfully!'
                }
              })
            ]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'updateApplicationSetting$' }))
        )
      )
    )
  );

  constructor(private readonly store: Store, private readonly actions$: Actions, private readonly settingsService: SettingsService, private readonly commonObjectsService: CommonObjectsService, private readonly authService: AuthService) {}
}
