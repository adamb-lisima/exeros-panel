import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { ALERT_FEATURE_KEY, alertReducer } from 'src/app/store/alert/alert.reducer';

@NgModule({
  imports: [StoreModule.forFeature(ALERT_FEATURE_KEY, alertReducer)]
})
export class AlertModule {}
