import { NgModule } from '@angular/core';
import { AlertComponent } from 'src/app/core/alert/alert.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ToastModule } from 'src/app/shared/component/toast/toast.module';

@NgModule({
  declarations: [AlertComponent],
  imports: [SharedModule, ToastModule],
  exports: [AlertComponent]
})
export class AlertModule {}
