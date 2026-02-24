import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'join',
  pure: true
})
export class JoinPipe implements PipeTransform {
  transform<Item>(items: Item[], separator?: string): string {
    return items.join(separator);
  }
}
