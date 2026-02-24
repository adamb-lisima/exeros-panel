import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-navigation-bar-user',
  templateUrl: './navigation-bar-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationBarUserComponent {
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);

  @Input() isCollapsed = false;
  constructor(private readonly store: Store) {}
}
