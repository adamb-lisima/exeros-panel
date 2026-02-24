import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthenticated-container',
  templateUrl: './unauthenticated-container.component.html',
  styleUrls: ['./unauthenticated-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnauthenticatedContainerComponent {
  constructor(private readonly router: Router) {}

  isWideLayoutRoute(): boolean {
    return this.router.url.includes('/clip/');
  }
}
