import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'contains',
  pure: true
})
export class ContainsPipe implements PipeTransform {
  transform<Item>(items: Item[], value: Item): boolean {
    return items.includes(value);
  }
}
