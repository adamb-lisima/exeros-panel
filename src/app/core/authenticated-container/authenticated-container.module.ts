import { CdkMenuModule } from '@angular/cdk/menu';
import { NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AuthenticatedContainerComponent } from 'src/app/core/authenticated-container/authenticated-container.component';
import { NavigationBarLinkComponent } from 'src/app/core/authenticated-container/navigation-bar/navigation-bar-link/navigation-bar-link.component';
import { NavigationBarUserComponent } from 'src/app/core/authenticated-container/navigation-bar/navigation-bar-user/navigation-bar-user.component';
import { NavigationBarComponent } from 'src/app/core/authenticated-container/navigation-bar/navigation-bar.component';
import { TopBarDownloadTaskDialogComponent } from 'src/app/core/authenticated-container/top-bar/top-bar-download-task/top-bar-download-task-dialog/top-bar-download-task-dialog.component';
import { TopBarDownloadTaskComponent } from 'src/app/core/authenticated-container/top-bar/top-bar-download-task/top-bar-download-task.component';
import { TopBarNotificationComponent } from 'src/app/core/authenticated-container/top-bar/top-bar-notification/top-bar-notification.component';
import { TopBarComponent } from 'src/app/core/authenticated-container/top-bar/top-bar.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavigationBarVersionDialogComponent } from './navigation-bar/navigation-bar-version-dialog/navigation-bar-version-dialog.component';

@NgModule({
  declarations: [AuthenticatedContainerComponent, NavigationBarComponent, NavigationBarLinkComponent, NavigationBarUserComponent, TopBarComponent, TopBarNotificationComponent, TopBarDownloadTaskComponent, TopBarDownloadTaskDialogComponent, NavigationBarVersionDialogComponent],
  imports: [SharedModule, CdkMenuModule, NgOptimizedImage],
  exports: [AuthenticatedContainerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AuthenticatedContainerModule {}
