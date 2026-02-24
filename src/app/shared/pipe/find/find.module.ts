import { NgModule } from '@angular/core';
import { FindPipe } from 'src/app/shared/pipe/find/find.pipe';

@NgModule({
  declarations: [FindPipe],
  exports: [FindPipe]
})
export class FindModule {}
