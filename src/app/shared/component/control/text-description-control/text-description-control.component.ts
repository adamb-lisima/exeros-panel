import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlComponent } from '../control.component';

@Component({
  selector: 'app-text-description-control',
  templateUrl: './text-description-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: TextDescriptionControlComponent }]
})
export class TextDescriptionControlComponent extends ControlComponent<string> {
  @Input() rows = 1;
  @Input() showHintSpace = true;
  @Input() error: boolean = false;
  @Input() errorMessage = '';
  @Input() prefixIcon?: string;
}
