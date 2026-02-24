import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, ContentChild, EventEmitter, HostBinding, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { PageMeta } from 'src/app/model/page.model';

export interface VirtualInfinityScrollContext<Item> {
  $implicit: Item;
  appVirtualInfinityScrollContext: Item;
}

@Component({
  selector: 'app-virtual-infinity-scroll',
  templateUrl: './virtual-infinity-scroll.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualInfinityScrollComponent<Item> {
  _pageMeta?: PageMeta | null;
  @ViewChild('listElement') listElement?: CdkVirtualScrollViewport;
  @ContentChild('item') listItemRef!: TemplateRef<VirtualInfinityScrollContext<Item>>;
  @HostBinding('class.h-full') heightFull = true;
  @HostBinding('class.w-full') weightFull = true;
  @Output() nextPageRequest = new EventEmitter<number>();
  @Input() itemSize = 184;
  @Input() items?: Item[] | null;
  @Input() infiniteMaxBuffer = false;
  @Input() keyofItem?: keyof Item;
  @Input() loading: boolean | null = false;
  @Input() listGap = false;
  @Input() listDivider = false;
  private readonly audio: HTMLAudioElement;
  private lastTotalItems: number | undefined;

  trackBy = (index: number, item: Item): Item[keyof Item] | number => (this.keyofItem ? item[this.keyofItem] : index);

  constructor() {
    this.audio = new Audio();
    this.audio.src = 'assets/event-sound.wav';

    this.lastTotalItems = undefined;
  }

  @Input() set pageMeta(v: PageMeta | undefined | null) {
    const isTheSamePage = this._pageMeta?.current_page === v?.current_page;
    this._pageMeta = v;

    if ((v?.current_page === 0 || v?.current_page === 1) && !isTheSamePage) {
      this.listElement?.scrollTo({ top: 0 });
    }

    if (v?.fetch_in_background === true && v?.total_items !== this.lastTotalItems) {
      this.audio.play();
    }

    this.lastTotalItems = v?.total_items;
  }

  handleListScroll(viewport: CdkVirtualScrollViewport): void {
    const el = viewport.elementRef.nativeElement;
    const isNearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;

    if (this._pageMeta && !this._pageMeta.last && isNearBottom) {
      if (!this._isRequestingNextPage) {
        this._isRequestingNextPage = true;
        this.nextPageRequest.emit(this._pageMeta.current_page + 1);

        setTimeout(() => {
          this._isRequestingNextPage = false;
        }, 300);
      }
    }
  }

  private _isRequestingNextPage = false;
}
