import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CountBadgeModule } from '../count-badge/count-badge.module';
import { TabsComponent } from './tabs.component';

@NgModule({
  declarations: [TabsComponent],
  imports: [CommonModule, CountBadgeModule],
  exports: [TabsComponent]
})
export class TabsModule {}
