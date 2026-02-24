import { DialogRef, DIALOG_DATA, Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, filter, map, Subject, Subscription, take } from 'rxjs';
import { shareReplay, takeUntil } from 'rxjs/operators';
import { CommonObjectsSelectors } from '../../../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../../../util/control';
import { ALARM_TYPES, EventStrategy, EventStrategyParams, getAlarmTypeName, VehicleElement } from 'src/app/screen/settings/settings.model';
import { SettingsSelectors } from '../../../settings.selectors';
import { SettingsActions } from '../../../settings.actions';
import { SettingsCoreFleetsCommissionNoEventDialogComponent } from './settings-core-fleets-commission-no-event-dialog/settings-core-fleets-commission-no-event-dialog.component';
import { SettingsCoreFleetsVehicleCommissionVerifyTemplateComponent } from './settings-core-fleets-vehicle-commission-verify-template/settings-core-fleets-vehicle-commission-verify-template.component';
import { EventsActions } from 'src/app/screen/events/events.actions';

enum ViewMode {
  TEMPLATE_SELECTION,
  COMMISSION_VERIFY,
  COMPLETE
}

@Component({
  selector: 'app-settings-core-fleets-vehicle-commission',
  templateUrl: './settings-core-fleets-vehicle-commission.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreFleetsVehicleCommissionComponent implements OnInit, OnDestroy {
  @Input() vehicleId: number = 0;
  @ViewChild(SettingsCoreFleetsVehicleCommissionVerifyTemplateComponent)
  verifyComponent?: SettingsCoreFleetsVehicleCommissionVerifyTemplateComponent;

  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  readonly ViewMode = ViewMode;
  readonly ALARM_TYPES = ALARM_TYPES;
  readonly getAlarmTypeName = getAlarmTypeName;
  confirmedEventId: string | null = null;
  searchControl = this.fb.control('');

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(
    map(data => ControlUtil.mapFleetsTreeToTreeControls(data)),
    shareReplay(1)
  );

  get fleetIdControl(): FormControl<number | null> {
    return this.templatesForm.get('fleetId') as FormControl<number | null>;
  }

  eventStrategyTemplates: EventStrategy[] = [];
  templatesEnabled: { [key: number]: boolean } = {};
  allTemplatesSelected: boolean | null = false;
  selectedEventIds: string[] = [];
  fleetId: number | null = null;
  searchText: string = '';
  isLoading = false;
  selectedEventId: string | null = null;

  currentView = ViewMode.TEMPLATE_SELECTION;

  templatesForm = this.fb.group({
    selectedTemplates: this.fb.array([]),
    fleetId: new FormControl<number | null>(null)
  });

  get templatesArray(): FormArray {
    return this.templatesForm.get('selectedTemplates') as FormArray;
  }

  get isFleetSelected(): boolean {
    return !!this.fleetIdControl.value;
  }

  constructor(private readonly fb: FormBuilder, private readonly store: Store, private readonly actions$: Actions, private readonly cdr: ChangeDetectorRef, private readonly dialogRef: DialogRef<any>, private readonly dialog: Dialog, @Inject(DIALOG_DATA) private readonly data?: { vehicle?: VehicleElement }) {
    if (data?.vehicle) {
      this.vehicleId = data.vehicle.id;
    }
  }

  ngOnInit(): void {
    if (!this.vehicleId) {
      return;
    }

    this.setupFormListeners();
    this.setupSearchListener();

    this.store.dispatch(
      SettingsActions.fetchVehicle({
        id: this.vehicleId
      })
    );

    this.sub.add(
      this.store
        .select(SettingsSelectors.vehicle)
        .pipe(
          filter(vehicle => !!vehicle),
          takeUntil(this.destroy$),
          take(1)
        )
        .subscribe(vehicle => {
          if (vehicle?.fleet_id) {
            this.fleetIdControl.setValue(vehicle.fleet_id);
            this.fleetId = vehicle.fleet_id;
            this.cdr.detectChanges();
          }
        })
    );

    this.store.dispatch(
      SettingsActions.fetchEventStrategiesResponse({
        params: {
          page: 1,
          per_page: 100
        }
      })
    );

    this.loadEventStrategyTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sub.unsubscribe();
  }

  private setupFormListeners(): void {
    this.sub.add(
      this.templatesForm
        .get('fleetId')
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(fleetId => {
          this.fleetId = fleetId;
        }) ?? new Subscription()
    );
  }

  searchTemplates(searchText: string): void {
    this.searchText = searchText;
    this.loadEventStrategyTemplates();
  }

  private loadEventStrategyTemplates(): void {
    this.isLoading = true;

    const params: Partial<EventStrategyParams> = {
      page: 1,
      per_page: 100
    };

    if (this.searchText && this.searchText.trim() !== '') {
      params.search = this.searchText;
    }

    this.store.dispatch(SettingsActions.fetchEventStrategiesResponse({ params }));

    this.sub.add(
      this.store
        .select(SettingsSelectors.eventStrategiesResponse)
        .pipe(takeUntil(this.destroy$))
        .subscribe(response => {
          this.isLoading = false;
          if (response) {
            this.eventStrategyTemplates = response.data ?? [];
            this.initializeTemplates();
          }
        })
    );
  }

  private initializeTemplates(): void {
    while (this.templatesArray.length !== 0) {
      this.templatesArray.removeAt(0);
    }

    this.eventStrategyTemplates.forEach(template => {
      this.templatesEnabled[template.id] = false;

      const group = this.fb.group({
        id: [template.id],
        name: [template.name],
        alarm_type_id: [template.alarm_type_id],
        enabled: [false]
      });

      this.templatesArray.push(group);
    });

    this.allTemplatesSelected = false;
    this.cdr.detectChanges();
  }

  handleTemplateCheckboxChange(checked: boolean, templateId: number): void {
    this.templatesEnabled[templateId] = checked;

    const templateIndex = this.findTemplateIndex(templateId);

    if (templateIndex >= 0) {
      const control = this.templatesArray.at(templateIndex);
      const enabledControl = control.get('enabled');

      if (enabledControl) {
        enabledControl.setValue(checked);
      }
    }

    this.updateAllTemplatesState();
    this.cdr.detectChanges();
  }

  private findTemplateIndex(templateId: number): number {
    return this.templatesArray.controls.findIndex(control => {
      const idControl = control.get('id');
      return idControl ? idControl.value === templateId : false;
    });
  }

  handleAllTemplatesClick(checked: boolean): void {
    this.allTemplatesSelected = checked;

    this.eventStrategyTemplates.forEach(template => {
      this.templatesEnabled[template.id] = checked;
    });

    this.templatesArray.controls.forEach(control => {
      const enabledControl = control.get('enabled');

      if (enabledControl) {
        enabledControl.setValue(checked);
      }
    });

    this.cdr.detectChanges();
  }

  private updateAllTemplatesState(): void {
    const allSelected = this.eventStrategyTemplates.every(template => this.templatesEnabled[template.id]);
    const someSelected = this.eventStrategyTemplates.some(template => this.templatesEnabled[template.id]);

    if (allSelected) {
      this.allTemplatesSelected = true;
    } else if (someSelected) {
      this.allTemplatesSelected = null;
    } else {
      this.allTemplatesSelected = false;
    }
  }

  switchToCommissionView(): void {
    if (!this.isFleetSelected) {
      return;
    }

    this.store.dispatch(EventsActions.resetEvent());

    const selectedTemplateIds = Object.entries(this.templatesEnabled)
      .filter(([_, enabled]) => enabled)
      .map(([id, _]) => parseInt(id));

    const fleetId = Number(this.templatesForm.get('fleetId')?.value) || 0;

    if (this.vehicleId > 0) {
      this.store.dispatch(
        SettingsActions.assignVehicleStrategies({
          vehicleId: this.vehicleId,
          body: {
            event_strategy_ids: selectedTemplateIds,
            fleet_id: fleetId
          }
        })
      );
    }

    this.currentView = ViewMode.COMMISSION_VERIFY;
    this.cdr.detectChanges();
  }

  completeVehicleCommission(eventId?: string): void {
    if (!this.vehicleId) {
      return;
    }
    const requestBody: { event_id?: string } = {};

    if (eventId) {
      requestBody.event_id = eventId;
    }

    this.store.dispatch(
      SettingsActions.completeVehicleStrategies({
        vehicleId: this.vehicleId,
        body: requestBody
      })
    );

    this.sub.add(
      this.actions$.pipe(ofType(SettingsActions.completeVehicleStrategiesSuccess), takeUntil(this.destroy$), take(1)).subscribe(() => {
        this.store.dispatch(SettingsActions.fetchVehicleResponse({ params: {} }));
        this.confirmedEventId = eventId ?? null;
        this.cdr.detectChanges();
      })
    );
  }

  switchToComplete(): void {
    if (!this.confirmedEventId) {
      const dialogRef = this.dialog.open(SettingsCoreFleetsCommissionNoEventDialogComponent, {
        data: {
          vehicle: this.data?.vehicle
        }
      });

      this.sub.add(
        dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
          if (result === true) {
            this.completeVehicleCommission();
            this.store.dispatch(EventsActions.resetEvent());

            this.currentView = ViewMode.COMPLETE;
            this.cdr.detectChanges();
          }
        })
      );
    } else {
      this.completeVehicleCommission();
      this.store.dispatch(EventsActions.resetEvent());

      this.currentView = ViewMode.COMPLETE;
      this.cdr.detectChanges();
    }
  }

  downloadCommissionReport(): void {
    if (!this.vehicleId) {
      return;
    }

    this.store.dispatch(
      SettingsActions.getVehicleStrategiesReport({
        vehicleId: this.vehicleId
      })
    );
  }

  switchToTemplateView(): void {
    this.currentView = ViewMode.TEMPLATE_SELECTION;
    this.cdr.detectChanges();
  }

  startViewTransition(): void {
    this.currentView = ViewMode.TEMPLATE_SELECTION;

    setTimeout(() => {
      this.switchToCommissionView();
    }, 3000);
  }

  onEventSelected(eventId: string): void {
    this.selectedEventId = eventId;
  }

  private getSelectedEventId(): string | null {
    return this.selectedEventId;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private setupSearchListener(): void {
    this.sub.add(
      this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(value => {
        this.searchTemplates(value ?? '');
      })
    );
  }
}
