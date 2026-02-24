import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, scan, Subject, take } from 'rxjs';
import { shareReplay, takeUntil } from 'rxjs/operators';
import { TelemetryTimelinePoint, VehicleType } from 'src/app/screen/stream/stream.model';
import DateConst from '../../../../const/date';
import RouteConst from '../../../../const/route';
import { StreamActions } from '../../../stream/stream.actions';
import { StreamSelectors } from '../../../stream/stream.selectors';
@Component({
  selector: 'app-playbacks-telemetry',
  templateUrl: './playbacks-telemetry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaybacksTelemetryComponent implements OnInit, OnDestroy {
  isDetailsExpanded = false;

  private readonly destroy$ = new Subject<void>();
  playbackScope$ = this.store.select(StreamSelectors.playbackScope).pipe(takeUntil(this.destroy$), shareReplay(1));

  playback$ = this.store.select(StreamSelectors.playback).pipe(takeUntil(this.destroy$), shareReplay(1));

  telemetryData$ = combineLatest([this.playbackScope$, this.store.select(StreamSelectors.playbackVideoCurrentTime)]).pipe(
    takeUntil(this.destroy$),
    debounceTime(50),
    filter(([scope, selectedTime]) => !!scope?.telemetry_timeline?.length && !!selectedTime),
    map(([scope, selectedTime]) => {
      if (!selectedTime || !scope?.telemetry_timeline?.length) {
        return null;
      }

      if (!selectedTime) {
        return scope.telemetry_timeline[0];
      }

      const sortedTimeline = [...scope.telemetry_timeline].sort((a, b) => {
        const timeA = DateTime.fromFormat(a.started_at, DateConst.serverDateTimeFormat).toMillis();
        const timeB = DateTime.fromFormat(b.started_at, DateConst.serverDateTimeFormat).toMillis();
        return timeA - timeB;
      });

      const currentTimeMs = selectedTime.toMillis();
      let lastValidPoint = sortedTimeline[0];

      for (const point of sortedTimeline) {
        const pointTime = DateTime.fromFormat(point.started_at, DateConst.serverDateTimeFormat).toMillis();
        if (pointTime <= currentTimeMs) {
          lastValidPoint = point;
        } else {
          break;
        }
      }

      return lastValidPoint;
    }),
    scan((acc: TelemetryTimelinePoint | null, curr: TelemetryTimelinePoint | null) => {
      return curr || acc;
    }, null),
    distinctUntilChanged((prev, curr) => {
      if (!prev || !curr) return prev === curr;
      return prev.started_at === curr.started_at;
    }),
    shareReplay(1)
  );

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit() {
    this.store
      .select(StreamSelectors.playback)
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        filter(playback => !!playback)
      )
      .subscribe(playback => {
        if (playback) {
          this.store.dispatch(
            StreamActions.fetchTelemetryTimeline({
              vehicleId: playback.id,
              date: playback.calendar[0]?.date ?? DateTime.now().setZone('Europe/London').toFormat(DateConst.serverDateFormat)
            })
          );
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    this.isDetailsExpanded = false;
  }

  handleExportClick(): void {
    this.store.dispatch(StreamActions.exportTelemetry());
  }

  handleDriverClick(driverId: string): void {
    this.router.navigate(['/', RouteConst.drivers, driverId]);
  }

  getVehicleIcons(type: VehicleType): string {
    const vehicleIcons = {
      HGV: 'assets/svg/vehicle-icons/HGV.svg',
      COMPANY_CAR: 'assets/svg/vehicle-icons/company_car.svg',
      VAN: 'assets/svg/vehicle-icons/van.svg',
      BUS: 'assets/svg/vehicle-icons/Bus.svg'
    };

    return vehicleIcons[type] || vehicleIcons['COMPANY_CAR'];
  }

  mapVehicleType(type: string): string {
    const vehicleTypes: { [key: string]: string } = {
      HGV: 'HGV',
      COMPANY_CAR: 'Company Car',
      VAN: 'VAN',
      BUS: 'Bus'
    };

    return vehicleTypes[type] || type;
  }

  getSignalColor(signal: number): string {
    if (signal === 1) return '#FE3C3C';
    if (signal >= 2 && signal <= 3) return '#F5BE18';
    return '#14A54D';
  }

  toggleDetails(): void {
    this.isDetailsExpanded = !this.isDetailsExpanded;
  }
}
