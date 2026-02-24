import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { UnauthorizedGuard } from 'src/app/guard/unauthorized.guard';
import { ResetPasswordTokenComponent } from 'src/app/screen/reset-password-token/reset-password-token.component';

export const ResetPasswordTokenRouting: Routes = [
  {
    path: RouteConst.resetPasswordToken,
    canActivate: [UnauthorizedGuard],
    component: ResetPasswordTokenComponent
  }
];
