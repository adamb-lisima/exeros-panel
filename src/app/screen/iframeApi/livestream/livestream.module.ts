import { CdkMenuModule } from '@angular/cdk/menu';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'src/app/shared/shared.module';
import { LivestreamCoreComponent } from './livestream-core/livestream-core.component';

@NgModule({
  declarations: [LivestreamCoreComponent],
  imports: [SharedModule, CdkMenuModule, FormsModule, MatFormFieldModule, MatInputModule]
})
export class LivestreamModule {}
