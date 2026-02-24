import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'src/app/shared/component/button/button.module';
import { EmptyStateComponent } from './empty-state.component';

@NgModule({
  declarations: [EmptyStateComponent],
  imports: [CommonModule, ButtonModule],
  exports: [EmptyStateComponent]
})
export class EmptyStateModule {}
