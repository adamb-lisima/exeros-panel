import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TextDescriptionControlComponent } from './text-description-control.component';

@NgModule({
  declarations: [TextDescriptionControlComponent],
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, TextFieldModule],
  exports: [TextDescriptionControlComponent]
})
export class TextDescriptionControlModule {}
