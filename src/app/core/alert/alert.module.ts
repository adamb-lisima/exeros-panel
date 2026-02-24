import { NgModule } from '@angular/core';
import { AlertComponent } from 'src/app/core/alert/alert.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [AlertComponent],
  imports: [SharedModule],
  exports: [AlertComponent]
})
export class AlertModule {}
