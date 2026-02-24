import { NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { ResetPasswordComponent } from 'src/app/screen/reset-password/reset-password.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [ResetPasswordComponent],
  imports: [SharedModule, NgOptimizedImage]
})
export class ResetPasswordModule {}
