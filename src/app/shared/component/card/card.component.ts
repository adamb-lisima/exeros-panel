import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() variant: 'default' | 'metric' | 'chart' | 'media' = 'default';
  @Input() loading = false;

  get skeletonVariant(): 'card' | 'chart' {
    return this.variant === 'chart' ? 'chart' : 'card';
  }
}
