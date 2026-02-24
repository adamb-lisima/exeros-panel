import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { catchError, combineLatest, map, Subject, Subscription, take, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import { MapCoordinates, MapMarkerData, RouteSegment } from 'src/app/model/map.model';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { MapComponent } from '../../../../shared/component/map/map.component';
import { StreamActions } from '../../stream.actions';
import { EventTimeline } from '../../stream.model';

@Component({
  selector: 'app-stream-playback-map',
  templateUrl: './stream-playback-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .fullscreen-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        background-color: white;
      }
    `
  ]
})
export class StreamPlaybackMapComponent implements OnDestroy {
  playback$ = this.store.select(StreamSelectors.playback);
  selectedTripIndex$ = this.store.select(StreamSelectors.selectedTripIndex);
  currentPosition$ = this.store.select(StreamSelectors.playbackVideoCurrentTime);
  @ViewChild('mapComponent') mapComponent?: MapComponent;

  isFullscreen = false;

  private readonly destroy$ = new Subject<void>();
  private subscriptions = new Subscription();

  tripSelectOptions$ = this.store.select(StreamSelectors.playbackTimeline).pipe(
    map(
      timeline =>
        timeline?.trips?.map(trip => {
          const timeFrom = DateTime.fromFormat(trip.time_from, DateConst.serverDateTimeFormat).toFormat('HH:mm');
          const timeTo = DateTime.fromFormat(trip.time_to, DateConst.serverDateTimeFormat).toFormat('HH:mm');

          return {
            value: trip.index,
            label: `${trip.from} → ${trip.to} (${timeFrom} - ${timeTo})`
          } as SelectControl<number>;
        }) ?? []
    )
  );

  mapData$ = combineLatest([this.store.select(StreamSelectors.playbackTimeline), this.currentPosition$, this.store.select(StreamSelectors.selectedTripIndex)]).pipe(
    map(([playbackTimeline, currentTime, selectedTripIndex]) => {
      if (playbackTimeline && playbackTimeline.trips?.length && selectedTripIndex !== null) {
        const selectedTrip = playbackTimeline.trips.find(trip => trip.index === selectedTripIndex);
        if (selectedTrip) {
          const gpsTimeline = selectedTrip.gps_timeline;
          const eventTimeline = selectedTrip.event_timeline;
          const currentGpsPoint = currentTime ? this.findNearestGpsPoint(gpsTimeline, currentTime) : gpsTimeline[gpsTimeline.length - 1];

          return {
            center: currentGpsPoint?.coordinates ?? this.getMapCenter(gpsTimeline),
            markers: this.createMarkers(eventTimeline, currentGpsPoint, gpsTimeline),
            segments: this.createRouteSegments(gpsTimeline),
            polyline: gpsTimeline.map(gps => gps.coordinates)
          };
        }
      }

      if (!playbackTimeline?.gps_timeline.length) {
        return {
          center: undefined,
          markers: [],
          segments: [],
          polyline: []
        };
      }

      const gpsTimeline = playbackTimeline.gps_timeline;
      const currentGpsPoint = currentTime ? this.findNearestGpsPoint(gpsTimeline, currentTime) : gpsTimeline[gpsTimeline.length - 1];

      return {
        center: currentGpsPoint?.coordinates ?? this.getMapCenter(gpsTimeline),
        markers: this.createMarkers([], currentGpsPoint, gpsTimeline),
        segments: this.createRouteSegments(gpsTimeline),
        polyline: gpsTimeline.map(gps => gps.coordinates)
      };
    })
  );

  constructor(private readonly store: Store, private readonly changeDetectorRef: ChangeDetectorRef, private readonly ngZone: NgZone) {}

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.isFullscreen) {
      this.exitFullscreen();
      event.preventDefault();
    }
  }

  toggleFullscreen(): void {
    this.ngZone.run(() => {
      if (this.isFullscreen) {
        this.exitFullscreen();
      } else {
        this.enterFullscreen();
      }
    });
  }

  enterFullscreen(): void {
    this.isFullscreen = true;
    requestAnimationFrame(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  exitFullscreen(): void {
    this.isFullscreen = false;
    requestAnimationFrame(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  currentMapType: string = 'terrain';

  toggleMapType(): void {
    const map = this.mapComponent?.getMap();
    if (map) {
      const newType = this.currentMapType === 'satellite' ? 'terrain' : 'satellite';
      this.currentMapType = newType;
      map.setMapTypeId(newType);
    }
  }

  onMapReady(map: google.maps.Map): void {
    this.currentMapType = map.getMapTypeId() as string;
  }

  private findNearestGpsPoint(gpsTimeline: any[], currentTime: DateTime) {
    return gpsTimeline.reduce((nearest, point) => {
      const pointTime = DateTime.fromFormat(point.time, DateConst.serverDateTimeFormat);
      const currentDiff = Math.abs(currentTime.toMillis() - pointTime.toMillis());

      if (!nearest) return point;

      const nearestTime = DateTime.fromFormat(nearest.time, DateConst.serverDateTimeFormat);
      const nearestDiff = Math.abs(currentTime.toMillis() - nearestTime.toMillis());

      return currentDiff < nearestDiff ? point : nearest;
    }, null);
  }

  onTripSelect(tripIndex: number | null): void {
    this.store.dispatch(StreamActions.setPlaybackPlaying({ isPlaying: false }));
    this.store.dispatch(StreamActions.setCurrentTelemetryPoint({ point: null }));
    this.store.dispatch(StreamActions.resetPlaybackVideoCurrentTime());
    this.store.dispatch(StreamActions.resetPlaybackScope());

    this.store.dispatch(StreamActions.setSelectedTrip({ tripIndex }));
  }

  private getMapCenter(gpsTimeline: any[]): MapCoordinates {
    return gpsTimeline.length > 0 ? gpsTimeline[0].coordinates : undefined;
  }

  private createMarkers(eventTimeline: any[], currentGpsPoint: any, gpsTimeline: any[]): MapMarkerData[] {
    const markers: MapMarkerData[] = [];

    eventTimeline.forEach(event => {
      markers.push(this.createEventMarker(event));
    });

    if (currentGpsPoint) {
      markers.push({
        id: 'navigation',
        coordinates: currentGpsPoint.coordinates,
        direction: currentGpsPoint.direction,
        type: 'navigation',
        fillColorVariable: '--brand-500',
        strokeColorVariable: '--brand-500'
      });
    }

    if (gpsTimeline.length > 0) {
      markers.push({ id: 'start', coordinates: gpsTimeline[0].coordinates, type: 'start' }, { id: 'end', coordinates: gpsTimeline[gpsTimeline.length - 1].coordinates, type: 'end' });
    }

    return markers;
  }

  private createEventMarker(eventTimeline: EventTimeline): MapMarkerData {
    return {
      id: `event-${eventTimeline.time}`,
      coordinates: [eventTimeline.latitude, eventTimeline.longitude],
      type: 'event',
      icon: eventTimeline.name,
      onClick: this.createEventClickHandler(eventTimeline)
    };
  }

  private createEventClickHandler(eventTimeline: EventTimeline) {
    return () => {
      const startTime = DateTime.fromFormat(eventTimeline.time, DateConst.serverDateTimeFormat);

      this.store.dispatch(
        StreamActions.setPlaybackVideoStartTime({
          playbackVideoStartTime: startTime
        })
      );

      const subscription = this.store
        .select(StreamSelectors.playbackParams)
        .pipe(
          take(1),
          tap(params => {
            this.store.dispatch(
              StreamActions.fetchPlaybackScope({
                params: {
                  start_time: startTime.toFormat(DateConst.serverDateTimeFormat),
                  end_time: startTime.endOf('day').toFormat(DateConst.serverDateTimeFormat),
                  st: params.st
                }
              })
            );
          }),
          catchError((error: unknown) => {
            console.error('Error in event click handler:', error);
            return [];
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();

      this.subscriptions.add(subscription);

      this.store.dispatch(
        StreamActions.setPlaybackVideoCurrentTime({
          playbackVideoCurrentTime: startTime
        })
      );
    };
  }

  private createRouteSegments(gpsTimeline: any[]): RouteSegment[] {
    const segments: RouteSegment[] = [];

    for (let i = 0; i < gpsTimeline.length - 1; i++) {
      const current = gpsTimeline[i];
      const next = gpsTimeline[i + 1];

      segments.push({
        path: [this.mapToLatLng(current.coordinates), this.mapToLatLng(next.coordinates)].filter((pos): pos is google.maps.LatLngLiteral => !!pos),
        startTime: current.time,
        endTime: next.time,
        index: i
      });
    }

    return segments;
  }

  prepareMarker(eventTimeline: EventTimeline, timelineExist: boolean): MapMarkerData {
    const { time, latitude, longitude, name } = eventTimeline;

    const onClick = () => {
      const startTime = DateTime.fromFormat(time, DateConst.serverDateTimeFormat);

      const subscription = this.store
        .select(StreamSelectors.playbackParams)
        .pipe(
          take(1),
          tap(params => {
            this.store.dispatch(
              StreamActions.fetchPlaybackScope({
                params: {
                  start_time: startTime.toFormat(DateConst.serverDateTimeFormat),
                  end_time: startTime.endOf('day').toFormat(DateConst.serverDateTimeFormat),
                  st: params.st
                }
              })
            );
          }),
          catchError((error: unknown) => {
            console.error('Error in prepare marker:', error);
            return [];
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();

      this.subscriptions.add(subscription);

      this.store.dispatch(
        StreamActions.setPlaybackVideoCurrentTime({
          playbackVideoCurrentTime: startTime
        })
      );
    };

    return {
      id: `event-${time}`,
      coordinates: [latitude, longitude],
      type: 'event',
      icon: name,
      onClick: timelineExist ? onClick : undefined
    };
  }

  onSegmentClick(segment: RouteSegment) {
    const startTime = DateTime.fromFormat(segment.startTime, DateConst.serverDateTimeFormat);

    this.store.dispatch(
      StreamActions.setPlaybackVideoStartTime({
        playbackVideoStartTime: startTime
      })
    );

    const subscription = combineLatest([this.store.select(StreamSelectors.playbackParams), this.store.select(StreamSelectors.playbackSelectedSources), this.store.select(StreamSelectors.playbackScope), this.store.select(StreamSelectors.playbackTimeline)])
      .pipe(
        take(1),
        tap(([params, selectedSources, playbackScope, playbackTimeline]) => {
          if (selectedSources.length === 0 && playbackScope?.cameras && playbackScope.cameras.length > 0) {
            const firstCamera = playbackScope.cameras[0];
            this.store.dispatch(
              StreamActions.setPlaybackSelectedSources({
                playbackSelectedSources: [
                  {
                    provider: firstCamera.provider,
                    channel: firstCamera.channel,
                    stream: params.st === '1' ? firstCamera.main_stream : firstCamera.sub_stream,
                    has_playback_fixed: playbackScope.has_playback_fixed,
                    provider_details: firstCamera.provider_details
                  }
                ]
              })
            );
          }

          if (playbackTimeline?.has_video) {
            this.store.dispatch(
              StreamActions.fetchPlaybackScope({
                params: {
                  start_time: startTime.toFormat(DateConst.serverDateTimeFormat),
                  end_time: startTime.endOf('day').toFormat(DateConst.serverDateTimeFormat),
                  st: params.st
                }
              })
            );
          }
        }),
        catchError((error: unknown) => {
          console.error('Error in segment click:', error);
          return [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.subscriptions.add(subscription);

    this.store.dispatch(
      StreamActions.setPlaybackVideoCurrentTime({
        playbackVideoCurrentTime: startTime
      })
    );
  }

  private mapToLatLng(coordinates: MapCoordinates): google.maps.LatLngLiteral | undefined {
    const [lat, lng] = coordinates || [];
    return lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng)) ? { lat: Number(lat), lng: Number(lng) } : undefined;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
