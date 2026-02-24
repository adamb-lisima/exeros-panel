import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { debounceTime, first, map, pairwise, startWith, Subject, Subscription, takeUntil, tap } from 'rxjs';
import DateConst from 'src/app/const/date';
import { MAPPED_RANGES, RANGES } from 'src/app/const/ranges';
import { EventsActions } from 'src/app/screen/events/events.actions';
import { EventsParams } from 'src/app/screen/events/events.model';
import { EventsSelectors } from 'src/app/screen/events/events.selectors';
import { AppState } from 'src/app/store/app-store.model';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { ConfigSelectors } from '../../../../store/config/config.selectors';
import ControlUtil from '../../../../util/control';

@Component({
  selector: 'app-events-left-filters',
  templateUrl: './events-left-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsLeftFiltersComponent implements OnInit, OnDestroy, OnChanges {
  @Input() vehicle_id: number | undefined;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['vehicle_id']) {
      const vehicleIdValue = changes['vehicle_id'].currentValue !== undefined ? [changes['vehicle_id'].currentValue] : [];

      this.bodyGroup.controls['vehicle_id'].setValue(vehicleIdValue);
      this.fetchData(false, true);
    }
  }

  isOpen = false;
  activeFilters: string[] = [];
  activeQuickFilter: 'Fatigue' | 'BSD' | 'Bridge' | 'DSC' | 'Acceleration alarm::rapid deceleration' | 'Acceleration alarm::rapid acceleration' | 'Turning' | 'Acceleration alarm::Shock alarm' | 'Clip Event' | undefined = undefined;
  readonly DateConst = DateConst;
  readonly RANGES = RANGES;
  rangeFilterControl = this.fb.control<string[]>([]);
  selectedRangeMessage$ = this.store.select(EventsSelectors.eventsParams).pipe(
    map(params => {
      const foundRange = this.RANGES.find(range => range.getFrom() === params.from && DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat) === params.to);
      return foundRange?.text ?? 'Custom';
    })
  );
  private readonly ITEMS_PER_PAGE = 500;

  hasFatigueEvents = false;
  hasBsdEvents = false;
  hasBridgeEvents = false;
  hasDscEvents = false;
  hasBrakingEvents = false;
  hasAcceleratingEvents = false;
  hasTurningEvents = false;
  hasShockEvents = false;
  hasClipEvents = false;

  bsdEvents: string[] = ['Forward blind area', 'Left blind spot detection', 'Right blind spot detection', 'Left BSD warning', 'Left BSD alarm', 'Right BSD warning', 'Right BSD alarm'];

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => ControlUtil.mapFleetsTreeToTreeControls(fleetsTree)));
  vehicleOptions$ = this.store.select(EventsSelectors.vehicles).pipe(
    map((vehicles): SelectControl[] =>
      vehicles?.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
      }))
    )
  );
  providerOptions$ = [
    { value: 'STREAMAX', label: `video`, colorClass: 'bg-extra-one--30' },
    { value: 'FLESPI', label: `telematics`, colorClass: 'bg-extra-three--30' }
  ];

  driverOptions$ = this.store.select(CommonObjectsSelectors.driversTree).pipe(map((drivers): SelectControl[] => drivers.map(driver => ({ value: driver.id, label: `${driver.name} ` }))));
  eventTypes$ = this.store.select(ConfigSelectors.data).pipe(map(data => data?.event_types.filter(type => type.show_in_selects).map(type => ({ value: type.default_name, label: type.name }))));

  bodyGroup = this.fb.group<Nullable<Pick<EventsParams, 'fleet_id' | 'vehicle_id' | 'driver_id' | 'event_type' | 'speed_from' | 'speed_to' | 'score_from' | 'score_to' | 'phase' | 'provider_names'>>>({
    fleet_id: 1,
    vehicle_id: undefined,
    driver_id: undefined,
    event_type: undefined,
    speed_from: undefined,
    speed_to: undefined,
    score_from: undefined,
    score_to: undefined,
    phase: undefined,
    provider_names: undefined
  });

  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store<AppState>, private readonly fb: NonNullableFormBuilder) {}

  ngOnInit(): void {
    const savedFleetId = localStorage.getItem('exeros-fleet-id');
    let initialFleetId: number | undefined = undefined;

    if (savedFleetId) {
      const fleetId = parseInt(savedFleetId, 10);
      if (!isNaN(fleetId)) {
        initialFleetId = fleetId;
      }
    }

    this.sub.add(
      this.eventTypes$
        .pipe(
          tap(eventTypes => {
            if (eventTypes) {
              this.checkEventTypeAvailability(eventTypes);
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({})
    );

    const allProviderValues = this.providerOptions$.map(provider => provider.value);

    this.sub.add(
      this.store
        .select(EventsSelectors.eventsParams)
        .pipe(
          first(),
          tap(params => {
            this.bodyGroup.reset({
              fleet_id: initialFleetId,
              vehicle_id: [],
              driver_id: [],
              event_type: [],
              speed_from: undefined,
              speed_to: undefined,
              score_from: undefined,
              score_to: undefined,
              phase: undefined,
              provider_names: allProviderValues
            });
            const range48h = MAPPED_RANGES.LAST_48H;
            if (range48h) {
              const to = DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat);
              this.rangeFilterControl.setValue([range48h.getFrom(), to]);
            } else {
              this.rangeFilterControl.setValue([params.from, params.to]);
            }

            if (initialFleetId) {
              this.store.dispatch(EventsActions.fetchVehicles({ params: { fleet_id: initialFleetId } }));
              this.fetchData(false);
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (error: Error) => console.error('Error in eventsParams subscription:', error)
        })
    );

    this.sub.add(
      this.bodyGroup.valueChanges
        .pipe(
          startWith(this.bodyGroup.value),
          pairwise(),
          tap(([prev, curr]) => {
            if (curr.fleet_id !== undefined) {
              localStorage.setItem('exeros-fleet-id', String(curr.fleet_id));
            }

            this.fetchData(prev.fleet_id !== curr.fleet_id);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (error: Error) => console.error('Error in bodyGroup valueChanges:', error)
        })
    );

    this.sub.add(
      this.rangeFilterControl.valueChanges
        .pipe(
          debounceTime(500),
          tap(() => this.fetchData()),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (error: Error) => console.error('Error in rangeFilterControl valueChanges:', error)
        })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleDaysClick(id: number): void {
    const from = this.RANGES.find(range => range.id === id)?.getFrom();
    if (from) {
      const to = DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat);
      this.rangeFilterControl.setValue([from, to]);
    }
  }

  filterBsdEventsByType(): void {
    if (!this.activeFiltersInclude(this.bsdEvents)) {
      this.activeFilters = [];
      this.bodyGroup.patchValue({ event_type: [] });
    }

    this.filterEventsByType('Forward blind area');
    this.filterEventsByType('Left blind spot detection');
    this.filterEventsByType('Right blind spot detection');
    this.filterEventsByType('Left BSD warning');
    this.filterEventsByType('Left BSD alarm');
    this.filterEventsByType('Right BSD warning');
    this.filterEventsByType('Right BSD alarm');
  }

  filterEventsByType(eventType: string, speedFrom: number = 1, removeCurrent: boolean = false): void {
    if (this.activeFilters.includes(eventType)) {
      const updatedEventTypes = this.bodyGroup.value.event_type?.filter(item => item !== eventType);
      this.bodyGroup.patchValue({ event_type: updatedEventTypes, speed_from: undefined });

      this.activeFilters = this.activeFilters.filter(item => item !== eventType);
    } else {
      if (removeCurrent) {
        this.activeFilters = [];
        this.bodyGroup.patchValue({ event_type: [] });
      }

      const updatedEventTypes = [...(this.bodyGroup.value.event_type ?? []), eventType];
      this.bodyGroup.patchValue({ event_type: updatedEventTypes, speed_from: speedFrom });

      this.activeFilters.push(eventType);
    }
    this.fetchData();
  }

  activeFiltersInclude(eventTypes: string[]): boolean {
    return eventTypes.every(eventType => this.activeFilters.includes(eventType));
  }

  filterFatigue(): void {
    if (this.activeQuickFilter === 'Fatigue') {
      this.clearFilters();
      return;
    }
    this.activeQuickFilter = 'Fatigue';
    this.bodyGroup.patchValue({ phase: undefined });
    this.filterEventsByType('Driver Fatigue', 0, true);
  }

  filterBSD(): void {
    if (this.activeQuickFilter === 'BSD') {
      this.clearFilters();
      return;
    }
    this.activeQuickFilter = 'BSD';
    this.bodyGroup.patchValue({ phase: undefined });
    this.filterBsdEventsByType();
  }

  readonly bridgeEvents: string[] = ['Pedestrian Collision Warning', 'Low Bridge Alarm', 'Low Bridge Warning', 'Low Bridge Recognition', 'Low Bridge Collision Warning'];
  readonly sharpTurningEvents: string[] = ['Acceleration alarm::right sharp turns', 'Acceleration alarm::left sharp turns'];

  filterBridge(): void {
    if (this.activeQuickFilter === 'Bridge') {
      this.clearFilters();
      return;
    }
    this.activeQuickFilter = 'Bridge';
    this.bodyGroup.patchValue({ phase: undefined });

    if (!this.activeFiltersInclude(this.bridgeEvents)) {
      this.activeFilters = [];
      this.bodyGroup.patchValue({ event_type: [] });
    }
    this.bridgeEvents.forEach(eventType => {
      this.filterEventsByType(eventType, 0);
    });
  }

  filterDSC(): void {
    if (this.activeQuickFilter === 'DSC') {
      this.clearFilters();
      return;
    }
    this.activeQuickFilter = 'DSC';
    this.bodyGroup.patchValue({ phase: 'managed-service' });

    this.sub.add(
      this.eventTypes$
        .pipe(
          map(eventTypes => eventTypes?.filter(eventType => eventType.value !== 'Yawning Detection')),
          tap(filteredEventTypes => {
            if (filteredEventTypes && filteredEventTypes.length > 0) {
              const eventTypeValues = filteredEventTypes.map(eventType => eventType.value);
              this.bodyGroup.patchValue({ event_type: eventTypeValues });
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          error: (error: Error) => console.error('Error in filterDSC subscription:', error)
        })
    );
  }

  filterBraking(): void {
    if (this.activeQuickFilter === 'Acceleration alarm::rapid deceleration') {
      this.clearFilters();
      return;
    }
    this.activeQuickFilter = 'Acceleration alarm::rapid deceleration';
    this.bodyGroup.patchValue({ phase: undefined });
    this.filterEventsByType('Acceleration alarm::rapid deceleration', 0, true);
  }

  filterAccelerating(): void {
    if (this.activeQuickFilter === 'Acceleration alarm::rapid acceleration') {
      this.clearFilters();
      return;
    }
    this.activeQuickFilter = 'Acceleration alarm::rapid acceleration';
    this.bodyGroup.patchValue({ phase: undefined });
    this.filterEventsByType('Acceleration alarm::rapid acceleration', 0, true);
  }

  filterTurning(): void {
    if (this.activeQuickFilter === 'Turning') {
      this.clearFilters();
      return;
    }
    this.activeQuickFilter = 'Turning';
    this.bodyGroup.patchValue({ phase: undefined });

    if (!this.activeFiltersInclude(this.sharpTurningEvents)) {
      this.activeFilters = [];
      this.bodyGroup.patchValue({ event_type: [] });
    }
    this.sharpTurningEvents.forEach(eventType => {
      this.filterEventsByType(eventType, 0);
    });
  }

  filterShock(): void {
    if (this.activeQuickFilter === 'Acceleration alarm::Shock alarm') {
      this.clearFilters();
      return;
    }
    this.activeQuickFilter = 'Acceleration alarm::Shock alarm';
    this.bodyGroup.patchValue({ phase: undefined });
    this.filterEventsByType('Acceleration alarm::Shock alarm', 0, true);
  }

  filterClipEvents(): void {
    if (this.activeQuickFilter === 'Clip Event') {
      this.clearFilters();
      return;
    }
    this.activeQuickFilter = 'Clip Event';
    this.bodyGroup.patchValue({ phase: undefined });

    this.activeFilters = [];
    this.bodyGroup.patchValue({ event_type: [] });

    this.filterEventsByType('Clip Event', 0);
    this.filterEventsByType('Accident Event', 0);
  }

  private clearFilters() {
    this.activeFilters = [];
    this.activeQuickFilter = undefined;

    const allProviderValues = this.providerOptions$.map(provider => provider.value);

    this.bodyGroup.patchValue({ event_type: [], phase: undefined, provider_names: allProviderValues });
  }

  private fetchData(resetVehicle?: boolean, forcePage1?: boolean): void {
    const value = this.bodyGroup.value;
    let [from, to] = this.rangeFilterControl.value;

    if (!from || !to || this.rangeFilterControl.value.length < 2) {
      const defaultRange = MAPPED_RANGES.LAST_48H;
      from = defaultRange.getFrom();
      to = DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat);

      this.rangeFilterControl.setValue([from, to], { emitEvent: false });
    }

    const shouldForcePage1 = forcePage1 || resetVehicle || (value.vehicle_id ?? []).length > 0 || (value.driver_id ?? []).length > 0;

    if (resetVehicle) {
      this.bodyGroup.controls.vehicle_id.setValue(undefined, { emitEvent: false });
      this.store.dispatch(EventsActions.fetchVehicles({ params: { fleet_id: value.fleet_id as number } }));
    }

    const eventTypes = [...(value.event_type ?? [])];

    const vehicleIdParam = resetVehicle ? undefined : (value.vehicle_id ?? []).join(',');

    const page = shouldForcePage1 ? 1 : undefined;
    this.store.dispatch(
      EventsActions.fetchEvents({
        params: {
          vehicle_id: vehicleIdParam,
          event_type: eventTypes.join(','),
          driver_id: (value.driver_id ?? []).join(','),
          fleet_id: value.fleet_id as number | undefined,
          from,
          to,
          speed_from: value.speed_from as number | undefined,
          speed_to: value.speed_to as number | undefined,
          score_from: value.score_from as number | undefined,
          score_to: value.score_to as number | undefined,
          phase: value.phase as string | undefined,
          provider_names: (value.provider_names ?? []).join(','),
          page: page,
          per_page: this.ITEMS_PER_PAGE
        }
      })
    );
  }

  filterProvider(providerName: string): void {
    const currentProviders = this.bodyGroup.value.provider_names ?? [];

    if (currentProviders.includes(providerName)) {
      this.bodyGroup.patchValue({
        provider_names: currentProviders.filter(item => item !== providerName)
      });
    } else {
      this.bodyGroup.patchValue({
        provider_names: [...currentProviders, providerName]
      });
    }

    this.fetchData();
  }

  isProviderActive(providerName: string): boolean {
    return (this.bodyGroup.value.provider_names ?? []).includes(providerName);
  }

  private checkEventTypeAvailability(eventTypes: SelectControl[]): void {
    const eventTypeValues = eventTypes.map(et => et.value);
    this.hasFatigueEvents = eventTypeValues.includes('Driver Fatigue');
    this.hasBsdEvents = this.bsdEvents.some(bsdEvent => eventTypeValues.includes(bsdEvent));
    this.hasBridgeEvents = this.bridgeEvents.some(bridgeEvent => eventTypeValues.includes(bridgeEvent));
    this.hasBrakingEvents = eventTypeValues.includes('Acceleration alarm::rapid deceleration');
    this.hasAcceleratingEvents = eventTypeValues.includes('Acceleration alarm::rapid acceleration');
    this.hasTurningEvents = this.sharpTurningEvents.some(turningEvent => eventTypeValues.includes(turningEvent));
    this.hasShockEvents = eventTypeValues.includes('Acceleration alarm::Shock alarm');
    this.hasClipEvents = eventTypeValues.includes('Clip Event');
    this.hasDscEvents = eventTypeValues.some(type => type !== 'Yawning Detection');
  }
}
