import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { PieChartData } from '../../../../shared/component/chart/pie-chart/pie-chart.component';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-events-impact',
  templateUrl: './drivers-core-events-impact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversEventsImpactComponent {
  eventImpactData$ = this.store.select(DriversSelectors.safetyScoresMeta).pipe(
    map(meta => {
      if (!meta?.by_events) {
        return null;
      }

      const chartData: PieChartData[] = Object.entries(meta.by_events)
        .sort((a, b) => b[1].impact_percentage - a[1].impact_percentage)
        .map(([name, impact]) => ({
          name,
          value: impact.impact_percentage
        }));

      return chartData;
    })
  );

  constructor(private readonly store: Store) {}

  hasData(data: PieChartData[] | null): boolean {
    if (!data || data.length === 0) {
      return false;
    }

    return data.some(item => item.value > 0);
  }
}
