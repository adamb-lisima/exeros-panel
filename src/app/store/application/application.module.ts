import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { APPLICATION_FEATURE_KEY, applicationReducer } from 'src/app/store/application/application.reducer';

@NgModule({
  imports: [StoreModule.forFeature(APPLICATION_FEATURE_KEY, applicationReducer)]
})
export class ApplicationModule {}
