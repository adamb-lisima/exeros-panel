import { NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { WatchClipCoreComponent } from '../watch-clip/watch-clip-core/watch-clip-core.component';

@NgModule({
  declarations: [WatchClipCoreComponent],
  imports: [SharedModule, NgOptimizedImage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WatchClipModule {}
