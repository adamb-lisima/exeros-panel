import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DirectiveModule } from '../../../directive/directive.module';
import { SelectControlShowFilterComponent } from './select-control-show-filter.component';

@NgModule({
  declarations: [SelectControlShowFilterComponent],
  imports: [CommonModule, FormsModule, MatSelectModule, DirectiveModule, MatIconModule],
  exports: [SelectControlShowFilterComponent]
})
export class SelectControlShowFilterModule {}
