import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SpiderChartComponent } from './spider-chart.component';

@NgModule({
  declarations: [SpiderChartComponent],
  imports: [CommonModule, NgApexchartsModule],
  exports: [SpiderChartComponent]
})
export class SpiderChartModule {}
