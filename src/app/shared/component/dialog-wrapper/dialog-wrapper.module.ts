import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { DialogWrapperComponent } from './dialog-wrapper.component';

@NgModule({
  declarations: [DialogWrapperComponent],
  imports: [CommonModule, A11yModule],
  exports: [DialogWrapperComponent]
})
export class DialogWrapperModule {}
