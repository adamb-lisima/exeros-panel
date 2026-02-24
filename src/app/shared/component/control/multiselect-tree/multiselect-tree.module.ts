import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MultiselectTreeComponent } from 'src/app/shared/component/control/multiselect-tree/multiselect-tree.component';
import { DirectiveModule } from '../../../directive/directive.module';

@NgModule({
  declarations: [MultiselectTreeComponent],
  imports: [CommonModule, FormsModule, MatSelectModule, DirectiveModule, MatIconModule],
  exports: [MultiselectTreeComponent]
})
export class MultiselectTreeModule {}
