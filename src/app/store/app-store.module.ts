import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AlertModule } from 'src/app/store/alert/alert.module';
import { ApplicationModule } from 'src/app/store/application/application.module';
import { AuthModule } from 'src/app/store/auth/auth.module';
import { ConfigModule } from 'src/app/store/config/config.module';
import { DownloadTaskModule } from 'src/app/store/download-task/download-task.module';
import { IframeModule } from 'src/app/store/iframe/iframe.module';
import { NotificationModule } from 'src/app/store/notification/notification.module';
import { WebSocketModule } from 'src/app/store/web-socket/web-socket.module';
import { environment } from 'src/environments/environment';
import { CommonObjectsModule } from './common-objects/common-objects.module';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot(
      {},
      {
        runtimeChecks: {
          strictStateSerializability: false,
          strictActionSerializability: false,
          strictStateImmutability: true,
          strictActionImmutability: true,
          strictActionWithinNgZone: true,
          strictActionTypeUniqueness: true
        }
      }
    ),
    EffectsModule.forRoot([]),
    environment.production ? [] : StoreDevtoolsModule.instrument(),

    AlertModule,
    ApplicationModule,
    AuthModule,
    ConfigModule,
    DownloadTaskModule,
    CommonObjectsModule,
    IframeModule,
    NotificationModule,
    WebSocketModule
  ]
})
export class AppStoreModule {}
