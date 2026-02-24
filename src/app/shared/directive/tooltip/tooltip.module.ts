import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipDirective } from 'src/app/shared/directive/tooltip/tooltip.directive';
import { TooltipComponent } from './tooltip.component';

@NgModule({
  declarations: [TooltipComponent, TooltipDirective],
  imports: [CommonModule],
  exports: [TooltipDirective]
})
export class TooltipModule {}
