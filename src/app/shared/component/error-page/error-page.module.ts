import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'src/app/shared/component/button/button.module';
import { ErrorPageComponent } from './error-page.component';

@NgModule({
  declarations: [ErrorPageComponent],
  imports: [CommonModule, ButtonModule],
  exports: [ErrorPageComponent]
})
export class ErrorPageModule {}
