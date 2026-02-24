import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, first, firstValueFrom, interval, map, Subject, withLatestFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import RouteConst from '../../../../const/route';
import { ExtendedTelemetryMetricsData } from '../../../../shared/component/telemetry-metrics/telemetry-metrics.component';
import { StreamActions } from '../../stream.actions';
import { StreamSelectors } from '../../stream.selectors';

@Component({
  selector: 'app-stream-core-telemetry',
  templateUrl: './stream-core-telemetry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [trigger('valueChange', [transition(':increment', [style({ opacity: 0.5, transform: 'scale(1.2)' }), animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]), transition(':decrement', [style({ opacity: 0.5, transform: 'scale(0.8)' }), animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))])]), trigger('textChange', [transition('* => *', [style({ opacity: 0, transform: 'translateY(-20px)' }), animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))])])]
})
export class StreamCoreTelemetryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly REALTIME_UPDATE_INTERVAL = 15000;
  playbackTimeline$ = this.store.select(StreamSelectors.playbackTimeline);
  isDetailsExpanded = false;

  telemetryData$ = this.store.select(StreamSelectors.updatedLiveFeed).pipe(
    map(liveFeed => {
      if (!liveFeed) {
        return null;
      }

      const timeline = liveFeed.telemetry_timeline ?? [];
      return timeline[0];
    })
  );

  liveData$ = this.store.select(StreamSelectors.updatedLiveFeed).pipe(
    map(liveFeed => {
      if (!liveFeed) {
        return null;
      }

      return {
        has_telemetry: liveFeed.has_telematics,
        driver: liveFeed.driver,
        telemetry_signal: liveFeed.telemetry_signal
      } as ExtendedTelemetryMetricsData;
    })
  );

  constructor(private readonly store: Store, private readonly router: Router) {}

  handleDriverClick(driverId: string): void {
    if (!driverId) return;
    this.router.navigate(['/', RouteConst.drivers, driverId]);
  }

  ngOnInit() {
    this.fetchTelemetrySignal();

    interval(this.REALTIME_UPDATE_INTERVAL)
      .pipe(
        takeUntil(this.destroy$),
        withLatestFrom(this.store.select(StreamSelectors.selectedId)),
        filter(([_, vehicleId]) => vehicleId !== undefined)
      )
      .subscribe(async ([_, vehicleId]) => {
        if (vehicleId) {
          this.store.dispatch(StreamActions.fetchTelemetryUpdate({ vehicleId }));

          const playbackTimeline = await firstValueFrom(this.playbackTimeline$);
          const currentLiveFeed = await firstValueFrom(this.store.select(StreamSelectors.liveFeed));
          if (!playbackTimeline?.has_video && currentLiveFeed) {
            const timeline = currentLiveFeed.telemetry_timeline ?? [];
            const latestTelemetry = timeline[0];
            if (latestTelemetry && latestTelemetry.lat && latestTelemetry.lng) {
              this.store.dispatch(
                StreamActions.setUpdatedLiveFeed({
                  data: {
                    ...currentLiveFeed,
                    last_updated_at: latestTelemetry.started_at,
                    last_speed: latestTelemetry.speed ?? currentLiveFeed.last_speed,
                    gps_position: [latestTelemetry.lat, latestTelemetry.lng],
                    direction: latestTelemetry.direction_number ?? currentLiveFeed.direction,
                    location: latestTelemetry.location ?? currentLiveFeed.location
                  }
                })
              );
            }
          }
        }
      });
  }

  private fetchTelemetrySignal() {
    this.store
      .select(StreamSelectors.selectedId)
      .pipe(
        first((vehicleId): vehicleId is number => vehicleId !== undefined),
        takeUntil(this.destroy$)
      )
      .subscribe(vehicleId => {
        this.store.dispatch(StreamActions.fetchTelemetryUpdate({ vehicleId }));
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDetails(): void {
    this.isDetailsExpanded = !this.isDetailsExpanded;
  }

  protected readonly event = Event;
}
