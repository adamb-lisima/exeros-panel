import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AuthorizationInterceptor } from 'src/app/core/interceptor/authorization/authorization.interceptor';
import { ErrorInterceptor } from 'src/app/core/interceptor/error/error.interceptor';
import { FleetAuthInterceptor } from 'src/app/core/interceptor/fleet-auth/fleet-auth.interceptor';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: FleetAuthInterceptor, multi: true }
  ]
})
export class InterceptorModule {}
