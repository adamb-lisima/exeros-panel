import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { map } from 'rxjs';
import DateConst from 'src/app/const/date';
import { ChartOptions } from 'src/app/model/chart.model';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-safety-score',
  templateUrl: './drivers-core-safety-scores.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreSafetyScoresComponent {
  yAxisTicks = [0, 1, 2, 3, 4, 5];

  chartOptions$ = this.store.select(DriversSelectors.safetyScores).pipe(
    map((scores): ChartOptions | undefined => {
      if (!scores) {
        return undefined;
      }

      const sortedScores = [...scores].sort((a, b) => {
        const aMillis = DateTime.fromFormat(a.issued_at, DateConst.serverDateFormat).toMillis();
        const bMillis = DateTime.fromFormat(b.issued_at, DateConst.serverDateFormat).toMillis();
        return aMillis - bMillis;
      });

      const scoreData = sortedScores.map(score => ({
        x: score.issued_at,
        y: score.star_score,
        unit: 'pts'
      }));

      let firstDate = null;
      let lastDate = null;

      if (sortedScores.length > 0) {
        firstDate = sortedScores[0].issued_at;
        lastDate = sortedScores[sortedScores.length - 1].issued_at;
      }

      return {
        series: [
          { name: 'Driver Score', data: scoreData },
          {
            name: 'Scale Reference',
            data:
              firstDate && lastDate
                ? [
                    { x: firstDate, y: 0, unit: 'pts' },
                    { x: firstDate, y: 5, unit: 'pts' }
                  ]
                : []
          }
        ]
      };
    })
  );

  constructor(private readonly store: Store) {}
}
