import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TextControlComponent } from 'src/app/shared/component/control/text-control/text-control.component';

@NgModule({
  declarations: [TextControlComponent],
  imports: [CommonModule, FormsModule, MatInputModule, MatSelectModule, MatIconModule],
  exports: [TextControlComponent]
})
export class TextControlModule {}
