import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TextareaControlComponent } from './textarea-control.component';

@NgModule({
  declarations: [TextareaControlComponent],
  imports: [CommonModule, FormsModule, MatInputModule],
  exports: [TextareaControlComponent]
})
export class TextareaControlModule {}
