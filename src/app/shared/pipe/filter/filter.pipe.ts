import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform<Value>(values: Value[] | undefined | null, filter: Value[keyof Value] | unknown, key?: keyof Value): Value[] {
    if (!values) {
      return [];
    }
    if (!filter) {
      return values;
    }
    return key ? values.filter(value => value[key] === filter) : values.filter(value => value === filter);
  }
}
