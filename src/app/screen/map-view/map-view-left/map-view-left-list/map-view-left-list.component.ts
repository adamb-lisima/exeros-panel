import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { Observable, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, first, takeUntil } from 'rxjs/operators';
import DateConst from '../../../../const/date';
import RouteConst from '../../../../const/route';
import { AppState } from '../../../../store/app-store.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { StreamActions } from '../../../stream/stream.actions';
import { MapVehiclesElement } from '../../../stream/stream.model';
import { StreamSelectors } from '../../../stream/stream.selectors';

@Component({
  selector: 'app-map-view-left-list',
  templateUrl: './map-view-left-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewLeftListComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  vehicles$: Observable<MapVehiclesElement[]> = this.store.select(CommonObjectsSelectors.updatedMapVehicles).pipe(
    distinctUntilChanged((prev, curr) => prev?.length === curr?.length && prev?.[0]?.device_id === curr?.[0]?.device_id),
    catchError(() => of([]))
  );

  vehiclesMeta$ = this.store.select(StreamSelectors.vehiclesMeta);

  constructor(private readonly store: Store<AppState>, private readonly fb: FormBuilder, private readonly router: Router) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleViewPlayback = (event: Event, vehicle: MapVehiclesElement): void => {
    if (!event || !vehicle?.vehicle_id) return;
    event.stopPropagation();

    this.store.dispatch(StreamActions.setLastVisitedTab({ route: RouteConst.mapView }));
    sessionStorage.setItem('lastVisitedTab', RouteConst.mapView);

    this.store
      .select(StreamSelectors.mapTimeRange)
      .pipe(first(), takeUntil(this.destroy$))
      .subscribe(timeRange => {
        const hasFromTime = timeRange.from !== null;
        const fromTimeValue = timeRange.from;
        DateTime.now().setZone('Europe/London').toFormat(DateConst.serverDateFormat);
        let playbackDate: DateTime | null = null;
        let startTime: DateTime | null = null;

        if (hasFromTime && fromTimeValue) {
          try {
            startTime = DateTime.fromFormat(fromTimeValue, 'yyyy-MM-dd HH:mm:ss');

            if (startTime.isValid) {
              playbackDate = startTime;
              playbackDate.toFormat(DateConst.serverDateFormat);
            } else {
              if (fromTimeValue.includes('-') && fromTimeValue.length >= 10) {
                const datePart = fromTimeValue.substring(0, 10);
                playbackDate = DateTime.fromFormat(datePart, 'yyyy-MM-dd');

                if (playbackDate.isValid) {
                  playbackDate.toFormat(DateConst.serverDateFormat);
                  playbackDate.startOf('day');
                } else {
                  playbackDate = null;
                }
              }
            }
          } catch (error) {
            playbackDate = null;
          }
        }

        this.router.navigate(['/', RouteConst.playbacks, vehicle.vehicle_id]);
      });
  };

  focusOnVehicle(vehicle: MapVehiclesElement): void {
    if (!vehicle || !vehicle.last_coordinates || !vehicle.last_coordinates[0] || !vehicle.last_coordinates[1]) return;

    this.store.dispatch(
      StreamActions.focusMapOnVehicle({
        coordinates: vehicle.last_coordinates,
        zoom: 15
      })
    );
  }
}
