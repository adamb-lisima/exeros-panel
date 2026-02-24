import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

interface PaginatorInfo {
  page: number;
  perPage: number;
  totalItems: number;
}

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent {
  private readonly pageOffset = 2;
  readonly DOTS = '...';
  page = 0;
  pageAsText = '';
  pages?: number;
  totalItems?: number;
  pagesToShow: string[] = [];
  isFirstPage = false;
  isLastPage = false;

  @Output() pageChange = new EventEmitter<number>();

  @Input() set info(info: PaginatorInfo) {
    this.page = info.page;
    this.pageAsText = info.page.toString();
    this.pages = Math.ceil(info.totalItems / info.perPage);
    this.totalItems = info.totalItems;
    this.pagesToShow = this.preparePageToShow(this.page, this.pages);
    this.isFirstPage = this.page === 1;
    this.isLastPage = this.page === this.pages || this.pages <= 1;
  }

  previousPage(): void {
    this.pageChange.emit(this.page - 1);
  }

  nextPage(): void {
    this.pageChange.emit(this.page + 1);
  }

  handlePageChangeClick(page: string): void {
    this.pageChange.emit(Number(page));
  }

  private preparePageToShow(page: number, pages: number): string[] {
    const start = page - this.pageOffset;
    const end = page + this.pageOffset;

    const pageNumbers = this.getPageNumbers(start, end, pages);

    const pageToShow = [];
    pageToShow.push(this.addFirstPageIfNeed(pageNumbers));
    pageToShow.push(this.addDotsBeforeIfNeeded(start));
    pageToShow.push(...pageNumbers);
    pageToShow.push(this.addDotsAfterIfNeeded(end, pages));
    pageToShow.push(this.addLastPageIfNeeded(pageNumbers, pages));

    return pageToShow.filter((page): page is string => page != null);
  }

  private addLastPageIfNeeded(pageNumbers: string[], pages: number): string | null {
    return pages > 1 && !pageNumbers.includes(pages.toString()) ? pages.toString() : null;
  }

  private addDotsAfterIfNeeded(end: number, pages: number): string | null {
    const showDotsAfter = end < pages - 1;
    return showDotsAfter ? this.DOTS : null;
  }

  private addDotsBeforeIfNeeded(start: number): string | null {
    const showDotsBefore = start > 2;
    return showDotsBefore ? this.DOTS : null;
  }

  private addFirstPageIfNeed(pageNumbers: string[]): string | null {
    return !pageNumbers.includes('1') ? '1' : null;
  }

  private getPageNumbers(start: number, end: number, pages: number): string[] {
    const firstNumber = start < 1 ? 1 : start;
    const lastNumber = end > pages ? pages : end;

    const pageNumbers = [];
    for (let i = firstNumber; i <= lastNumber; i++) {
      pageNumbers.push(i.toString());
    }
    return pageNumbers;
  }
}
