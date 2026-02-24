import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ConfigSelectors } from '../../../../store/config/config.selectors';

@Component({
  selector: 'app-navigation-bar-version-dialog',
  templateUrl: './navigation-bar-version-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationBarVersionDialogComponent {
  configData$ = this.store.select(ConfigSelectors.data);

  constructor(private readonly store: Store) {}
}
