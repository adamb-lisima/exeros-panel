import { CommonModule } from '@angular/common';
import { HttpClientJsonpModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapComponent } from 'src/app/shared/component/map/map.component';
import { DirectiveModule } from 'src/app/shared/directive/directive.module';

@NgModule({
  declarations: [MapComponent],
  imports: [CommonModule, GoogleMapsModule, HttpClientJsonpModule, DirectiveModule],
  exports: [MapComponent]
})
export class MapModule {}
