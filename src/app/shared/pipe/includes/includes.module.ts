import { NgModule } from '@angular/core';
import { IncludesPipe } from './includes.pipe';

@NgModule({
  declarations: [IncludesPipe],
  exports: [IncludesPipe]
})
export class IncludesModule {}
