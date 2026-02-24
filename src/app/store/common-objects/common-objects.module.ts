import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CommonObjectsEffects } from './common-objects.effects';
import { COMMON_OBJECTS_FEATURE_KEY, commonObjectsReducer } from './common-objects.reducer';

@NgModule({
  imports: [StoreModule.forFeature(COMMON_OBJECTS_FEATURE_KEY, commonObjectsReducer), EffectsModule.forFeature([CommonObjectsEffects])]
})
export class CommonObjectsModule {}
