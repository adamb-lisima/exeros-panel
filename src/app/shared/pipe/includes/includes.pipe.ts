import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes',
  pure: true
})
export class IncludesPipe implements PipeTransform {
  transform(items: string, value: string): boolean {
    return items.includes(value);
  }
}
