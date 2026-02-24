import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeSelectControlComponent } from './time-select-control.component';

@NgModule({
  declarations: [TimeSelectControlComponent],
  imports: [CommonModule, FormsModule],
  exports: [TimeSelectControlComponent]
})
export class TimeSelectControlModule {}
