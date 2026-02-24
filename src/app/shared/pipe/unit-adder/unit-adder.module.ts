import { NgModule } from '@angular/core';
import { UnitAdderPipe } from './unit-adder.pipe';

@NgModule({
  declarations: [UnitAdderPipe],
  exports: [UnitAdderPipe]
})
export class UnitAdderModule {}
