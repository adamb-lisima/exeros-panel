import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthSelectors } from '../../../store/auth/auth.selectors';
import { AccessGroup, SettingsModuleList } from '../settings.model';

interface TabConfig {
  label: string;
  module: SettingsModuleList;
  permission: AccessGroup;
}

interface SectionGroup {
  label: string;
  tabs: TabConfig[];
}

@Component({
  templateUrl: './settings-core.component.html',
  styleUrls: ['./settings-core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  module: SettingsModuleList = 'profile';
  accessGroup = AccessGroup;

  private readonly sectionGroups: SectionGroup[] = [
    {
      label: 'Account',
      tabs: [
        { label: 'Profile', module: 'profile', permission: AccessGroup.SETTINGS_PROFILE }
      ]
    },
    {
      label: 'Fleet Management',
      tabs: [
        { label: 'Manage companies', module: 'companies', permission: AccessGroup.SETTINGS_COMPANY_MANAGEMENTS },
        { label: 'Manage fleets', module: 'fleets', permission: AccessGroup.SETTINGS_FLEET_MANAGEMENT },
        { label: 'Manage roles', module: 'roles', permission: AccessGroup.SETTINGS_ROLE_MANAGEMENT },
        { label: 'Manage drivers', module: 'driver', permission: AccessGroup.SETTINGS_DRIVER_MANAGEMENTS },
        { label: 'Manage event strategies', module: 'event-strategies', permission: AccessGroup.SETTINGS_VEHICLE_EVENT_STRATEGIES },
        { label: 'Driver score weighting', module: 'safety-scores', permission: AccessGroup.SETTINGS_DRIVER_SCORE_WEIGHTS }
      ]
    },
    {
      label: 'Notifications',
      tabs: [
        { label: 'Notifications', module: 'notifications', permission: AccessGroup.SETTINGS_NOTIFICATION_SETTINGS },
        { label: 'Automatic Reports', module: 'automated_reports', permission: AccessGroup.SETTINGS_AUTOMATED_REPORTS },
        { label: 'Admin Notices', module: 'infotainment', permission: AccessGroup.SETTINGS_INFOTAINMENT },
        { label: 'Shared Clips E-mails', module: 'shared-clips-emails', permission: AccessGroup.SETTINGS_SHARED_CLIPS_EMAILS }
      ]
    },
    {
      label: 'Administration',
      tabs: [
        { label: 'Providers', module: 'providers', permission: AccessGroup.SUPER_ADMIN },
        { label: 'Admins', module: 'admins', permission: AccessGroup.SUPER_ADMIN },
        { label: 'App Settings', module: 'app-settings', permission: AccessGroup.SUPER_ADMIN }
      ]
    }
  ];

  visibleSectionGroups: SectionGroup[] = [];

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.loggedInUser$.pipe(takeUntil(this.destroy$)).subscribe(loggedInUser => {
      this.visibleSectionGroups = this.sectionGroups
        .map(group => ({
          ...group,
          tabs: group.tabs.filter(tab => this.hasPermission(loggedInUser, tab.permission))
        }))
        .filter(group => group.tabs.length > 0);

      this.handleSavedTab(loggedInUser);
      this.setDefaultTab();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private hasPermission(loggedInUser: any, permission: AccessGroup): boolean {
    if (!loggedInUser?.access_groups) return false;
    return loggedInUser.access_groups.includes(permission) || loggedInUser.access_groups.includes(AccessGroup.SUPER_ADMIN);
  }

  private handleSavedTab(loggedInUser: any): void {
    const savedInStore = localStorage.getItem('settingsTab') as SettingsModuleList;
    if (savedInStore) {
      const allTabs = this.visibleSectionGroups.flatMap(g => g.tabs);
      const savedTab = allTabs.find(tab => tab.module === savedInStore);
      if (savedTab && (loggedInUser?.access_groups.includes(savedTab.permission) || loggedInUser?.access_groups.includes(AccessGroup.SUPER_ADMIN))) {
        this.module = savedInStore;
        return;
      }
    }
  }

  private setDefaultTab(): void {
    const allTabs = this.visibleSectionGroups.flatMap(g => g.tabs);
    if (!allTabs.find(tab => tab.module === this.module)) {
      if (allTabs.length > 0) {
        this.module = allTabs[0].module;
      }
    }
  }

  handleModeClick(module: SettingsModuleList): void {
    localStorage.setItem('settingsTab', module);
    this.module = module;
  }

  isTabActive(module: SettingsModuleList): boolean {
    return this.module === module;
  }
}
