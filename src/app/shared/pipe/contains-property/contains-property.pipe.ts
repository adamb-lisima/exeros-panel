import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'containsProperty',
  pure: true
})
export class ContainsPropertyPipe implements PipeTransform {
  transform<Item, Key extends keyof Item>(items: Item[], field: Key, value: Item[Key]): boolean {
    return items.map(value => value[field]).includes(value);
  }
}
