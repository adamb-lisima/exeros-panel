import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AuthEffects } from 'src/app/store/auth/auth.effects';
import { AUTH_FEATURE_KEY, authReducer } from 'src/app/store/auth/auth.reducer';

@NgModule({
  imports: [StoreModule.forFeature(AUTH_FEATURE_KEY, authReducer), EffectsModule.forFeature([AuthEffects])]
})
export class AuthModule {}
