import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, debounceTime, map, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersTreeElement } from 'src/app/store/common-objects/common-objects.model';
import NotificationUtil from 'src/app/util/notification';
import { AppState } from '../../../../store/app-store.model';
import { SettingsActions } from '../../settings.actions';
import { AccessGroup, NotificationsElement, NotificationType } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { NotificationsEditDialog, SettingsCoreNotificationsEditDialogComponent } from './settings-core-notifications-edit-dialog/settings-core-notifications-edit-dialog.component';

interface Event {
  id: string;
  useId: boolean;
  name: string;
  default_name: string;
  icon: string;
  users: number[];
  usersData: User[];
  length: number;
}

interface EventGroup {
  name: string;
  events: Event[];
}

interface User {
  name: string;
  email: string;
}

interface Escalations {
  main: Event[];
  groups: EventGroup[];
}

@Component({
  selector: 'app-settings-core-notifications',
  templateUrl: './settings-core-notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreNotificationsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  accessGroup = AccessGroup;
  private readonly sub?: Subscription;
  selectedCompanyId?: number;
  selectedSettingsId?: number;
  searchControl = this.fb.control<string>('');
  openedEvent: string | null = null;
  escalations!: Escalations;
  tempEscalations$ = new BehaviorSubject<Escalations | undefined>(undefined);
  openedTempEvent: string[] = [];
  companyElements$ = this.store.select(SettingsSelectors.companyElements);
  escalations$ = combineLatest([this.store.select(SettingsSelectors.notifications), this.store.select(SettingsSelectors.usersTree)]).pipe(
    map(([notifications, usersTree]): Escalations => {
      if (!notifications?.escalation_settings || !usersTree) {
        return {
          main: [],
          groups: []
        };
      }

      this.selectedSettingsId = notifications.id;
      return this.prepareEscalations(notifications.escalation_settings, usersTree);
    })
  );

  constructor(private readonly fb: FormBuilder, private readonly store: Store<AppState>, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.fetchUsersTree({ params: { roles: undefined, ignored_roles: 'DRIVER' } }));
    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));

    this.escalations$
      .pipe(
        tap(escalations => (this.escalations = escalations)),
        tap(escalations => {
          const search = this.searchControl.value;
          this.tempEscalations$.next(this.getTempEscalations(escalations, search));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        tap(value => this.tempEscalations$.next(this.getTempEscalations(this.escalations, value))),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private getTempEscalations(escalations: Escalations, search: string | null): Escalations {
    if (!search || search === '') {
      this.openedTempEvent = [];
      return escalations;
    }

    this.openedEvent = null;

    const lowerCaseSearch = search.toLowerCase();

    const main = this.getTempEvents(escalations.main, lowerCaseSearch);
    const openedTempEvent: string[] = [];
    main.forEach(event => {
      if (event.usersData.length > 0) {
        openedTempEvent.push(event.id);
      }
    });

    const groups = escalations.groups
      .map(group => {
        const events = this.getTempEvents(group.events, lowerCaseSearch);
        return {
          ...group,
          events
        };
      })
      .filter(group => group.events.length > 0);

    groups.forEach(group =>
      group.events.forEach(event => {
        if (event.usersData.length > 0) {
          openedTempEvent.push(event.id);
        }
      })
    );

    this.openedTempEvent = openedTempEvent;

    return {
      main,
      groups
    };
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  handleCompanyClick(companyId: number | undefined) {
    this.selectedCompanyId = companyId;
    if (companyId) {
      this.store.dispatch(SettingsActions.fetchNotifications({ params: { company_id: companyId } }));
    }
  }

  handleEditClick(event: Event, usersIds: number[]): void {
    const context = event.id.startsWith('event_escalated:') ? 'event_escalated' : 'event_occurred';
    this.dialog.open<void, NotificationsEditDialog>(SettingsCoreNotificationsEditDialogComponent, {
      data: {
        name: event.name,
        defaultName: event.default_name,
        id: this.selectedSettingsId!,
        usersIds,
        company_id: this.selectedCompanyId!,
        context
      }
    });
  }

  handleOpenUsersClick(id: string) {
    if (id === this.openedEvent) {
      this.openedEvent = null;
      return;
    }
    this.openedEvent = id;
  }
  private getTempEvents(events: Event[], search: string): Event[] {
    return events
      .map(event => {
        const users = event.usersData.filter(user => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search));

        if (users.length > 0) {
          return {
            ...event,
            usersData: users
          };
        }
        if (event.default_name.toLowerCase().includes(search)) {
          return {
            ...event
          };
        }
        return null;
      })
      .filter(event => event != null) as Event[];
  }

  private prepareEscalations(escalationsSettings: NotificationsElement['escalation_settings'], users: UsersTreeElement[]): Escalations {
    return {
      main: this.prepareMain(escalationsSettings, users),
      groups: [...this.prepareEventGroups(escalationsSettings.event_occurred, escalationsSettings.event_escalated, users, 'event_occurred'), ...this.prepareEventGroups(escalationsSettings.event_escalated, escalationsSettings.event_occurred, users, 'event_escalated')]
    };
  }

  private prepareMain(escalationsSettings: NotificationsElement['escalation_settings'], users: UsersTreeElement[]): Event[] {
    const { accidents, vehicle_checks, vehicle_issues } = escalationsSettings;
    const notificationsTypes = {
      [NotificationType.VEHICLE_CHECKS]: vehicle_checks,
      [NotificationType.VEHICLE_ISSUES]: vehicle_issues,
      [NotificationType.ACCIDENTS]: accidents
    };
    return Object.entries(notificationsTypes).map(
      ([key, value]): Event => ({
        id: key,
        useId: true,
        name: NotificationUtil.getName(key as NotificationType),
        default_name: key.toLowerCase(),
        users: value,
        usersData: users
          .filter(user => value.includes(user.id))
          .map(user => ({
            name: user.name,
            email: user.email
          })),
        length: value.length,
        icon: NotificationUtil.getIcon(key as NotificationType)
      })
    );
  }

  private prepareEventGroups(contextData: { [key: string]: { [key: string]: { data: number[]; name: string; default_name: string; event_icon: string } } }, otherContextData: { [key: string]: { [key: string]: { data: number[]; name: string; default_name: string; event_icon: string } } } | undefined, users: UsersTreeElement[], context: 'event_occurred' | 'event_escalated'): EventGroup[] {
    if (!contextData || typeof contextData !== 'object') {
      return [];
    }

    const seenEvents = new Set<string>();

    return Object.entries(contextData)
      .map(([key, value]): EventGroup | null => {
        if (!value || typeof value !== 'object') {
          return null;
        }

        const events = this.prepareEvents(value, otherContextData, users, seenEvents, context);

        if (events.length === 0) {
          return null;
        }

        return {
          name: this.prepareGroupName(key),
          events
        };
      })
      .filter((group): group is EventGroup => group !== null);
  }

  private prepareEvents(eventsObject: { [key: string]: { data: number[]; default_name: string; name: string; event_icon: string } }, otherContextData: { [key: string]: { [key: string]: { data: number[]; name: string; default_name: string; event_icon: string } } } | undefined, users: UsersTreeElement[], seenEvents: Set<string>, context: 'event_occurred' | 'event_escalated'): Event[] {
    if (!eventsObject || typeof eventsObject !== 'object') {
      return [];
    }

    return Object.entries(eventsObject)
      .filter(([, value]) => {
        if (seenEvents.has(value.default_name)) {
          return false;
        }
        if (!value || !Array.isArray(value.data)) {
          return false;
        }
        seenEvents.add(value.default_name);
        return true;
      })
      .map(([, value]): Event => {
        let otherContextUsers: number[] = [];

        if (otherContextData) {
          for (const groupKey in otherContextData) {
            const group = otherContextData[groupKey];

            for (const eventKey in group) {
              const event = group[eventKey];

              if (event.default_name === value.default_name && Array.isArray(event.data)) {
                otherContextUsers = event.data;
                break;
              }
            }

            if (otherContextUsers.length > 0) break;
          }
        }

        const combinedUsers = [...new Set([...value.data, ...otherContextUsers])];

        return {
          id: `${context}:${value.default_name}`,
          useId: false,
          name: value.name,
          default_name: value.default_name,
          icon: value.event_icon,
          length: combinedUsers.length,
          users: value.data,
          usersData: users
            .filter(user => combinedUsers.includes(user.id))
            .map(user => ({
              name: user.name,
              email: user.email
            }))
        };
      });
  }

  private prepareGroupName(name: string): string {
    let groupName = name.replace(new RegExp('_', 'g'), ' ');
    return groupName.charAt(0).toUpperCase() + groupName.slice(1);
  }
}
