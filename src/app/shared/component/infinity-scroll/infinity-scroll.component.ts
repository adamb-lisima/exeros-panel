import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PageMeta } from 'src/app/model/page.model';

@Component({
  selector: 'app-infinity-scroll',
  templateUrl: './infinity-scroll.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfinityScrollComponent {
  _pageMeta?: PageMeta;
  @ViewChild('listElement') listElement?: ElementRef<HTMLElement>;
  @Output() nextPageRequest = new EventEmitter<number>();
  @Input() loading: boolean | null = false;
  @Input() transparent = false;
  @Input() listGap = false;
  @Input() listDivider = false;

  @Input() set pageMeta(v: PageMeta) {
    this._pageMeta = v;

    if (v.current_page === 0 || v.current_page === 1) {
      this.listElement?.nativeElement.scrollTo({ top: 0 });
    }
  }

  handleListScroll(el: HTMLElement): void {
    if (this._pageMeta && !this._pageMeta.last && el.scrollHeight - el.scrollTop <= el.clientHeight + 10) {
      this.nextPageRequest.emit(this._pageMeta.current_page + 1);
    }
  }
}
