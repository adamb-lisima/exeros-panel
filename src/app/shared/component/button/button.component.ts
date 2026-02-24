import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() disabled = false;
  @Input() type: 'primary' | 'secondary' | 'ternary' | 'quaternary' = 'primary';
  @Output() buttonClick = new EventEmitter<void>();

  handleButtonClick(): void {
    this.buttonClick.emit();
  }
}
