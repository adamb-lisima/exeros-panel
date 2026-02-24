import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first, map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapCoordinates, MapMarkerData } from '../../../../model/map.model';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { EventsActions } from '../../events.actions';
import { TripsElement, TripsParams } from '../../events.model';
import { eventsInitialState } from '../../events.reducer';
import { EventsSelectors } from '../../events.selectors';

@Component({
  templateUrl: './events-core-trips-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsCoreTripsDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly sortOrderOptions: SelectControl<TripsParams['sort_order']>[] = [
    { value: 'ASC', label: 'ASC' },
    { value: 'DESC', label: 'DESC' }
  ];
  paramsGroup = this.fb.group<Nullable<Pick<TripsParams, 'sort_order'>>>({
    sort_order: undefined
  });
  trips$ = this.store.select(EventsSelectors.trips);
  tripsMeta$ = this.store.select(EventsSelectors.tripsMeta);
  tripsLoading$ = this.store.select(EventsSelectors.tripsLoading);
  tripLoading$ = this.store.select(EventsSelectors.tripLoading);
  trip$ = this.store.select(EventsSelectors.trip);
  mapData$ = this.store.select(EventsSelectors.trip).pipe(
    map((trip): { center?: MapCoordinates; markers?: MapMarkerData[]; polyline?: MapCoordinates[] } => {
      const center = trip ? ([trip.to_lon, trip.to_lat] as MapCoordinates) : undefined;
      const polyline = trip?.gps_timeline.map(gps => gps.coordinates);
      const markers: MapMarkerData[] = [];
      trip?.event_timeline.forEach(eventTimeline => markers.push({ id: `event-${eventTimeline.time}`, coordinates: [eventTimeline.latitude, eventTimeline.longitude], type: 'event' }));
      if (trip) {
        markers.push({ id: 'start', coordinates: [trip.from_lon, trip.from_lat], type: 'start' });
        markers.push({ id: 'end', coordinates: [trip.to_lon, trip.to_lat], type: 'end' });
      }
      return { center, markers, polyline };
    })
  );
  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialogRef: DialogRef) {}

  ngOnInit(): void {
    this.store
      .select(EventsSelectors.event)
      .pipe(
        first(),
        tap(event => this.store.dispatch(EventsActions.fetchTrips({ params: { vehicle_id: event?.vehicle_id } }))),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.store
      .select(EventsSelectors.tripsParams)
      .pipe(
        first(),
        tap(tripsParams => this.paramsGroup.reset({ sort_order: tripsParams.sort_order })),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.paramsGroup.valueChanges
      .pipe(
        tap(params =>
          this.store.dispatch(
            EventsActions.fetchTrips({
              params: {
                ...(params as Pick<TripsParams, 'sort_order'>),
                page: eventsInitialState.tripsParams.page,
                per_page: eventsInitialState.tripsParams.per_page
              }
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.store.dispatch(EventsActions.resetTrips());
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  handleNextPageRequest(page: TripsParams['page']): void {
    this.store.dispatch(EventsActions.fetchTrips({ params: { page } }));
  }

  handleTripClick(trip: TripsElement): void {
    this.store.dispatch(EventsActions.fetchTrip({ id: trip.id }));
  }
}
