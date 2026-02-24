import { NgModule } from '@angular/core';
import { ContainsPipe } from 'src/app/shared/pipe/contains/contains.pipe';

@NgModule({
  declarations: [ContainsPipe],
  exports: [ContainsPipe]
})
export class ContainsModule {}
