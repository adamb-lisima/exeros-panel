import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import DateConst from '../../../const/date';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  transform(value: unknown, fromFormat: keyof typeof DateConst | 'milis' | 'iso' | 'jsDate', toFormat: keyof typeof DateConst): string {
    let dateTime: DateTime;
    if (fromFormat === 'milis') {
      dateTime = DateTime.fromMillis(Number(value));
    } else if (fromFormat === 'iso') {
      dateTime = DateTime.fromISO(String(value));
    } else if (fromFormat === 'jsDate') {
      dateTime = DateTime.fromJSDate(value as Date);
    } else {
      dateTime = DateTime.fromFormat(String(value), DateConst[fromFormat]);
    }
    return dateTime.toFormat(DateConst[toFormat]);
  }
}
