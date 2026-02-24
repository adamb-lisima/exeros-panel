import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, debounceTime, filter, map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { NotificationsElement, UpdateEventInNotificationBody } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';

export interface NotificationsEditDialog {
  name: string;
  defaultName: string;
  id: number;
  usersIds: number[];
  company_id: number;
  context?: 'event_occurred' | 'event_escalated';
}

interface User {
  id: number;
  name: string;
  email: string;
  checked: boolean;
  occurredChecked: boolean;
  escalatedChecked: boolean;
}

const STANDARD_NOTIFICATION_KEYS = ['vehicle_checks', 'accidents', 'vehicle_issues'];

@Component({
  templateUrl: './settings-core-notifications-edit-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreNotificationsEditDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  title: string = '';
  searchControl = this.fb.control<string>('');
  allUsers: boolean | null = false;
  allOccurredUsers: boolean | null = false;
  allEscalatedUsers: boolean | null = false;
  tempUsers: User[] = [];
  isStandardNotificationType = false;

  users: User[] = [];

  private initializing = true;

  constructor(@Inject(DIALOG_DATA) public data: NotificationsEditDialog, private readonly dialogRef: DialogRef, private readonly fb: FormBuilder, private readonly cdr: ChangeDetectorRef, private readonly store: Store, private readonly action$: Actions) {
    this.title = `Assign users to: ${data.name}`;

    this.isStandardNotificationType = STANDARD_NOTIFICATION_KEYS.includes(this.data.defaultName);
  }

  ngOnInit(): void {
    combineLatest([this.store.select(SettingsSelectors.notifications).pipe(filter(n => n !== null)), this.store.select(SettingsSelectors.usersTree).pipe(filter(u => u !== null && u.length > 0))])
      .pipe(
        filter(() => this.initializing),
        tap(() => {
          this.initializing = false;
        }),
        map(([notifications, usersTree]) => {
          if (!notifications || !usersTree) {
            return [];
          }

          if (this.isStandardNotificationType) {
            const filteredUsers = usersTree
              .filter(user => user.company_id === this.data.company_id)
              .map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                checked: this.data.usersIds.includes(user.id),
                occurredChecked: false,
                escalatedChecked: false
              }));

            return filteredUsers;
          } else {
            const eventOccurredData = this.findEventData(notifications, 'event_occurred', this.data.defaultName);
            const eventEscalatedData = this.findEventData(notifications, 'event_escalated', this.data.defaultName);

            const filteredUsers = usersTree
              .filter(user => user.company_id === this.data.company_id)
              .map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                checked: this.data.usersIds.includes(user.id),
                occurredChecked: eventOccurredData ? eventOccurredData.includes(user.id) : false,
                escalatedChecked: eventEscalatedData ? eventEscalatedData.includes(user.id) : false
              }));

            return filteredUsers;
          }
        }),
        tap(users => {
          this.users = users;

          if (!this.isStandardNotificationType) {
            this.users.forEach(user => {
              if (user.occurredChecked || user.escalatedChecked) {
                user.checked = true;
              }
            });
          }

          this.allUsers = this.checkAllUsers(this.users);
          this.allOccurredUsers = this.checkAllOccurredUsers(this.users);
          this.allEscalatedUsers = this.checkAllEscalatedUsers(this.users);
          this.tempUsers = this.getTempUsers('', this.users);
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.searchControl.valueChanges
      .pipe(
        filter((value): value is string => value != null),
        debounceTime(200),
        tap(value => {
          this.tempUsers = this.getTempUsers(value, this.users);
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private findEventData(notifications: NotificationsElement | null, context: 'event_occurred' | 'event_escalated', eventName: string | undefined): number[] | null {
    if (!notifications?.escalation_settings || !eventName) {
      return null;
    }

    const contextData = notifications.escalation_settings[context];
    if (!contextData) {
      return null;
    }

    for (const groupKey in contextData) {
      if (!Object.prototype.hasOwnProperty.call(contextData, groupKey)) continue; // nosonar - TypeScript nie popiera Object.hasOwn()

      const group = contextData[groupKey];

      for (const eventKey in group) {
        if (!Object.prototype.hasOwnProperty.call(group, eventKey)) continue; // nosonar - TypeScript nie popiera Object.hasOwn()

        const event = group[eventKey];

        if (event.default_name === eventName && Array.isArray(event.data)) {
          return event.data;
        }
      }
    }

    return null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTempUsers(searchValue: string, users: User[]): User[] {
    const filteredUsers = this.getFilteredUsers(searchValue, users).sort(this.sortUsers);
    return filteredUsers;
  }

  handleCheckboxChange(value: boolean, id: number): void {
    const users = [...this.users];
    const user = users.find(user => user.id === id)!;
    user.checked = value;

    if (!this.isStandardNotificationType) {
      if (!value) {
        user.occurredChecked = false;
        user.escalatedChecked = false;
      }
    }

    this.allUsers = this.checkAllUsers(users);

    if (!this.isStandardNotificationType) {
      this.allOccurredUsers = this.checkAllOccurredUsers(users);
      this.allEscalatedUsers = this.checkAllEscalatedUsers(users);
    }

    this.users = users;
    const searchValue = this.searchControl.value ?? '';
    this.tempUsers = this.getTempUsers(searchValue, users);
    this.cdr.detectChanges();
  }

  handleOccurredCheckboxChange(value: boolean, id: number): void {
    const users = [...this.users];
    const user = users.find(user => user.id === id)!;
    if (user.checked) {
      user.occurredChecked = value;
      this.allOccurredUsers = this.checkAllOccurredUsers(users);
      this.users = users;
      const searchValue = this.searchControl.value ?? '';
      this.tempUsers = this.getTempUsers(searchValue, users);
      this.cdr.detectChanges();
    }
  }

  handleEscalatedCheckboxChange(value: boolean, id: number): void {
    const users = [...this.users];
    const user = users.find(user => user.id === id)!;
    if (user.checked) {
      user.escalatedChecked = value;
      this.allEscalatedUsers = this.checkAllEscalatedUsers(users);
      this.users = users;
      const searchValue = this.searchControl.value ?? '';
      this.tempUsers = this.getTempUsers(searchValue, users);
      this.cdr.detectChanges();
    }
  }

  handleAllUsersClick(value: boolean) {
    this.allUsers = value;

    if (this.isStandardNotificationType) {
      const users = this.users.map(user => ({
        ...user,
        checked: value
      }));
      this.users = users;
    } else {
      const users = this.users.map(user => {
        const updatedUser = { ...user, checked: value };
        if (!value) {
          updatedUser.occurredChecked = false;
          updatedUser.escalatedChecked = false;
        }
        return updatedUser;
      });
      this.users = users;
      this.allOccurredUsers = this.checkAllOccurredUsers(users);
      this.allEscalatedUsers = this.checkAllEscalatedUsers(users);
    }

    const searchValue = this.searchControl.value ?? '';
    this.tempUsers = this.getTempUsers(searchValue, this.users);
    this.cdr.detectChanges();
  }

  handleAllOccurredUsersClick(value: boolean) {
    this.allOccurredUsers = value;
    const users = this.users.map(user => ({
      ...user,
      occurredChecked: user.checked ? value : false
    }));

    this.users = users;
    const searchValue = this.searchControl.value ?? '';
    this.tempUsers = this.getTempUsers(searchValue, users);
    this.cdr.detectChanges();
  }

  handleAllEscalatedUsersClick(value: boolean) {
    this.allEscalatedUsers = value;
    const users = this.users.map(user => ({
      ...user,
      escalatedChecked: user.checked ? value : false
    }));

    this.users = users;
    const searchValue = this.searchControl.value ?? '';
    this.tempUsers = this.getTempUsers(searchValue, users);
    this.cdr.detectChanges();
  }

  handleEditNotificationsClick() {
    if (this.isStandardNotificationType) {
      const checkedUsers = this.users.filter(user => user.checked);
      const user_ids = checkedUsers.map(user => user.id).join(',');

      const name = this.data.defaultName;
      const body: UpdateEventInNotificationBody = {
        name,
        user_ids
      };

      this.store.dispatch(
        SettingsActions.updateEventInNotifications({
          id: this.data.id,
          body
        })
      );

      this.action$
        .pipe(
          waitOnceForAction([SettingsActions.updateEventInNotificationsSuccess]),
          tap(() => {
            this.store.dispatch(
              SettingsActions.fetchNotifications({
                params: {
                  company_id: this.data.company_id
                }
              })
            );
          }),
          tap(() => {
            this.dialogRef.close();
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    } else {
      const occurredUserIds = this.users.filter(user => user.checked && user.occurredChecked).map(user => user.id);
      const escalatedUserIds = this.users.filter(user => user.checked && user.escalatedChecked).map(user => user.id);

      const occurredBody: UpdateEventInNotificationBody = {
        name: this.data.defaultName,
        user_ids: occurredUserIds.join(','),
        context: 'event_occurred'
      };

      this.store.dispatch(
        SettingsActions.updateEventInNotifications({
          id: this.data.id,
          body: occurredBody
        })
      );

      this.action$
        .pipe(
          ofType(SettingsActions.updateEventInNotificationsSuccess),
          tap(() => {
            this.saveEscalatedNotifications(escalatedUserIds);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  private saveEscalatedNotifications(escalatedUserIds: number[]) {
    const escalatedBody: UpdateEventInNotificationBody = {
      name: this.data.defaultName,
      user_ids: escalatedUserIds.join(','),
      context: 'event_escalated'
    };

    this.store.dispatch(
      SettingsActions.updateEventInNotifications({
        id: this.data.id,
        body: escalatedBody
      })
    );

    this.action$
      .pipe(
        ofType(SettingsActions.updateEventInNotificationsSuccess),
        tap(() => {
          this.finishAndClose();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private finishAndClose() {
    this.store.dispatch(
      SettingsActions.fetchNotifications({
        params: {
          company_id: this.data.company_id
        }
      })
    );
    this.dialogRef.close();
  }

  private getFilteredUsers(searchValue: string, users: User[]) {
    if (searchValue != '') {
      const search = searchValue.toLowerCase();
      return users.filter(user => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search));
    }
    return users;
  }

  private readonly sortUsers = (u1: User, u2: User) => {
    if (!u1.checked && u2.checked) {
      return 1;
    }
    if (u1.checked && !u2.checked) {
      return -1;
    }
    return u1.name.localeCompare(u2.name);
  };

  private checkAllUsers(users: User[]): boolean | null {
    if (users.length === 0) return false;

    const allCheck = users.every(user => user.checked);
    const someCheck = users.some(user => user.checked);

    if (allCheck) {
      return true;
    }
    if (someCheck) {
      return null;
    }
    return false;
  }

  private checkAllOccurredUsers(users: User[]): boolean | null {
    if (users.length === 0) return false;

    const checkedUsers = users.filter(user => user.checked);
    if (checkedUsers.length === 0) return false;

    const allCheck = checkedUsers.every(user => user.occurredChecked);
    const someCheck = checkedUsers.some(user => user.occurredChecked);

    if (allCheck) {
      return true;
    }
    if (someCheck) {
      return null;
    }
    return false;
  }

  private checkAllEscalatedUsers(users: User[]): boolean | null {
    if (users.length === 0) return false;

    const checkedUsers = users.filter(user => user.checked);
    if (checkedUsers.length === 0) return false;

    const allCheck = checkedUsers.every(user => user.escalatedChecked);
    const someCheck = checkedUsers.some(user => user.escalatedChecked);

    if (allCheck) {
      return true;
    }
    if (someCheck) {
      return null;
    }
    return false;
  }
}
