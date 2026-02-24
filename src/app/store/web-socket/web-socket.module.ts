import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { WEB_SOCKET_FEATURE_KEY, webSocketReducer } from 'src/app/store/web-socket/web-socket.reducer';

@NgModule({
  imports: [StoreModule.forFeature(WEB_SOCKET_FEATURE_KEY, webSocketReducer)]
})
export class WebSocketModule {}
