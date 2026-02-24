import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipModule } from '../../directive/tooltip/tooltip.module';
import { VehicleStatusIconsComponent } from './vehicle-status-icons.component';

@NgModule({
  declarations: [VehicleStatusIconsComponent],
  imports: [CommonModule, TooltipModule],
  exports: [VehicleStatusIconsComponent]
})
export class VehicleStatusIconsModule {}
