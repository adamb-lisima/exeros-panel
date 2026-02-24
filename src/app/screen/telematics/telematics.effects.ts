import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TelematicsService } from './telematics.service';

@Injectable()
export class TelematicsEffects {
  constructor(private readonly store: Store, private readonly actions$: Actions, private readonly telematicsService: TelematicsService) {}
}
