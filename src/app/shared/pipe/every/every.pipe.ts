import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'every'
})
export class EveryPipe implements PipeTransform {
  transform<Item>(items: Item[] | null, key: keyof Item, value: Item[typeof key] | undefined | null): boolean {
    return !!items?.every(item => item[key] === value);
  }
}
