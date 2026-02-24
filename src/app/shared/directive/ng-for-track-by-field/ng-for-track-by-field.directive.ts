import { NgForOf } from '@angular/common';
import { Directive, Host, Input } from '@angular/core';

@Directive({
  selector: '[ngForTrackByField]'
})
export class NgForTrackByFieldDirective<T> {
  @Input() ngForOf!: T[] | null;
  @Input() ngForTrackByField!: keyof T;

  constructor(@Host() ngForOfDir: NgForOf<T>) {
    ngForOfDir.ngForTrackBy = (_, item: T): T[keyof T] => item[this.ngForTrackByField];
  }
}
