import { NgModule } from '@angular/core';
import { ContainsPropertyPipe } from 'src/app/shared/pipe/contains-property/contains-property.pipe';

@NgModule({
  declarations: [ContainsPropertyPipe],
  exports: [ContainsPropertyPipe]
})
export class ContainsPropertyModule {}
