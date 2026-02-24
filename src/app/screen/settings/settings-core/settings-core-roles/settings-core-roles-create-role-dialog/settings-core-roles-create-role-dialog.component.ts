import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, Subject, Subscription, take, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { ConfigSelectors } from '../../../../../store/config/config.selectors';
import { SettingsActions } from '../../../settings.actions';
import { AccessGroup, CreateRoleParams, RoleElement } from '../../../settings.model';
import { AccessGroupsField, accessSelectMapper } from './access-groups-mapper';

export type RoleDialogData = EditRole | CreateRole;

interface CreateRole {
  type: 'create';
  company_id: number;
}

type EditRole = RoleElement & { type: 'edit'; company_id: number };

@Component({
  selector: 'app-settings-core-roles-create-role-dialog',
  templateUrl: './settings-core-roles-create-role-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreRolesCreateRoleDialogComponent implements OnInit, OnDestroy {
  readonly optionsMap = accessSelectMapper;
  private readonly sub?: Subscription;
  configData$ = this.store.select(ConfigSelectors.data);

  private readonly destroy$ = new Subject<void>();

  name = this.fb.control('', { validators: Validators.required });
  reviewerLevel = this.fb.control('', { validators: Validators.required });

  reviewerLevels$ = this.store.select(ConfigSelectors.data).pipe(
    map((configData): { label: string; value: string }[] =>
      configData
        ? configData.role_reviewer_levels.map(element => ({
            label: element,
            value: element
          }))
        : []
    )
  );

  eventsAccess!: FormGroup;

  accessGroupsForm = this.fb.group({
    dashboard: { value: '', disabled: true },
    leaderboard: { value: '', disabled: true },
    drivers: { value: '', disabled: true },
    vehicles: { value: '', disabled: true },
    fleets: { value: '', disabled: true },
    stream: { value: '', disabled: true },
    events: { value: '', disabled: true },
    escalated_events: { value: '', disabled: true },
    reviewed_events: { value: '', disabled: true },
    archived_events: { value: '', disabled: true },
    reports_top_driver: { value: '', disabled: true },
    reports_mileage: { value: '', disabled: true },
    reports_driving_time: { value: '', disabled: true },
    reports_vehicle_issues: { value: '', disabled: true },
    reports_distance_driven: { value: '', disabled: true },
    reports_events: { value: '', disabled: true },
    reports_accidents: { value: '', disabled: true },
    reports_trips: { value: '', disabled: true },
    reports_vehicles_checks: { value: '', disabled: true },
    reports_vehicle_online_status: { value: '', disabled: true },
    reports_alarms: { value: '', disabled: true },
    reports_user_logs: { value: '', disabled: true },
    telematics: { value: '', disabled: true },
    map_view: { value: '', disabled: true },
    settings_profile: { value: '', disabled: true },
    settings_notification_settings: { value: '', disabled: true },
    settings_company_managements: { value: '', disabled: true },
    settings_fleet_management: { value: '', disabled: true },
    settings_role_management: { value: '', disabled: true },
    settings_driver_managements: { value: '', disabled: true },
    settings_driver_score_weights: { value: '', disabled: true },
    settings_automated_reports: { value: '', disabled: true },
    settings_infotainment: { value: '', disabled: true },
    settings_vehicle_event_strategies: { value: '', disabled: true },
    settings_shared_clips_emails: { value: '', disabled: true },
    settings_commission_editor: { value: '', disabled: true },
    notifications: { value: '', disabled: true },
    task_list: { value: '', disabled: true }
  });

  allEvents: boolean | null = true;
  allModules: boolean | null = false;
  isOpen = false;

  constructor(@Inject(DIALOG_DATA) public data: RoleDialogData, private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, private readonly dialogRef: DialogRef) {}

  ngOnInit(): void {
    this.reviewerLevels$.pipe(takeUntil(this.destroy$)).subscribe(options => {
      if (options.length > 0) {
        this.reviewerLevel.setValue(options[0].value);
      }
    });

    this.configData$
      .pipe(
        filter(configData => !!configData?.event_types_groups),
        tap(configData => {
          if (configData) {
            this.buildDynamicEventsForm(configData.event_types_groups);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.accessGroupsForm.valueChanges
      .pipe(
        tap(() => {
          const checkValues = Object.values(this.accessGroupsForm.controls).map(v => v.value != '');
          this.allModules = this.getValueForAll(checkValues);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    if (this.data.type === 'edit') {
      const role = this.data;
      this.name.setValue(role.name);
      this.reviewerLevel.setValue(role.reviewer_level);

      this.configData$
        .pipe(
          filter(configData => !!configData?.event_types_groups),
          take(1),
          tap(() => {
            this.populateEventsForEdit(role.allowed_event_types || []);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();

      const newAccesses: Partial<any> = {};
      role.access_groups.forEach(access => {
        Object.entries(accessSelectMapper).forEach(([key, values]) => {
          const has = values.map(value => value.value).includes(access);
          if (has && (newAccesses[key] === undefined || newAccesses[key].includes('_viewer'))) {
            newAccesses[key] = access;
            this.accessGroupsForm.get([key])?.enable({ emitEvent: false });
          }
        });
      });
      this.accessGroupsForm.patchValue(newAccesses);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private buildDynamicEventsForm(eventTypesGroups: any[]): void {
    const formControls: { [key: string]: FormControl } = {};

    eventTypesGroups.forEach(group => {
      group.items.forEach((item: any) => {
        const controlKey = this.mapEventName(item.default_name);
        formControls[controlKey] = new FormControl(true);
      });
    });

    this.eventsAccess = this.fb.group(formControls);
    this.subscribeToEventsFormChanges();
  }

  private subscribeToEventsFormChanges(): void {
    this.eventsAccess.valueChanges
      .pipe(
        tap(values => {
          const checkValues = Object.values(values).map(v => v as boolean);
          this.allEvents = this.getValueForAll(checkValues);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private populateEventsForEdit(allowedEventTypes: string | any[]): void {
    this.configData$.pipe(take(1), takeUntil(this.destroy$)).subscribe(configData => {
      if (configData?.event_types_groups) {
        configData.event_types_groups.forEach(group => {
          group.items.forEach((item: any) => {
            const controlKey = this.mapEventName(item.default_name);
            const isAllowed = allowedEventTypes.includes(item.default_name);
            this.eventsAccess.get(controlKey)?.setValue(isAllowed);
          });
        });
      }
    });
  }

  mapEventName(defaultName: string): string {
    return defaultName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
      .join('');
  }

  getEventControl(defaultName: string): FormControl {
    const controlKey = this.mapEventName(defaultName);
    return this.eventsAccess.get(controlKey) as FormControl;
  }

  handleAllEventsClick(value: boolean): void {
    const events = { ...this.eventsAccess.value! };
    Object.keys(events).forEach(e => (events[e as keyof typeof events] = value));
    this.eventsAccess.patchValue(events);
  }

  handleCheckAllModulesClick(value: boolean): void {
    const accessGroups = { ...this.accessGroupsForm.controls! };
    Object.keys(accessGroups).forEach(field => this.checkModule(field as AccessGroupsField, value));
  }

  handleAddRoleClick(): void {
    if (this.name.valid) {
      const params = this.prepareParams();
      this.store.dispatch(SettingsActions.createRole({ body: params }));
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.createRoleSuccess]),
          tap(() => this.dialogRef.close()),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  handleEditRoleClick(): void {
    if (this.name.valid && this.data.type === 'edit') {
      const params = this.prepareParams();
      this.store.dispatch(SettingsActions.editRole({ body: params, id: this.data.id }));
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.editRoleSuccess]),
          tap(() => this.store.dispatch(SettingsActions.fetchCompanyRoles({ params: { company_id: null, page: 1, per_page: 100, only_custom_roles: true }, onlySelect: true }))),
          tap(() => this.dialogRef.close()),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  handleCheckModuleClick(field: AccessGroupsField, checked: boolean): void {
    this.checkModule(field, checked);
  }

  private prepareParams(): CreateRoleParams {
    let access_groups = Object.values(this.accessGroupsForm.value).filter((value): value is string => value != null && value != '');

    for (let i = 0; i < access_groups.length; i++) {
      let current = access_groups[i];
      if (current.endsWith('_editor')) {
        let viewer = current.replace('_editor', '_viewer');
        if (Object.values(AccessGroup).includes(viewer as AccessGroup)) {
          access_groups.push(viewer);
        }
        let commenter = current.replace('_editor', '_commenter');
        if (Object.values(AccessGroup).includes(commenter as AccessGroup)) {
          access_groups.push(viewer);
        }
      }
      if (current.endsWith('_commenter')) {
        let viewer = current.replace('_commenter', '_viewer');
        if (Object.values(AccessGroup).includes(viewer as AccessGroup)) {
          access_groups.push(viewer);
        }
      }
      if (current.endsWith('_downloader')) {
        let viewer = current.replace('_downloader', '_viewer');
        if (Object.values(AccessGroup).includes(viewer as AccessGroup)) {
          access_groups.push(viewer);
        }
      }
    }

    const allowed_event_types: string[] = [];
    this.configData$.pipe(take(1), takeUntil(this.destroy$)).subscribe(configData => {
      if (configData?.event_types_groups) {
        configData.event_types_groups.forEach(group => {
          group.items.forEach((item: any) => {
            const controlKey = this.mapEventName(item.default_name);
            if (this.eventsAccess.get(controlKey)?.value === true) {
              allowed_event_types.push(item.default_name);
            }
          });
        });
      }
    });

    return {
      name: this.name.value!,
      access_groups,
      allowed_event_types,
      reviewer_level: this.reviewerLevel.value!,
      company_id: this.data.company_id
    };
  }

  private checkModule(field: AccessGroupsField, checked: boolean): void {
    const formField = this.accessGroupsForm.get([field]);
    formField?.markAsDirty();
    if (checked) {
      const option = accessSelectMapper[field]?.[0].value;
      formField?.setValue(option);
      formField?.enable({ emitEvent: false });
    } else {
      formField?.setValue('');
      formField?.disable({ emitEvent: false });
    }
  }

  private getValueForAll(checkValues: (boolean | null)[]): boolean | null {
    const allChecked = checkValues.every(value => value === true);
    const someChecked = !allChecked && checkValues.some(value => value === true);

    if (allChecked) {
      return true;
    }
    if (someChecked) {
      return null;
    }
    return false;
  }
}
