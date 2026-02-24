import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstCharacter'
})
export class FirstCharacterPipe implements PipeTransform {
  transform(value?: string): string {
    return (
      value
        ?.split(' ')
        .map(value => value.charAt(0))
        .join('') ?? ''
    );
  }
}
