import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlComponent } from 'src/app/shared/component/control/control.component';

@Component({
  selector: 'app-checkbox-control',
  templateUrl: './checkbox-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: CheckboxControlComponent }]
})
export class CheckboxControlComponent extends ControlComponent<boolean> {
  @Input() labelPosition: 'after' | 'before' = 'after';
  @Input() disabled = false;
}
