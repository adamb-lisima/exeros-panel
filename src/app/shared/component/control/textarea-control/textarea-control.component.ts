import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlComponent } from 'src/app/shared/component/control/control.component';

@Component({
  selector: 'app-textarea-control',
  templateUrl: './textarea-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: TextareaControlComponent }]
})
export class TextareaControlComponent extends ControlComponent<string> {
  @Input() rows = 1;
}
