import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CountBadgeComponent } from './count-badge.component';

@NgModule({
  declarations: [CountBadgeComponent],
  imports: [CommonModule],
  exports: [CountBadgeComponent]
})
export class CountBadgeModule {}
