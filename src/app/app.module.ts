import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';
import { AppComponent } from 'src/app/app.component';
import { CoreModule } from 'src/app/core/core.module';
import { ScreenModule } from 'src/app/screen/screen.module';
import { ThemeService } from 'src/app/service/theme/theme.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppStoreModule } from 'src/app/store/app-store.module';
import { AppQueryParams } from './app.model';
import { CustomDateAdapter } from './shared/component/control/calendar/custom-date-adapter';
import { AuthActions } from './store/auth/auth.actions';
import { GlobalErrorHandler } from './store/global-error-handler';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule, CoreModule, SharedModule, ScreenModule, AppStoreModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (themeService: ThemeService) => () => themeService.loadTheme(),
      deps: [ThemeService],
      multi: true
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: APP_INITIALIZER,
      useFactory: (store: Store) => () => {
        const split = location.href.split('#');
        if (split.length < 2) {
          return;
        }
        const [, query] = split[1].split('?');
        const params: AppQueryParams = Object.fromEntries(new URLSearchParams(query));
        if (params.token) {
          store.dispatch(AuthActions.setAccessToken({ accessToken: params.token }));
        }
      },
      deps: [Store],
      multi: true
    },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
