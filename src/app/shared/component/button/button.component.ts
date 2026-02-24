import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'destructive'
    | 'icon-only' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Output() buttonClick = new EventEmitter<void>();

  handleButtonClick(): void {
    if (!this.loading && !this.disabled) {
      this.buttonClick.emit();
    }
  }
}
