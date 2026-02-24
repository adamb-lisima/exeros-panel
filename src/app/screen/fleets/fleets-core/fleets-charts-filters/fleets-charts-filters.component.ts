import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigSelectors } from '../../../../store/config/config.selectors';
import { FleetsActions } from '../../fleets.actions';
import { EventTrendsChartParams } from '../../fleets.model';
import { FleetsColorMapService } from './fleets-color-map.service';

@Component({
  selector: 'app-fleets-charts-filters',
  templateUrl: './fleets-charts-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsChartsFiltersComponent implements OnInit, OnDestroy {
  @Output() filtersChanged = new EventEmitter<{ event_types: string[]; statuses: string[] }>();
  private readonly destroy$ = new Subject<void>();

  eventTypes$ = this.store.select(ConfigSelectors.data).pipe(map(data => data?.event_types.filter(type => type.show_in_selects).map(type => ({ value: type.default_name, label: type.name }))));
  statusOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'REVIEW_REQUIRED', label: 'Review Required' },
    { value: 'ESCALATED', label: 'Escalated' },
    { value: 'FALSE_EVENT', label: 'False Event' },
    { value: 'DO_NOT_ESCALATE', label: 'Do Not Escalate' },
    { value: 'REVIEWED', label: 'Reviewed' },
    { value: 'TEST', label: 'Test' },
    { value: 'INVALID_VIDEO', label: 'Invalid Video' }
  ];

  bodyGroup = this.fb.group({
    event_types: new FormControl<string[]>([]),
    statuses: new FormControl<string[]>(['NEW'])
  });

  selectedOptions: { label: string; value: string | number }[] = [];
  public getColorForType(eventType: string): string {
    return this.color.getColor(eventType);
  }

  constructor(private readonly store: Store, private readonly fb: NonNullableFormBuilder, private readonly color: FleetsColorMapService) {}

  ngOnInit(): void {
    this.eventTypes$.pipe(takeUntil(this.destroy$)).subscribe(types => {
      if (types) {
        const defaultEventTypes = types.slice(0, 5).map(type => type.value);
        this.bodyGroup.controls.event_types.setValue(defaultEventTypes, { emitEvent: false });
        this.updateSelectedOptions(defaultEventTypes, 'event_types');
        this.emitFilters();
      }
    });

    const defaultStatuses = ['NEW'];
    this.bodyGroup.controls.statuses.setValue(defaultStatuses, { emitEvent: false });
    this.updateSelectedOptions(defaultStatuses, 'statuses');
    this.emitFilters();

    this.bodyGroup.controls.event_types.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(selectedValues => {
      this.updateSelectedOptions(selectedValues, 'event_types');
      this.emitFilters();
    });

    this.bodyGroup.controls.statuses.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(selectedValues => {
      this.updateSelectedOptions(selectedValues, 'statuses');
      this.emitFilters();
    });
  }

  private updateSelectedOptions(selectedValues: string[] | undefined | null, type: 'event_types' | 'statuses'): void {
    if (type === 'event_types' && selectedValues) {
      this.eventTypes$.pipe(takeUntil(this.destroy$)).subscribe(types => {
        if (types) {
          this.selectedOptions = [...this.selectedOptions.filter(option => !types.some(type => type.value === option.value)), ...types.filter(type => selectedValues.includes(type.value))];
          this.statusTagLast();
        }
      });
    } else if (type === 'statuses' && selectedValues) {
      this.selectedOptions = [...this.selectedOptions.filter(option => !this.statusOptions.some(status => status.value === option.value)), ...this.statusOptions.filter(status => selectedValues.includes(status.value))];
      this.statusTagLast();
    } else {
      this.selectedOptions = [];
    }
  }

  private emitFilters(): void {
    const event_types = this.bodyGroup.controls.event_types.value ?? [];
    const statuses = this.bodyGroup.controls.statuses.value ?? [];
    const filters: EventTrendsChartParams = { fleet_id: 1, from: '', to: '', event_types, statuses };

    this.filtersChanged.emit(filters);
    this.store.dispatch(FleetsActions.setFilters(filters));
  }

  removeOption(value: string | number): void {
    const event_type = this.bodyGroup.controls.event_types.value ?? [];
    const status = this.bodyGroup.controls.statuses.value ?? [];

    if (typeof value === 'string') {
      if (event_type.includes(value)) {
        this.bodyGroup.controls.event_types.setValue(event_type.filter(val => val !== value));
      }
      if (status.includes(value)) {
        this.bodyGroup.controls.statuses.setValue(status.filter(val => val !== value));
      }
    }
  }

  private statusTagLast(): void {
    const statusOptions = this.selectedOptions.filter(option => this.statusOptions.some(status => status.value === option.value));
    const eventTypeOptions = this.selectedOptions.filter(option => !this.statusOptions.some(status => status.value === option.value));
    this.selectedOptions = [...eventTypeOptions, ...statusOptions];
  }

  isStatusOption(option: { value: string | number; label: string }): boolean {
    return this.statusOptions.some(status => status.value === option.value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
