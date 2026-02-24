import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/shared/component/button/button.module';
import { TextControlModule } from '../../control/text-control/text-control.module';
import { TextareaControlModule } from '../../control/textarea-control/textarea-control.module';
import { MfaInactivityDialogComponent } from './mfa-inactivity-dialog.component';

@NgModule({
  declarations: [MfaInactivityDialogComponent],
  imports: [CommonModule, ButtonModule, TextareaControlModule, FormsModule, TextControlModule]
})
export class MfaInactivityDialogModule {}
