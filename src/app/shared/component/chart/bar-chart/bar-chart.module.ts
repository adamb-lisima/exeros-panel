import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BarChartComponent } from './bar-chart.component';

@NgModule({
  declarations: [BarChartComponent],
  imports: [CommonModule, OverlayModule],
  exports: [BarChartComponent]
})
export class BarChartModule {}
