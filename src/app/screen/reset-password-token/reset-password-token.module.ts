import { NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { ResetPasswordTokenComponent } from 'src/app/screen/reset-password-token/reset-password-token.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [ResetPasswordTokenComponent],
  imports: [SharedModule, NgOptimizedImage]
})
export class ResetPasswordTokenModule {}
