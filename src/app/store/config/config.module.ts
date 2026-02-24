import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ConfigEffects } from 'src/app/store/config/config.effects';
import { CONFIG_FEATURE_KEY, configReducer } from 'src/app/store/config/config.reducer';

@NgModule({
  imports: [StoreModule.forFeature(CONFIG_FEATURE_KEY, configReducer), EffectsModule.forFeature([ConfigEffects])]
})
export class ConfigModule {}
