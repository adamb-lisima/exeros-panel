import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanize',
  pure: true
})
export class HumanizePipe implements PipeTransform {
  transform(value: string | null): string {
    return value
      ? value
          .toLowerCase()
          .split('_')
          .map(item => `${item.charAt(0).toUpperCase()}${item.slice(1)}`)
          .join(' ')
      : '';
  }
}
