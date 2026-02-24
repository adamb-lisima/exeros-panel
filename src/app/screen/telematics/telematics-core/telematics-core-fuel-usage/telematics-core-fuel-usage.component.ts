import { ChangeDetectionStrategy, Component } from '@angular/core';
import { of } from 'rxjs';

const fakeData = [
  {
    name: '',
    data: [
      {
        x: '2022-12-23',
        y: 3,
        unit: 'Mpg'
      },
      {
        x: '2022-12-24',
        y: 4,
        unit: 'Mpg'
      },
      {
        x: '2022-12-25',
        y: 20,
        unit: 'Mpg'
      },
      {
        x: '2022-12-26',
        y: 0,
        unit: 'Mpg'
      },
      {
        x: '2022-12-27',
        y: 7,
        unit: 'Mpg'
      },
      {
        x: '2022-12-28',
        y: 19,
        unit: 'Mpg'
      }
    ]
  }
];

@Component({
  selector: 'app-telematics-core-fuel-usage',
  templateUrl: './telematics-core-fuel-usage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsCoreFuelUsageComponent {
  data$ = of(fakeData);
}
