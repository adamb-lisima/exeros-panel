import { NgModule } from '@angular/core';
import { RxFor } from '@rx-angular/template/for';
import { RxForTrackByFieldDirective } from './rx-for-track-by-field.directive';

@NgModule({
  declarations: [RxForTrackByFieldDirective],
  imports: [RxFor],
  exports: [RxForTrackByFieldDirective, RxFor]
})
export class RxForTrackByFieldModule {}
