import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TreeControlComponent } from 'src/app/shared/component/control/tree-control/tree-control.component';
import { DirectiveModule } from '../../../directive/directive.module';

@NgModule({
  declarations: [TreeControlComponent],
  imports: [CommonModule, FormsModule, MatSelectModule, DirectiveModule, MatIconModule],
  exports: [TreeControlComponent]
})
export class TreeControlModule {}
