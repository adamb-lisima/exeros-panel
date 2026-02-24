import { NgModule } from '@angular/core';
import { UnauthenticatedContainerComponent } from 'src/app/core/unauthenticated-container/unauthenticated-container.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [UnauthenticatedContainerComponent],
  imports: [SharedModule],
  exports: [UnauthenticatedContainerComponent]
})
export class UnauthenticatedContainerModule {}
