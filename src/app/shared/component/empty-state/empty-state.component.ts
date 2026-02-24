import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() illustration = '';
  @Input() heading = '';
  @Input() description = '';
  @Input() ctaLabel?: string;
  @Output() ctaClick = new EventEmitter<void>();
}
