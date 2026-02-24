import { NgModule } from '@angular/core';
import { FilterPipe } from 'src/app/shared/pipe/filter/filter.pipe';

@NgModule({
  declarations: [FilterPipe],
  exports: [FilterPipe]
})
export class FilterModule {}
