import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlComponent } from 'src/app/shared/component/control/control.component';

type Type = 'text' | 'password' | 'number';
@Component({
  selector: 'app-text-control',
  templateUrl: './text-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: TextControlComponent }]
})
export class TextControlComponent extends ControlComponent<string> {
  _type: Type = 'text';
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step: number | null = null;
  isPassword = false;
  @Input() showHintSpace = true;
  @Input() error: boolean = false;
  @Input() errorText = '';
  @Input() errorMessage = '';
  @Input() prefixIcon?: 'search';
  @Input() set type(type: Type) {
    this._type = type;
    this.isPassword = type === 'password';
  }

  get hasError(): boolean {
    return this.error;
  }

  get displayError(): string {
    return this.errorText || this.errorMessage;
  }

  handleChanglePasswordVisibilityClick() {
    this._type = this._type === 'password' ? 'text' : 'password';
  }
}
