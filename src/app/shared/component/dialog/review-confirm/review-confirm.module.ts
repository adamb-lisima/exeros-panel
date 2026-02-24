import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/shared/component/button/button.module';
import { TextareaControlModule } from '../../control/textarea-control/textarea-control.module';
import { ReviewConfirmComponent } from './review-confirm.component';

@NgModule({
  declarations: [ReviewConfirmComponent],
  imports: [CommonModule, ButtonModule, TextareaControlModule, FormsModule]
})
export class ReviewConfirmModule {}
