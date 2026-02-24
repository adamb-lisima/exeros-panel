import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipModule } from '../../../directive/tooltip/tooltip.module';
import { PipeModule } from '../../../pipe/pipe.module';
import { UnitAdderModule } from '../../../pipe/unit-adder/unit-adder.module';
import { SpeedChartComponent } from './speed-chart.component';

@NgModule({
  declarations: [SpeedChartComponent],
  imports: [CommonModule, OverlayModule, PipeModule, TooltipModule, UnitAdderModule],
  exports: [SpeedChartComponent]
})
export class SpeedChartModule {}
