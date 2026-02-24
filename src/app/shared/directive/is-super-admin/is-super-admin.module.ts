import { NgModule } from '@angular/core';
import { IsSuperAdminDirective } from './is-super-admin.directive';

@NgModule({
  declarations: [IsSuperAdminDirective],
  exports: [IsSuperAdminDirective]
})
export class IsSuperAdminModule {}
