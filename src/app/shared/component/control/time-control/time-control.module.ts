import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TimeControlComponent } from 'src/app/shared/component/control/time-control/time-control.component';

@NgModule({
  declarations: [TimeControlComponent],
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatIconModule, MatInputModule],
  exports: [TimeControlComponent]
})
export class TimeControlModule {}
