import { Directive, Host, Input } from '@angular/core';
import { RxFor } from '@rx-angular/template/for';
import { Observable } from 'rxjs';

@Directive({
  selector: '[rxForTrackByField]'
})
export class RxForTrackByFieldDirective<T> {
  @Input() rxForOf!: Observable<T[]> | null;
  @Input() rxForTrackByField!: keyof T;

  constructor(@Host() rxFor: RxFor<T>) {
    rxFor.trackBy = (_, item: T): T[keyof T] => item[this.rxForTrackByField];
  }
}
