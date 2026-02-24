import { NgModule } from '@angular/core';
import { OrdinalNumberSuffixPipe } from './ordinal-number-suffix.pipe';

@NgModule({
  declarations: [OrdinalNumberSuffixPipe],
  exports: [OrdinalNumberSuffixPipe]
})
export class OrdinalNumberSuffixModule {}
