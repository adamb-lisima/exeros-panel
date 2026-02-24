import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { driversOptions, mapCenter, mapMarkers, vehicleOptions } from '../mocks';

@Component({
  templateUrl: './telematics-left.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelematicsLeftComponent {
  vehicleOptions$ = of(vehicleOptions);
  driversOptions$ = of(driversOptions);
  center = mapCenter;
  markers$ = of(mapMarkers);
  from = '2464 Royal Ln. Mesa, New Jersey 45463';
  to = '2972 Westheimer Rd. Santa Ana, Illinois 85486';
  vehicleLocation = '239 SE. Rock Creek St. Oviedo, FL 32765';
  numberOfTrips = 13;
  averageTripLength = '1.5 days';

  bodyGroup = this.fb.group<Nullable<Pick<any, 'vehicle_id' | 'driver_id'>>>({
    vehicle_id: undefined,
    driver_id: undefined
  });

  constructor(private readonly fb: FormBuilder) {}
}
