import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest, tap } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { SettingsActions } from '../../../settings.actions';
import { SettingsSelectors } from '../../../settings.selectors';
import { FleetEventStrategyElement, EventStrategy, getAlarmTypeName } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-event-strategies-fleet-strategies-dialog',
  templateUrl: './settings-core-event-strategies-fleet-strategies-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreEventStrategiesFleetStrategiesDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  fleetEventStrategies$: Observable<FleetEventStrategyElement[]>;
  eventStrategies$: Observable<EventStrategy[]>;
  form: FormGroup;
  searchControl = this.fb.control('');

  Object = Object;
  getAlarmTypeName = getAlarmTypeName;

  constructor(private readonly store: Store, private readonly dialogRef: DialogRef, private readonly fb: FormBuilder) {
    this.fleetEventStrategies$ = combineLatest([this.store.select(SettingsSelectors.fleetEventStrategiesList), this.store.select(SettingsSelectors.fleetsTree)]).pipe(
      map(([fleetEventStrategiesResponse, fleetsTree]) => {
        const fleetsWithStrategies = fleetEventStrategiesResponse?.data ?? [];
        const allFleets = this.flattenFleets(fleetsTree ?? []);

        const strategiesMap = new Map<number, { [key: string]: string }>();
        fleetsWithStrategies.forEach(fleet => {
          strategiesMap.set(fleet.fleet_id, fleet.event_strategies ?? {});
        });

        return allFleets.map(fleet => ({
          fleet_id: fleet.id,
          fleet_name: fleet.name,
          event_strategies: strategiesMap.get(fleet.id) || {}
        }));
      })
    );

    this.eventStrategies$ = this.store.select(SettingsSelectors.eventStrategiesResponse).pipe(map(response => response?.data ?? []));

    this.form = this.fb.group({
      selectedFleet: [null],
      strategies: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.store.dispatch(
      SettingsActions.fetchFleetsTree({
        params: {
          show_vehicles: true,
          with_profiles: false,
          company_id: undefined,
          fleet_ids: undefined
        }
      })
    );

    this.store.dispatch(
      SettingsActions.fetchEventStrategiesResponse({
        params: {}
      })
    );

    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        tap(value => {
          this.store.dispatch(
            SettingsActions.fetchEventStrategiesResponse({
              params: { search: value ?? '' }
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.fleetEventStrategies$
      .pipe(
        tap(fleets => {
          if (this.form.value.selectedFleet) {
            const updatedFleet = fleets.find(fleet => fleet.fleet_id === this.form.value.selectedFleet?.fleet_id);
            if (updatedFleet) {
              this.form.patchValue({ selectedFleet: updatedFleet });
              this.buildStrategiesForm(updatedFleet);
            }
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get strategiesArray(): FormArray {
    return this.form.get('strategies') as FormArray;
  }

  onFleetSelect(fleet: FleetEventStrategyElement): void {
    this.form.patchValue({ selectedFleet: fleet });
    this.buildStrategiesForm(fleet);
  }

  private buildStrategiesForm(fleet: FleetEventStrategyElement): void {
    const strategiesArray = this.fb.array([]);

    this.eventStrategies$.pipe(takeUntil(this.destroy$)).subscribe(strategies => {
      strategiesArray.clear();

      strategies.forEach(strategy => {
        const isSelected = fleet.event_strategies && Object.keys(fleet.event_strategies).includes(strategy.id.toString());

        strategiesArray.push(this.fb.control(isSelected));
      });

      this.form.setControl('strategies', strategiesArray);
    });
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  handleSaveClick(): void {
    const selectedFleet = this.form.value.selectedFleet;
    const strategies = this.form.value.strategies;

    if (!selectedFleet) {
      return;
    }

    this.eventStrategies$.pipe(takeUntil(this.destroy$)).subscribe(eventStrategies => {
      const selectedStrategyIds = eventStrategies.filter((_, index) => strategies[index]).map(strategy => strategy.id);

      this.store.dispatch(
        SettingsActions.updateFleetEventStrategies({
          fleetId: selectedFleet.fleet_id,
          body: { event_strategy_ids: selectedStrategyIds }
        })
      );

      this.dialogRef.close();
    });
  }

  private flattenFleets(fleets: any[]): any[] {
    const result: any[] = [];

    const traverse = (fleet: any) => {
      result.push(fleet);
      if (fleet.children && fleet.children.length > 0) {
        fleet.children.forEach((child: any) => traverse(child));
      }
    };

    fleets.forEach(fleet => traverse(fleet));
    return result;
  }

  getFormControlAt(index: number): FormControl {
    return this.strategiesArray.at(index) as FormControl;
  }

  onFleetKeydown(event: KeyboardEvent, fleet: any): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onFleetSelect(fleet);
    }
  }
}
