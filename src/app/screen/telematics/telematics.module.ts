import { CdkMenuModule } from '@angular/cdk/menu';
import { NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from 'src/app/shared/shared.module';
import { TelematicsCoreCardComponent } from './telematics-core/telematics-core-card/telematics-core-card.component';
import { TelematicsCoreCrashEventTypeComponent } from './telematics-core/telematics-core-crash-event-type/telematics-core-crash-event-type.component';
import { TelematicsCoreCrashEventsComponent } from './telematics-core/telematics-core-crash-events/telematics-core-crash-events.component';
import { TelematicsCoreEventInfosComponent } from './telematics-core/telematics-core-event-infos/telematics-core-event-infos.component';
import { TelematicsCoreFuelUsageComponent } from './telematics-core/telematics-core-fuel-usage/telematics-core-fuel-usage.component';
import { TelematicsCoreSpeedComponent } from './telematics-core/telematics-core-speed/telematics-core-speed.component';
import { TelematicsCoreTripInfosComponent } from './telematics-core/telematics-core-trip-infos/telematics-core-trip-infos.component';
import { TelematicsCoreComponent } from './telematics-core/telematics-core.component';
import { TelematicsLeftFleetInfoFieldComponent } from './telematics-left/telematics-left-fleet-info-field/telematics-left-fleet-info-field.component';
import { TelematicsLeftFleetInfoComponent } from './telematics-left/telematics-left-fleet-info/telematics-left-fleet-info.component';
import { TelematicsLeftFromToComponent } from './telematics-left/telematics-left-from-to/telematics-left-from-to.component';
import { TelematicsLeftComponent } from './telematics-left/telematics-left.component';
import { TelematicsTopComponent } from './telematics-top/telematics-top.component';
import { TelematicsEffects } from './telematics.effects';
import { TELEMATICS_FEATURE_KEY, telematicsReducer } from './telematics.reducer';

@NgModule({
  declarations: [TelematicsCoreComponent, TelematicsLeftComponent, TelematicsTopComponent, TelematicsLeftFleetInfoComponent, TelematicsLeftFromToComponent, TelematicsLeftFleetInfoFieldComponent, TelematicsCoreCardComponent, TelematicsCoreEventInfosComponent, TelematicsCoreCrashEventsComponent, TelematicsCoreCrashEventTypeComponent, TelematicsCoreTripInfosComponent, TelematicsCoreComponent, TelematicsLeftComponent, TelematicsTopComponent, TelematicsLeftFleetInfoComponent, TelematicsLeftFromToComponent, TelematicsLeftFleetInfoFieldComponent, TelematicsCoreFuelUsageComponent, TelematicsCoreSpeedComponent, TelematicsLeftComponent, TelematicsTopComponent],
  imports: [StoreModule.forFeature(TELEMATICS_FEATURE_KEY, telematicsReducer), EffectsModule.forFeature([TelematicsEffects]), SharedModule, FormsModule, CdkMenuModule, NgOptimizedImage]
})
export class TelematicsModule {}
