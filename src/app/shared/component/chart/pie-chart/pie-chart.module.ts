import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PieChartComponent } from './pie-chart.component';

@NgModule({
  declarations: [PieChartComponent],
  imports: [CommonModule, NgApexchartsModule],
  exports: [PieChartComponent]
})
export class PieChartModule {}
