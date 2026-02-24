import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ParentComponent } from 'src/parent/parent.component';

@NgModule({
  declarations: [ParentComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [ParentComponent]
})
export class ParentModule {}
