import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, debounceTime, EMPTY, filter, map, of, Subject, Subscription, switchMap, take, tap, withLatestFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';
import { AuthSelectors } from 'src/app/store/auth/auth.selectors';
import { firstNonNullish, waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { AccessGroup, CreateUpdateUser, NotificationsElement } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';

export type EditUserData = { company_id: number } & (
  | {
      type: 'create';
      id?: number | undefined | null;
    }
  | {
      type: 'edit';
      id: number;
    }
);

interface CategoryMapping {
  [key: string]: string;
}

const STANDARD_NOTIFICATION_KEYS = ['vehicle_checks', 'accidents', 'vehicle_issues'];

@Component({
  templateUrl: './settings-core-roles-create-user-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings-core-roles-create-user-dialog'
})
export class SettingsCoreRolesCreateUserDialogComponent implements OnInit, OnDestroy {
  module: 'details' | 'notifications' = 'details';

  notifications$ = this.store.select(SettingsSelectors.notifications);
  loading$ = this.store.select(SettingsSelectors.userNotificationsLoading);
  selectedNotifications: { [key: string]: boolean } = {};

  occurredNotifications: { [key: string]: boolean } = {};
  escalatedNotifications: { [key: string]: boolean } = {};

  searchControl = this.fb.control('');
  filteredNotifications: { [key: string]: boolean } = {};

  selectedCount = 0;
  allSelected = false;

  private readonly destroy$ = new Subject<void>();
  private readonly sub = new Subscription();

  bodyGroup = this.fb.group({
    company: this.data.company_id,
    name: ['', Validators.required],
    email: ['', Validators.required],
    role: [0, Validators.required],
    fleet_access_ids: this.fb.control<number[]>([], Validators.required)
  });
  title = '';
  button = '';
  previousCompanyId = this.data.company_id;
  lockedCompanyId: number | null = null;
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);

  companyOptions$ = this.store.select(SettingsSelectors.companyElements).pipe(
    map((elements): SelectControl<number>[] =>
      elements.map(element => ({
        label: element.name,
        value: element.id
      }))
    )
  );

  rolesOptions$ = this.store.select(SettingsSelectors.companyRolesSelect).pipe(
    map((elements): SelectControl<number>[] =>
      elements.map(element => ({
        label: element.name,
        value: element.id
      }))
    )
  );

  fleetsOptions$ = this.store.select(SettingsSelectors.fleetAccess).pipe(
    map((elements): SelectControl<number>[] =>
      elements.map(element => ({
        label: element.name,
        value: element.id
      }))
    )
  );

  readonly categoryMappings: CategoryMapping = {
    custom_event: 'Custom event',
    customized_events: 'Customized events',
    vehicle_issues: 'Vehicle issues',
    system_issues: 'System issues',
    driver_issues: 'Driver issues',
    caused_by_driver: 'Caused by driver',
    external: 'External'
  };

  readonly categories = Object.keys(this.categoryMappings);

  constructor(private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, @Inject(DIALOG_DATA) public data: EditUserData, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef) {}

  isStandardNotification(name: string): boolean {
    return STANDARD_NOTIFICATION_KEYS.includes(name);
  }

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.fetchCompanyRoles({ params: { company_id: this.data.company_id, page: 1, per_page: 100, only_custom_roles: false }, onlySelect: true }));
    this.store.dispatch(SettingsActions.fetchFleetAccess({ params: { company_id: this.data.company_id, page: 1, per_page: 100 } }));

    const valueChangesSub = this.bodyGroup.valueChanges
      .pipe(
        filter(values => values.company != this.previousCompanyId),
        tap(values => {
          this.previousCompanyId = values.company!;
          this.store.dispatch(
            SettingsActions.fetchCompanyRoles({
              params: { company_id: values.company!, page: 1, per_page: 100, only_custom_roles: false },
              onlySelect: true
            })
          );
          this.store.dispatch(
            SettingsActions.fetchFleetAccess({
              params: { company_id: values.company!, page: 1, per_page: 100 }
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in bodyGroup valueChanges:', error);
        }
      });

    this.sub.add(valueChangesSub);

    const userSub = this.loggedInUser$
      .pipe(
        tap(user => {
          if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
            const control = this.bodyGroup.controls.company;
            control.disable();
            control.setValue(user?.company_id ?? null);
            this.lockedCompanyId = user?.company_id ?? null;
            this.cdr.detectChanges();
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in loggedInUser$ subscription:', error);
        }
      });

    this.sub.add(userSub);

    this.store.dispatch(
      SettingsActions.fetchNotifications({
        params: { company_id: this.data.company_id }
      })
    );

    if (this.data.type == 'create') {
      this.title = 'Create new user';
      this.button = 'Add user';

      const createNotificationsSub = this.notifications$
        .pipe(
          filter((notifications): notifications is NotificationsElement => !!notifications),
          tap((notifications: NotificationsElement) => {
            try {
              this.selectedNotifications = {
                vehicle_checks: false,
                accidents: false,
                vehicle_issues: false
              };

              this.occurredNotifications = {};
              this.escalatedNotifications = {};

              const settings = notifications.escalation_settings;
              Object.values(settings?.event_occurred ?? {}).forEach(categoryEvents => {
                Object.values(categoryEvents ?? {}).forEach(event => {
                  if (event) {
                    this.selectedNotifications[event.default_name] = false;
                    this.occurredNotifications[event.default_name] = false;
                    this.escalatedNotifications[event.default_name] = false;
                  }
                });
              });

              this.updateSelectedCount();
              this.cdr.detectChanges();
            } catch (error) {
              console.error('Error processing notifications:', error);
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (error: unknown) => {
            console.error('Error in notifications$ subscription (create mode):', error);
          }
        });

      this.sub.add(createNotificationsSub);
      return;
    }

    this.title = 'User settings';
    this.button = 'Save';

    const id = this.data.id;

    const fetchUserSub = this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.fetchFleetAccessSuccess]),
        firstNonNullish(),
        tap(() => this.store.dispatch(SettingsActions.fetchUser({ id }))),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error fetching user after fleet access success:', error);
        }
      });

    this.sub.add(fetchUserSub);

    const userDataSub = this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.fetchUserSuccess]),
        switchMap(() => this.store.select(SettingsSelectors.user)),
        firstNonNullish(),
        withLatestFrom(this.rolesOptions$),
        tap(([user, roles]) => {
          const role = roles.filter(option => option.label === user.role)?.[0]?.value;
          this.bodyGroup.patchValue({
            company: this.data!.company_id,
            email: user.email,
            role: role,
            fleet_access_ids: user.company_fleet_accesses,
            name: user.name
          });

          if (this.data.id) {
            this.store.dispatch(SettingsActions.fetchUserNotifications({ id: this.data.id }));
          }

          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error loading user data:', error);
        }
      });

    this.sub.add(userDataSub);

    const userNotificationsSub = this.actions$
      .pipe(
        ofType(SettingsActions.fetchUserNotificationsSuccess),
        tap(action => {
          const userNotifications = action.data;

          this.selectedNotifications = {};
          this.occurredNotifications = {};
          this.escalatedNotifications = {};

          STANDARD_NOTIFICATION_KEYS.forEach(key => {
            this.selectedNotifications[key] = false;
          });

          if (userNotifications?.notifications) {
            const standardNotifications = userNotifications.notifications.filter(n => this.isStandardNotification(n.name) && !n.context);

            standardNotifications.forEach(notification => {
              this.selectedNotifications[notification.name] = notification.enabled;
            });

            const nonStandardNotifications = userNotifications.notifications.filter(n => !this.isStandardNotification(n.name) && n.context);

            interface NotificationStates {
              occurred: boolean;
              escalated: boolean;
            }

            const groupedNotifications: Record<string, NotificationStates> = {};

            nonStandardNotifications.forEach(notification => {
              const { name, enabled, context } = notification;

              if (!groupedNotifications[name]) {
                groupedNotifications[name] = { occurred: false, escalated: false };
              }

              if (context === 'event_occurred') {
                groupedNotifications[name].occurred = enabled;
              } else if (context === 'event_escalated') {
                groupedNotifications[name].escalated = enabled;
              }
            });

            Object.entries(groupedNotifications).forEach(([name, states]) => {
              this.occurredNotifications[name] = states.occurred;
              this.escalatedNotifications[name] = states.escalated;
              this.selectedNotifications[name] = states.occurred || states.escalated;
            });
          }

          if (userNotifications?.notifications) {
            userNotifications.notifications.forEach(notification => {
              const { name } = notification;

              this.selectedNotifications[name] ??= false;
              this.occurredNotifications[name] ??= false;
              this.escalatedNotifications[name] ??= false;
            });
          }

          this.updateSelectedCount();
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in fetchUserNotificationsSuccess:', error);
        }
      });

    this.sub.add(userNotificationsSub);

    if (this.data.type === 'edit') {
      const userId = this.data.id;

      const editNotificationsSub = this.notifications$
        .pipe(
          filter((notifications): notifications is NotificationsElement => !!notifications),
          tap((notifications: NotificationsElement) => {
            try {
              this.selectedNotifications = {
                vehicle_checks: false,
                accidents: false,
                vehicle_issues: false
              };

              this.occurredNotifications = {};
              this.escalatedNotifications = {};

              const settings = notifications.escalation_settings;

              if (settings?.vehicle_checks && Array.isArray(settings.vehicle_checks)) {
                this.selectedNotifications['vehicle_checks'] = settings.vehicle_checks.includes(userId);
              }

              if (settings?.accidents && Array.isArray(settings.accidents)) {
                this.selectedNotifications['accidents'] = settings.accidents.includes(userId);
              }

              if (settings?.vehicle_issues && Array.isArray(settings.vehicle_issues)) {
                this.selectedNotifications['vehicle_issues'] = settings.vehicle_issues.includes(userId);
              }

              if (settings?.event_occurred) {
                Object.entries(settings.event_occurred).forEach(([categoryKey, categoryEvents]) => {
                  if (categoryEvents) {
                    Object.entries(categoryEvents).forEach(([eventKey, event]) => {
                      if (event?.default_name && event?.data) {
                        const eventName = event.default_name;
                        const occurredData = Array.isArray(event.data) ? event.data : Object.values(event.data || {});
                        const hasOccurred = occurredData.includes(userId);

                        this.occurredNotifications[eventName] ??= false;

                        this.occurredNotifications[eventName] = hasOccurred;

                        if (hasOccurred) {
                          this.selectedNotifications[eventName] = true;
                        }
                      }
                    });
                  }
                });
              }

              if (settings?.event_escalated) {
                Object.entries(settings.event_escalated).forEach(([categoryKey, categoryEvents]) => {
                  if (categoryEvents) {
                    Object.entries(categoryEvents).forEach(([eventKey, event]) => {
                      if (event?.default_name && event?.data) {
                        const eventName = event.default_name;
                        const escalatedData = Array.isArray(event.data) ? event.data : Object.values(event.data || {});
                        const hasEscalated = escalatedData.includes(userId);

                        this.escalatedNotifications[eventName] ??= false;
                        this.escalatedNotifications[eventName] = hasEscalated;

                        if (hasEscalated) {
                          this.selectedNotifications[eventName] = true;
                        }
                      }
                    });
                  }
                });
              }

              Object.keys(this.occurredNotifications).forEach(eventName => {
                this.escalatedNotifications[eventName] ??= false;
              });

              Object.keys(this.escalatedNotifications).forEach(eventName => {
                this.occurredNotifications[eventName] ??= false;
              });

              Object.keys(this.occurredNotifications).forEach(eventName => {
                this.selectedNotifications[eventName] = this.occurredNotifications[eventName] || this.escalatedNotifications[eventName];
              });

              Object.values(settings?.event_occurred ?? {}).forEach(categoryEvents => {
                Object.values(categoryEvents ?? {}).forEach(event => {
                  const name = event?.default_name;
                  if (name) {
                    this.selectedNotifications[name] ??= false;
                    this.occurredNotifications[name] ??= false;
                    this.escalatedNotifications[name] ??= false;
                  }
                });
              });

              this.updateSelectedCount();
              this.cdr.detectChanges();
            } catch (error) {
              console.error('Error processing notifications in edit mode:', error);
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (error: unknown) => {
            console.error('Error in notifications$ subscription (edit mode):', error);
          }
        });

      this.sub.add(editNotificationsSub);
    }

    const searchSub = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        tap(searchValue => {
          this.filterNotifications(searchValue || '');
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in searchControl valueChanges:', error);
        }
      });

    this.sub.add(searchSub);
  }

  toggleNotification(name: string, enabled: boolean) {
    this.selectedNotifications[name] = enabled;

    if (!this.isStandardNotification(name)) {
      if (!enabled) {
        this.occurredNotifications[name] = false;
        this.escalatedNotifications[name] = false;
      } else if (!this.occurredNotifications[name] && !this.escalatedNotifications[name]) {
        this.occurredNotifications[name] = true;
        this.escalatedNotifications[name] = true;
      }
    }

    if (this.filteredNotifications[name] !== undefined) {
      this.filteredNotifications[name] = enabled;
    }

    this.updateSelectedCount();
  }

  toggleNotificationOccurred(name: string, occurred: boolean) {
    this.occurredNotifications[name] = occurred;
    this.selectedNotifications[name] = occurred || this.escalatedNotifications[name];

    if (this.filteredNotifications[name] !== undefined) {
      this.filteredNotifications[name] = this.selectedNotifications[name];
    }

    this.updateSelectedCount();
  }

  toggleNotificationEscalated(name: string, escalated: boolean) {
    this.escalatedNotifications[name] = escalated;
    this.selectedNotifications[name] = escalated || this.occurredNotifications[name];

    if (this.filteredNotifications[name] !== undefined) {
      this.filteredNotifications[name] = this.selectedNotifications[name];
    }

    this.updateSelectedCount();
  }

  saveNotifications() {
    if (!this.data.id) return;

    const notifications: Array<{ name: string; enabled: boolean; context?: 'event_occurred' | 'event_escalated' }> = [];

    STANDARD_NOTIFICATION_KEYS.forEach(name => {
      notifications.push({
        name,
        enabled: this.selectedNotifications[name] || false
      });
    });

    const nonStandardNotifications = Object.keys(this.selectedNotifications).filter(name => !this.isStandardNotification(name));

    nonStandardNotifications.forEach(name => {
      notifications.push({
        name,
        enabled: this.occurredNotifications[name] || false,
        context: 'event_occurred'
      });

      notifications.push({
        name,
        enabled: this.escalatedNotifications[name] || false,
        context: 'event_escalated'
      });
    });

    this.store.dispatch(
      SettingsActions.updateUserNotifications({
        id: this.data.id,
        body: { notifications }
      })
    );

    const updateSub = this.actions$
      .pipe(
        ofType(SettingsActions.updateUserNotificationsSuccess),
        take(1),
        tap(() => {
          this.store.dispatch(
            SettingsActions.fetchNotifications({
              params: { company_id: this.data.company_id }
            })
          );

          if (this.data.id) {
            this.store.dispatch(SettingsActions.fetchUserNotifications({ id: this.data.id }));
          }
        }),
        catchError((error: unknown) => {
          console.error('Error updating notifications:', error);
          return EMPTY;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.sub.add(updateSub);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleAddUserClick() {
    this.markFormAsTouched();

    this.store.dispatch(SettingsActions.createUser({ body: this.getBody() }));

    const createSub = this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.createUserSuccess]),
        switchMap(() => this.store.select(SettingsSelectors.user)),
        firstNonNullish(),
        tap((user): void => {
          if (!user || !user.id) {
            return;
          }
          this.data.id = user.id;
          this.saveNotifications();
          this.store.dispatch(SettingsActions.fetchUsersResponse({ params: {} }));
          this.dialogRef.close();
        }),
        catchError((error: unknown) => {
          console.error('Error creating user:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in handleAddUserClick subscription:', error);
        }
      });

    this.sub.add(createSub);
  }

  handleUpdateUserClick(id: number) {
    this.markFormAsTouched();

    this.store.dispatch(SettingsActions.updateUser({ id, body: this.getBody() }));

    const updateSub = this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.updateUserSuccess]),
        tap((): void => this.saveNotifications()),
        tap((): void => this.store.dispatch(SettingsActions.fetchUsersResponse({ params: {} }))),
        tap((): void => this.dialogRef.close()),
        catchError((error: unknown) => {
          console.error('Error updating user:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in handleUpdateUserClick subscription:', error);
        }
      });

    this.sub.add(updateSub);
  }

  private getBody(): CreateUpdateUser {
    const form = this.bodyGroup.value;
    return {
      company_id: this.lockedCompanyId ?? form.company!,
      email: form.email!,
      fleet_access_ids: (form.fleet_access_ids ?? []).join(','),
      name: form.name!,
      role_id: form.role!
    };
  }

  getIconNumber(type: string): string {
    const iconMap: { [key: string]: string } = {
      vehicle_checks: '55',
      accidents: '54',
      vehicle_issues: '56'
    };
    return iconMap[type] || '49';
  }

  formatNotificationName(name: string): string {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  handleModeClick(mode: 'details' | 'notifications') {
    this.module = mode;
  }

  hasCategoryEvents(notifications: NotificationsElement, category: string): boolean {
    return !!notifications?.escalation_settings?.event_occurred?.[category];
  }

  getEventsForCategory(notifications: NotificationsElement, category: string) {
    if (!notifications?.escalation_settings?.event_occurred?.[category]) {
      return [];
    }

    return Object.values(notifications.escalation_settings.event_occurred[category]).filter((event): event is { default_name: string; name: string; event_icon: string; data: number[] } => !!event && 'default_name' in event && 'event_icon' in event && 'data' in event && 'name' in event);
  }

  getNotificationIcon(name: string): string {
    const iconMap: { [key: string]: string } = {
      vehicle_checks: 'assets/svg/icons-gray-back/55.svg',
      accidents: 'assets/svg/icons-gray-back/54.svg',
      vehicle_issues: 'assets/svg/icons-gray-back/56.svg'
    };
    return iconMap[name] || 'assets/svg/icons-gray-back/49.svg';
  }

  getCategoryLabel(key: string): string {
    return this.categoryMappings[key] || key;
  }

  filterNotifications(searchTerm: string) {
    const searchLower = searchTerm.toLowerCase();
    this.filteredNotifications = {};

    Object.entries(this.selectedNotifications).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchLower)) {
        this.filteredNotifications[key] = value;
      }
    });

    this.updateSelectedCount();
  }

  updateSelectedCount() {
    const notificationsToCount = Object.keys(this.filteredNotifications).length > 0 ? this.filteredNotifications : this.selectedNotifications;

    this.selectedCount = Object.values(notificationsToCount).filter(Boolean).length;
    this.allSelected = this.selectedCount === Object.keys(notificationsToCount).length;
    this.cdr.detectChanges();
  }

  handleSelectAllClick(checked: boolean) {
    const notificationsToUpdate = Object.keys(this.filteredNotifications).length > 0 ? this.filteredNotifications : this.selectedNotifications;

    Object.keys(notificationsToUpdate).forEach(key => {
      this.selectedNotifications[key] = checked;

      if (!this.isStandardNotification(key)) {
        if (checked) {
          this.occurredNotifications[key] = true;
          this.escalatedNotifications[key] = true;
        } else {
          this.occurredNotifications[key] = false;
          this.escalatedNotifications[key] = false;
        }
      }

      if (this.filteredNotifications[key] !== undefined) {
        this.filteredNotifications[key] = checked;
      }
    });

    this.allSelected = checked;
    this.updateSelectedCount();
  }

  getVisibleNotifications() {
    return Object.keys(this.filteredNotifications).length > 0 ? this.filteredNotifications : this.selectedNotifications;
  }

  shouldShowNotification(name: string): boolean {
    const searchTerm = this.searchControl.value?.toLowerCase() ?? '';
    if (!searchTerm) return true;
    return name.toLowerCase().includes(searchTerm);
  }

  private markFormAsTouched() {
    Object.keys(this.bodyGroup.controls).forEach(key => {
      const control = this.bodyGroup.get(key);
      control?.markAsTouched();
    });
    this.cdr.detectChanges();
  }

  protected readonly accessGroup = AccessGroup;
  protected readonly Object = Object;
  protected readonly JSON = JSON;
}
