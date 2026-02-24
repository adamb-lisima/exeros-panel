import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DirectiveModule } from '../../../directive/directive.module';
import { SelectControlCounterComponent } from './select-control-counter.component';

@NgModule({
  declarations: [SelectControlCounterComponent],
  imports: [CommonModule, FormsModule, MatSelectModule, DirectiveModule, MatIconModule],
  exports: [SelectControlCounterComponent]
})
export class SelectControlCounterModule {}
