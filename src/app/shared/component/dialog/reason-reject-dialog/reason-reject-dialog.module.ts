import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/shared/component/button/button.module';
import { ControlModule } from '../../control/control.module';
import { TextareaControlModule } from '../../control/textarea-control/textarea-control.module';
import { ReasonRejectDialogComponent } from './reason-reject-dialog.component';

@NgModule({
  declarations: [ReasonRejectDialogComponent],
  imports: [CommonModule, ButtonModule, TextareaControlModule, FormsModule, ControlModule]
})
export class ReasonRejectDialogModule {}
