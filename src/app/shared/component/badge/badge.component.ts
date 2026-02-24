import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  template: `
    <span class="badge" [class]="'badge--' + status">
      <span class="badge__dot"></span>
      <span class="badge__label">{{ label }}</span>
    </span>
  `,
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  @Input() status: 'online' | 'offline' | 'warning' = 'offline';
  @Input() label = '';
}
