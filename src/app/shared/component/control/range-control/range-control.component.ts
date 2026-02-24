import { AfterViewInit, Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateTime } from 'luxon';
import DateConst from 'src/app/const/date';
import { ControlComponent } from 'src/app/shared/component/control/control.component';

@Component({
  selector: 'app-range-control',
  templateUrl: './range-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: RangeControlComponent }]
})
export class RangeControlComponent extends ControlComponent<(DateTime | string)[]> implements AfterViewInit {
  from?: Date;
  to?: Date;
  @Input() format = DateConst.serverDateTimeFormat;

  ngAfterViewInit(): void {
    const [from, to] = this.value ?? [];
    if (from && to) {
      this.from = DateTime.fromFormat(from as string, this.format).toJSDate();
      this.to = DateTime.fromFormat(to as string, this.format).toJSDate();
    }
  }

  override handleModelChange([from, to]: DateTime[]): void {
    if ((from && !to) || (!from && to)) {
      return;
    }
    if (!(from instanceof DateTime)) {
      from = DateTime.fromJSDate(new Date(from));
    }
    if (!(to instanceof DateTime)) {
      to = DateTime.fromJSDate(new Date(to));
    }
    super.handleModelChange(from && to ? [from.toFormat(this.format), to.set({ hour: 23, minute: 59, second: 59 }).toFormat(this.format)] : []);
  }
}
