import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ComponentModule } from 'src/app/shared/component/component.module';
import { DirectiveModule } from 'src/app/shared/directive/directive.module';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';

@NgModule({
  exports: [ReactiveFormsModule, RouterModule, CommonModule, ComponentModule, DirectiveModule, PipeModule, MatTooltipModule]
})
export class SharedModule {}
