import { CdkMenuModule } from '@angular/cdk/menu';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { EventsCoreComponent } from './events-core/events-core.component';

@NgModule({
  declarations: [EventsCoreComponent],
  imports: [SharedModule, CdkMenuModule, FormsModule]
})
export class EventsIframeModule {}
