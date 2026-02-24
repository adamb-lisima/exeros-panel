import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from 'src/app/shared/shared.module';
import { GuideContentComponent } from './guide-content/guide-content.component';
import { GuideCoreComponent } from './guide-core/guide-core.component';
import { GuideSidenavComponent } from './guide-sidenav/guide-sidenav.component';
import { GuideTopComponent } from './guide-top/guide-top.component';
import { GuideEffects } from './guide.effects';
import { GUIDE_FEATURE_KEY, guideReducer } from './guide.reducer';
import { GuideService } from './guide.service';

@NgModule({
  declarations: [GuideCoreComponent, GuideContentComponent, GuideSidenavComponent, GuideTopComponent],
  imports: [StoreModule.forFeature(GUIDE_FEATURE_KEY, guideReducer), EffectsModule.forFeature([GuideEffects]), SharedModule, FormsModule, MatProgressSpinnerModule],
  providers: [GuideService]
})
export class GuideModule {}
