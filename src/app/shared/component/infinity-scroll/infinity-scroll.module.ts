import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InfinityScrollComponent } from 'src/app/shared/component/infinity-scroll/infinity-scroll.component';
import { VirtualInfinityScrollContextDirective } from './virtual-infinity-scroll-context.directive';
import { VirtualInfinityScrollComponent } from './virtual-infinity-scroll.component';

@NgModule({
  declarations: [InfinityScrollComponent, VirtualInfinityScrollComponent, VirtualInfinityScrollContextDirective],
  imports: [CommonModule, ScrollingModule],
  exports: [InfinityScrollComponent, VirtualInfinityScrollComponent, VirtualInfinityScrollContextDirective, ScrollingModule]
})
export class InfinityScrollModule {}
