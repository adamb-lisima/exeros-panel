import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateTime } from 'luxon';
import DateConst from 'src/app/const/date';
import { ControlComponent } from 'src/app/shared/component/control/control.component';

@Component({
  selector: 'app-date-control',
  templateUrl: './date-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: DateControlComponent }]
})
export class DateControlComponent extends ControlComponent<DateTime | string> {
  @Input() format = DateConst.serverDateFormat;

  override handleModelChange(value: DateTime): void {
    super.handleModelChange(value ? value.toFormat(this.format) : value);
  }
}
