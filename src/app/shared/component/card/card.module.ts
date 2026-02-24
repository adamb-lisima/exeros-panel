import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CardComponent } from './card.component';
import { CardMetricComponent } from './card-metric.component';
import { SkeletonLoaderModule } from '../skeleton-loader/skeleton-loader.module';

@NgModule({
  declarations: [CardComponent, CardMetricComponent],
  imports: [CommonModule, SkeletonLoaderModule],
  exports: [CardComponent, CardMetricComponent]
})
export class CardModule {}
