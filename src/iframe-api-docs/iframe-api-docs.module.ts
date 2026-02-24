import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IframeApiDocsComponent } from 'src/iframe-api-docs/iframe-api-docs.component';

@NgModule({
  declarations: [IframeApiDocsComponent],
  imports: [BrowserModule, HttpClientModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [IframeApiDocsComponent]
})
export class IframeApiDocsModule {}
