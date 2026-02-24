import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-count-badge',
  template: `<span class="count-badge">{{ count }}</span>`,
  styleUrls: ['./count-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountBadgeComponent {
  @Input() count: number | string = 0;
}
