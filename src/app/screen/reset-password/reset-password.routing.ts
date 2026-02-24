import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { UnauthorizedGuard } from 'src/app/guard/unauthorized.guard';
import { ResetPasswordComponent } from 'src/app/screen/reset-password/reset-password.component';

export const ResetPasswordRouting: Routes = [
  {
    path: RouteConst.resetPassword,
    canActivate: [UnauthorizedGuard],
    component: ResetPasswordComponent
  }
];
