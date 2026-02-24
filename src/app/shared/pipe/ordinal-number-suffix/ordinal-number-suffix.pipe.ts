import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinalNumberSuffix'
})
export class OrdinalNumberSuffixPipe implements PipeTransform {
  transform(value: number): string {
    if (value > 3 && value < 21) {
      return 'th';
    }
    switch (value % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }
}
