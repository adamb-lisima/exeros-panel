import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TripInfo } from '../../mocks';

type View = 'trip' | 'histogram';

@Component({
  selector: 'app-telematics-core-trip-infos',
  templateUrl: './telematics-core-trip-infos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsCoreTripInfosComponent {
  @Input() tripInfos: TripInfo[] = [];

  view: View = 'trip';

  changeView(view: View): void {
    if (view === this.view) {
      return;
    }
    this.view = view;
  }
}
