import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateFormatModule } from '../../../pipe/date-format/date-format.module';
import { StackedBarChartComponent } from './stacked-bar-chart.component';

@NgModule({
  declarations: [StackedBarChartComponent],
  imports: [CommonModule, OverlayModule, DateFormatModule],
  exports: [StackedBarChartComponent]
})
export class StackedBarChartModule {}
