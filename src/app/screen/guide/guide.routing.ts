import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { GuideContentComponent } from './guide-content/guide-content.component';
import { GuideCoreComponent } from './guide-core/guide-core.component';
import { GuideGuard } from './guide.guard';

export const GuideRouting: Routes = [
  {
    path: RouteConst.guide,
    component: GuideCoreComponent,
    canActivate: [GuideGuard],
    children: [
      { path: '', component: GuideContentComponent },
      { path: ':slug', component: GuideContentComponent }
    ]
  }
];
