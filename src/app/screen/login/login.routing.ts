import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { UnauthorizedGuard } from 'src/app/guard/unauthorized.guard';
import { LoginComponent } from 'src/app/screen/login/login.component';

export const LoginRouting: Routes = [
  {
    path: RouteConst.login,
    canActivate: [UnauthorizedGuard],
    component: LoginComponent
  }
];
