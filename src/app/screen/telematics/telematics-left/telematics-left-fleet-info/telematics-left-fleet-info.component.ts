import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-telematics-left-fleet-info',
  templateUrl: './telematics-left-fleet-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsLeftFleetInfoComponent {
  @Input() vehicleLocation: string = '';
  @Input() numberOfTrips: number = 0;
  @Input() averageTripLength: string = '';
}
