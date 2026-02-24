import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthSelectors } from '../../../store/auth/auth.selectors';
import { AccessGroup, SettingsModuleList } from '../settings.model';

interface TabConfig {
  label: string;
  module: SettingsModuleList;
  permission: AccessGroup;
}

@Component({
  templateUrl: './settings-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  module: SettingsModuleList = 'profile';
  accessGroup = AccessGroup;

  private readonly tabsConfig: TabConfig[] = [
    { label: 'Profile', module: 'profile', permission: AccessGroup.SETTINGS_PROFILE },
    { label: 'Notifications', module: 'notifications', permission: AccessGroup.SETTINGS_NOTIFICATION_SETTINGS },
    { label: 'Manage companies', module: 'companies', permission: AccessGroup.SETTINGS_COMPANY_MANAGEMENTS },
    { label: 'Manage fleets', module: 'fleets', permission: AccessGroup.SETTINGS_FLEET_MANAGEMENT },
    { label: 'Manage roles', module: 'roles', permission: AccessGroup.SETTINGS_ROLE_MANAGEMENT },
    { label: 'Manage drivers', module: 'driver', permission: AccessGroup.SETTINGS_DRIVER_MANAGEMENTS },
    { label: 'Manage event strategies', module: 'event-strategies', permission: AccessGroup.SETTINGS_VEHICLE_EVENT_STRATEGIES },
    { label: 'Driver score weighting', module: 'safety-scores', permission: AccessGroup.SETTINGS_DRIVER_SCORE_WEIGHTS },
    { label: 'Automatic Reports', module: 'automated_reports', permission: AccessGroup.SETTINGS_AUTOMATED_REPORTS },
    { label: 'Admin Notices', module: 'infotainment', permission: AccessGroup.SETTINGS_INFOTAINMENT },
    { label: 'Shared Clips E-mails', module: 'shared-clips-emails', permission: AccessGroup.SETTINGS_SHARED_CLIPS_EMAILS },
    { label: 'Providers', module: 'providers', permission: AccessGroup.SUPER_ADMIN },
    { label: 'Admins', module: 'admins', permission: AccessGroup.SUPER_ADMIN },
    { label: 'App Settings', module: 'app-settings', permission: AccessGroup.SUPER_ADMIN }
  ];

  visibleTabs: TabConfig[] = [];
  mainTabs: TabConfig[] = [];
  dropdownTabs: TabConfig[] = [];
  maxMainTabs = 6;
  private readonly sub?: Subscription;
  @ViewChild('menuTrigger') menuTrigger!: CdkMenuTrigger;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.loggedInUser$.pipe(takeUntil(this.destroy$)).subscribe(loggedInUser => {
      this.visibleTabs = this.tabsConfig.filter(tab => this.hasPermission(loggedInUser, tab.permission));
      this.splitTabs();

      this.handleSavedTab(loggedInUser);

      this.setDefaultTab();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private hasPermission(loggedInUser: any, permission: AccessGroup): boolean {
    if (!loggedInUser?.access_groups) return false;

    return loggedInUser.access_groups.includes(permission) ? true : loggedInUser.access_groups.includes(AccessGroup.SUPER_ADMIN);
  }

  private splitTabs(): void {
    if (this.visibleTabs.length < this.maxMainTabs) {
      this.mainTabs = [...this.visibleTabs];
      this.dropdownTabs = [];
    } else {
      this.mainTabs = this.visibleTabs.slice(0, this.maxMainTabs);
      this.dropdownTabs = this.visibleTabs.slice(this.maxMainTabs);
    }
  }

  isAnyDropdownTabActive(): boolean {
    return this.dropdownTabs.some(tab => this.isTabActive(tab.module));
  }

  private handleSavedTab(loggedInUser: any): void {
    const savedInStore = localStorage.getItem('settingsTab') as SettingsModuleList;
    if (savedInStore) {
      const savedTab = this.visibleTabs.find(tab => tab.module === savedInStore);
      if (savedTab && (loggedInUser?.access_groups.includes(savedTab.permission) || loggedInUser?.access_groups.includes(AccessGroup.SUPER_ADMIN))) {
        this.module = savedInStore;
        return;
      }
    }
  }

  private setDefaultTab(): void {
    if (!this.visibleTabs.find(tab => tab.module === this.module)) {
      if (this.visibleTabs.length > 0) {
        this.module = this.visibleTabs[0].module;
      }
    }
  }

  handleModeClick(module: SettingsModuleList): void {
    localStorage.setItem('settingsTab', module);
    this.module = module;

    if (this.menuTrigger) {
      this.menuTrigger.close();
    }
  }

  get hasDropdownItems(): boolean {
    return this.dropdownTabs.length > 0;
  }

  isTabActive(module: SettingsModuleList): boolean {
    return this.module === module;
  }
}
