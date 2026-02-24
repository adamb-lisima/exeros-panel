import { NgModule } from '@angular/core';
import { HasPermissionModule } from './has-permission/has-permission.module';
import { IsSuperAdminModule } from './is-super-admin/is-super-admin.module';
import { NgForTrackByFieldModule } from './ng-for-track-by-field/ng-for-track-by-field.module';
import { RxForTrackByFieldModule } from './rx-for-track-by-field/rx-for-track-by-field.module';
import { TooltipModule } from './tooltip/tooltip.module';

@NgModule({
  exports: [NgForTrackByFieldModule, HasPermissionModule, IsSuperAdminModule, TooltipModule, RxForTrackByFieldModule]
})
export class DirectiveModule {}
