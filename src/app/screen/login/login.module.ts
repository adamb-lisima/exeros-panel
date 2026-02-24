import { NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoginComponent } from 'src/app/screen/login/login.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [SharedModule, NgOptimizedImage]
})
export class LoginModule {}
