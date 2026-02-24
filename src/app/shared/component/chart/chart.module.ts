import { NgModule } from '@angular/core';
import { BarChartModule } from './bar-chart/bar-chart.module';
import { LineChartModule } from './line-chart/line-chart.module';
import { PieChartModule } from './pie-chart/pie-chart.module';
import { SpeedChartModule } from './speed-chart/speed-chart.module';
import { SpiderChartModule } from './spider-chart/spider-chart.module';
import { StackedBarChartModule } from './stacked-bar-chart/stacked-bar-chart.module';

@NgModule({
  exports: [PieChartModule, SpiderChartModule, BarChartModule, LineChartModule, SpeedChartModule, StackedBarChartModule]
})
export class ChartModule {}
