import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SelectControlComponent } from 'src/app/shared/component/control/select-control/select-control.component';
import { DirectiveModule } from '../../../directive/directive.module';

@NgModule({
  declarations: [SelectControlComponent],
  imports: [CommonModule, FormsModule, DirectiveModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule, MatCheckboxModule],
  exports: [SelectControlComponent]
})
export class SelectControlModule {}
