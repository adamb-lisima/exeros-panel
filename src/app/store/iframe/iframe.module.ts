import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { IFRAME_FEATURE_KEY, iframeReducer } from 'src/app/store/iframe/iframe.reducer';

@NgModule({
  imports: [StoreModule.forFeature(IFRAME_FEATURE_KEY, iframeReducer)]
})
export class IframeModule {}
