import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, first, interval, map, pairwise, startWith, Subject, Subscription, take, takeUntil, tap, withLatestFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import RouteConst from '../../../../const/route';
import { ExportType } from '../../../../model/export-type.model';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../store/app-store.model';
import { VehiclesTreeElement } from '../../../../store/common-objects/common-objects.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { ConfigSelectors } from '../../../../store/config/config.selectors';
import { EventsElement } from '../../../events/events.model';
import { AccessGroup } from '../../../settings/settings.model';
import { ReportsActions } from '../../reports.actions';
import { ReportsSelectors } from '../../reports.selectors';
import { EventsSelectors } from '../../../events/events.selectors';
import { EventsActions } from '../../../events/events.actions';
import { EventsReportParams } from '../../reports.model';

type VehicleByDeviceId = Record<string, VehiclesTreeElement | undefined>;
type EventsReportFormType = Nullable<Pick<EventsReportParams, 'vehicle_id' | 'driver_id' | 'event_type'>>;

@Component({
  selector: 'app-reports-core-vehicles-events',
  templateUrl: './reports-core-vehicles-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreVehiclesEventsComponent implements OnInit, OnDestroy {
  readonly SHOW_EXPORT_WITHOUT_FILTERS = environment.reportsAlarmsShowExportWithoutFilters;
  accessGroup = AccessGroup;
  private readonly destroy$ = new Subject<void>();
  private readonly sub = new Subscription();

  allEvents: EventsElement[] = [];
  private readonly loadedPages = new Set<number>();

  eventsLoading$ = this.store.select(ReportsSelectors.eventsLoading);
  events$ = this.store.select(ReportsSelectors.events);
  eventsMeta$ = this.store.select(ReportsSelectors.eventsMeta);
  vehiclesLoading$ = this.store.select(EventsSelectors.vehiclesLoading);
  bodyGroup = this.fb.group<EventsReportFormType>({
    vehicle_id: [],
    driver_id: [],
    event_type: []
  });

  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-success-500' : undefined
      }))
    )
  );
  eventTypes$ = this.store.select(ConfigSelectors.data).pipe(
    map(data => {
      const eventTypes = data?.event_types.filter(type => type.show_in_selects);
      if (!eventTypes) return [];
      return eventTypes.map(type => ({
        value: type.default_name,
        label: type.name
      }));
    })
  );
  driverOptions$ = this.store.select(CommonObjectsSelectors.driversTree).pipe(
    map((drivers): SelectControl[] =>
      drivers.map(driver => ({
        value: driver.id,
        label: `${driver.name}`
      }))
    )
  );
  vehicleByDeviceId$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(map(vehicles => vehicles.reduce((prev, curr): VehicleByDeviceId => ({ ...prev, [curr.device_id]: curr }), {} as VehicleByDeviceId)));

  constructor(private readonly store: Store<AppState>, private readonly fb: NonNullableFormBuilder, private readonly router: Router, private readonly actions$: Actions) {}

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.fetchEvents({ params: { stacked: 'true' } }));

    this.store
      .select(EventsSelectors.eventsParams)
      .pipe(
        first(),
        takeUntil(this.destroy$),
        tap(() => {
          this.bodyGroup.reset({
            vehicle_id: [],
            driver_id: [],
            event_type: []
          });

          this.resetEvents();
          this.fetchData();
        })
      )
      .subscribe();

    this.bodyGroup.valueChanges
      .pipe(
        startWith(this.bodyGroup.value),
        pairwise(),
        takeUntil(this.destroy$),
        tap(() => {
          this.resetEvents();
          this.fetchData();
        })
      )
      .subscribe();

    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        takeUntil(this.destroy$),
        tap(fleetId => {
          this.store.dispatch(EventsActions.fetchVehicles({ params: { fleet_id: fleetId } }));
          this.resetEvents();
          this.fetchData(true);
        })
      )
      .subscribe();

    interval(10000)
      .pipe(
        filter(() => !document.hidden),
        withLatestFrom(this.eventsLoading$),
        filter(([, loading]) => !loading),
        takeUntil(this.destroy$),
        tap(() => {
          this.store.dispatch(ReportsActions.fetchEventsInBackground());
        })
      )
      .subscribe();

    this.store
      .select(ReportsSelectors.rangeFilter)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.resetEvents();
          this.store.dispatch(ReportsActions.fetchEvents({ params: { stacked: 'true' } }));
        })
      )
      .subscribe();

    this.sub.add(
      this.store
        .select(ReportsSelectors.events)
        .pipe(
          withLatestFrom(this.store.select(ReportsSelectors.eventsMeta)),
          filter(([events, meta]) => !!events && !!meta),
          takeUntil(this.destroy$),
          tap(([events, meta]) => {
            if (!meta) return;

            if (meta.current_page === 1) {
              this.allEvents = [...events];
              this.loadedPages.clear();
              this.loadedPages.add(1);
            } else if (!this.loadedPages.has(meta.current_page)) {
              const existingIds = new Set(this.allEvents.map(e => e.id));
              const newEvents = events.filter(e => !existingIds.has(e.id));

              this.allEvents = [...this.allEvents, ...newEvents];
              this.loadedPages.add(meta.current_page);
            }
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.actions$
        .pipe(
          ofType(ReportsActions.fetchEventsInBackgroundSuccess),
          takeUntil(this.destroy$),
          tap(({ data, meta }) => {
            if (data.length > 0) {
              if (this.allEvents.length > 0) {
                const existingIds = new Set(this.allEvents.map(e => e.id));
                const newEvents = data.filter(e => !existingIds.has(e.id));

                if (newEvents.length > 0) {
                  this.allEvents = [...data];
                }
              } else {
                this.allEvents = [...data];
              }
            }
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sub.unsubscribe();
  }

  handleNextPageRequest(page: number): void {
    if (this.loadedPages.has(page)) {
      return;
    }

    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        first(),
        takeUntil(this.destroy$),
        tap(fleetId => {
          const value = this.bodyGroup.value as EventsReportFormType;
          this.store.dispatch(
            ReportsActions.fetchEvents({
              params: {
                page,
                vehicle_id: (value.vehicle_id ?? []).join(','),
                event_type: (value.event_type ?? []).join(','),
                driver_id: (value.driver_id ?? []).join(','),
                fleet_id: fleetId,
                stacked: 'true',
                fetch_in_background: false
              }
            })
          );
        })
      )
      .subscribe();
  }

  handleExportClick(exportType: ExportType): void {
    this.store.dispatch(ReportsActions.exportAlarms({ exportType }));
  }

  handleExportEventsClick(exportType: ExportType): void {
    this.store.dispatch(
      ReportsActions.exportEvents({
        exportType: exportType
      })
    );
  }

  handleEventClick(id: string): void {
    this.router.navigate(['/', RouteConst.events, id]);
  }

  handleVehicleClick(id?: number): void {
    if (id) {
      this.router.navigate(['/', RouteConst.vehicles, id]);
    }
  }

  handleDriverClick(id?: number): void {
    if (id) {
      this.router.navigate(['/', RouteConst.drivers, id]);
    }
  }

  private fetchData(resetVehicle?: boolean): void {
    const value = this.bodyGroup.value as EventsReportFormType;
    this.store
      .select(ReportsSelectors.fleetId)
      .pipe(
        take(1),
        withLatestFrom(this.store.select(ReportsSelectors.eventsMeta)),
        takeUntil(this.destroy$),
        tap(([fleetId, eventsMeta]) => {
          if (resetVehicle) {
            this.bodyGroup.controls.vehicle_id.setValue([], { emitEvent: false });
          }

          const currentPage = eventsMeta?.current_page ?? 1;

          this.store.dispatch(
            ReportsActions.fetchEvents({
              params: {
                vehicle_id: resetVehicle ? undefined : (value.vehicle_id ?? []).join(','),
                event_type: (value.event_type ?? []).join(','),
                driver_id: (value.driver_id ?? []).join(','),
                fleet_id: fleetId,
                page: currentPage,
                fetch_in_background: false
              }
            })
          );
        })
      )
      .subscribe();
  }

  private resetEvents(): void {
    this.allEvents = [];
    this.loadedPages.clear();
  }
}
