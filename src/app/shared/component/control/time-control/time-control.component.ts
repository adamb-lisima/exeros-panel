import { Component } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlComponent } from 'src/app/shared/component/control/control.component';

@Component({
  selector: 'app-time-control',
  templateUrl: './time-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: TimeControlComponent }]
})
export class TimeControlComponent extends ControlComponent<string> {}
