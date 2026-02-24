import { ChangeDetectionStrategy, Component } from '@angular/core';
import { of } from 'rxjs';

const fakeData = [
  {
    name: '',
    data: [
      {
        x: '2022-12-23',
        y: 3,
        unit: 'Mph'
      },
      {
        x: '2022-12-24',
        y: 0,
        unit: 'Mph'
      },
      {
        x: '2022-12-25',
        y: 0,
        unit: 'Mph'
      },
      {
        x: '2022-12-26',
        y: 0,
        unit: 'Mph'
      },
      {
        x: '2022-12-27',
        y: 7,
        unit: 'Mph'
      },
      {
        x: '2022-12-28',
        y: 0,
        unit: 'Mph'
      }
    ]
  }
];

@Component({
  selector: 'app-telematics-core-speed',
  templateUrl: './telematics-core-speed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsCoreSpeedComponent {
  data$ = of(fakeData);
}
