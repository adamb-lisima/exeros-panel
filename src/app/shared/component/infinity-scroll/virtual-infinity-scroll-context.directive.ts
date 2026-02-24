import { Directive, Input } from '@angular/core';
import { VirtualInfinityScrollContext } from './virtual-infinity-scroll.component';

@Directive({
  selector: 'ng-template[appVirtualInfinityScrollContext]'
})
export class VirtualInfinityScrollContextDirective<T> {
  @Input('appVirtualInfinityScrollContext') items?: T[] | null;

  static ngTemplateContextGuard<TContext>(_: VirtualInfinityScrollContextDirective<TContext>, ctx: unknown): ctx is VirtualInfinityScrollContext<TContext> {
    return true;
  }
}
