import { NgModule } from '@angular/core';
import { HumanizePipe } from 'src/app/shared/pipe/humanize/humanize.pipe';

@NgModule({
  declarations: [HumanizePipe],
  exports: [HumanizePipe]
})
export class HumanizeModule {}
