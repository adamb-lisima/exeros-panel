import { NgModule } from '@angular/core';
import { UnitConverterPipe } from './unit-converter.pipe';

@NgModule({
  declarations: [UnitConverterPipe],
  exports: [UnitConverterPipe]
})
export class UnitConverterModule {}
