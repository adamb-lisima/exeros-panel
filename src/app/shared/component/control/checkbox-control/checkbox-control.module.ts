import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CheckboxControlComponent } from 'src/app/shared/component/control/checkbox-control/checkbox-control.component';

@NgModule({
  declarations: [CheckboxControlComponent],
  imports: [CommonModule, FormsModule, MatCheckboxModule],
  exports: [CheckboxControlComponent]
})
export class CheckboxControlModule {}
