import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPageComponent {
  @Input() errorCode: '404' | '500' = '500';
  @Input() heading = '';
  @Input() description = '';
  @Output() retry = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();

  get defaultHeading(): string {
    if (this.heading) return this.heading;
    return this.errorCode === '404'
      ? 'Page not found'
      : 'Something went wrong';
  }

  get defaultDescription(): string {
    if (this.description) return this.description;
    return this.errorCode === '404'
      ? 'The page you are looking for does not exist or has been moved.'
      : 'An unexpected error occurred. Please try again or return to the dashboard.';
  }

  get illustrationPath(): string {
    return this.errorCode === '404'
      ? 'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
  }
}
