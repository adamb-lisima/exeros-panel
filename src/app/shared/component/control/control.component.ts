import { Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

type OnChange<Value> = (value: Value) => void;
type OnTouched = () => void;

@Component({
  template: ''
})
export abstract class ControlComponent<Value> implements ControlValueAccessor {
  value?: Value | null = null;
  disabled = false;
  onChange: OnChange<Value> = () => null;
  onTouched: OnTouched = () => null;
  @Input() label = '';

  writeValue(value: Value): void {
    this.value = value;
  }

  registerOnChange(onChange: OnChange<Value>) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: OnTouched) {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  handleModelChange(value: Value) {
    this.writeValue(value);
    this.onChange(value);
  }
}
