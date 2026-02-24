import { NgModule } from '@angular/core';
import { HumanizeFileSizePipe } from './humanize-file-size.pipe';

@NgModule({
  declarations: [HumanizeFileSizePipe],
  exports: [HumanizeFileSizePipe]
})
export class HumanizeFileSizeModule {}
