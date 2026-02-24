import { NgModule } from '@angular/core';
import { SocketIoModule } from 'ngx-socket-io';
import { AlertModule } from 'src/app/core/alert/alert.module';
import { AuthenticatedContainerModule } from 'src/app/core/authenticated-container/authenticated-container.module';
import { InterceptorModule } from 'src/app/core/interceptor/interceptor.module';
import { UnauthenticatedContainerModule } from 'src/app/core/unauthenticated-container/unauthenticated-container.module';

@NgModule({
  exports: [AlertModule, AuthenticatedContainerModule, UnauthenticatedContainerModule, InterceptorModule, SocketIoModule]
})
export class CoreModule {}
