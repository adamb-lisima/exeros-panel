import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import RouteConst from '../../../../const/route';

@Component({
  selector: 'app-navigation-bar-link',
  templateUrl: './navigation-bar-link.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationBarLinkComponent {
  @Input() text = '';
  @Input() link = '';
  @Input() subLinkActive?: string;
  @Input() badge?: string | number | null;
  @Input() isCollapsed = false;
  @Input() isActive: boolean = false;

  shouldBeActive(mainActive: boolean, subActive: boolean): boolean {
    const currentUrl = this.router.url;
    if (this.link === RouteConst.stream) {
      return mainActive || subActive || currentUrl.includes(RouteConst.playbacks);
    }
    return mainActive || subActive;
  }

  constructor(private readonly router: Router) {}
}
