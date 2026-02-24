import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'find',
  pure: true
})
export class FindPipe implements PipeTransform {
  transform<Item>(items: Item[] | null, key: keyof Item, value: Item[typeof key] | undefined | null): Item | undefined {
    return items?.find(item => item[key] === value);
  }
}
