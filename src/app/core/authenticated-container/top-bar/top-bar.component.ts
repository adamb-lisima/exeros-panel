import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AccessGroup } from '../../../screen/settings/settings.model';
import { AppState } from '../../../store/app-store.model';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarComponent {
  notificationViewerAccess = AccessGroup.NOTIFICATIONS_VIEWER;
  taskListViewerAccess = AccessGroup.TASK_LIST_VIEWER;

  constructor(private readonly store: Store<AppState>) {}
}
