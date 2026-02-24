import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { SpiderChartData } from '../../../../shared/component/chart/spider-chart/spider-chart.component';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-safety-spider',
  templateUrl: './drivers-core-safety-spider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreSafetySpiderComponent {
  safetyData$ = this.store.select(DriversSelectors.safetyScoresMeta).pipe(map(meta => meta?.spider_chart_data ?? null));

  constructor(private readonly store: Store) {}

  hasData(data: SpiderChartData | null): boolean {
    if (!data || !data.series || data.series.length === 0) {
      return false;
    }

    return data.series.some(serie => serie.data.some(value => value !== 0));
  }
}
