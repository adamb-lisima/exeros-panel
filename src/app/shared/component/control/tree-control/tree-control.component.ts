import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ControlComponent } from 'src/app/shared/component/control/control.component';
import { TreeControl } from 'src/app/shared/component/control/tree-control/tree-control.model';

@Component({
  selector: 'app-tree-control',
  templateUrl: './tree-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: TreeControlComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeControlComponent extends ControlComponent<string | number | (string | number)[]> implements OnInit, OnChanges, OnDestroy {
  private readonly searchSubject = new BehaviorSubject<string>('');
  private readonly hiddenItemsMap = new Map<string | number, boolean>();
  private readonly subscription = new Subscription();

  @ViewChild('searchInput', { static: true }) searchInput?: ElementRef<HTMLInputElement>;
  @Input() options: TreeControl[] = [];
  @Input() multiple = false;
  @Input() prefixIcon?: 'search';
  @Input() showHintSpace = true;

  private readonly destroy$ = new Subject<void>();

  searchTerm$ = this.searchSubject.asObservable().pipe(debounceTime(150), distinctUntilChanged());

  constructor(private readonly cdr: ChangeDetectorRef) {
    super();
    this.setupSearchSubscription();
  }

  get search(): string {
    return this.searchSubject.value;
  }

  set search(value: string) {
    this.searchSubject.next(value);
  }

  override writeValue(value: string | number | (string | number)[]): void {
    if (value !== undefined) {
      this.value = value;
      this.cdr.markForCheck();
    }
  }

  isSelected(itemValue: string | number): boolean {
    if (this.multiple && Array.isArray(this.value)) {
      return this.value.includes(itemValue);
    }
    return this.value === itemValue;
  }

  override handleModelChange(value: string | number | (string | number)[]): void {
    super.handleModelChange(value);
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    this.updateVisibilityMap(this.options);
    if (this.value !== null) {
      this.cdr.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      this.updateVisibilityMap(this.options);
      this.search = '';
      if (this.value === undefined || this.value === null) {
        this.handleModelChange(this.multiple ? [] : '');
      }

      this.cdr.markForCheck();
    }
  }

  private setupSearchSubscription(): void {
    const searchSubscription = this.searchTerm$.pipe(takeUntil(this.destroy$)).subscribe({
      next: term => {
        this.updateVisibilityMap(this.options, term.toLowerCase());
        this.cdr.markForCheck();
      },
      error: (err: unknown) => console.error('Error in search term subscription:', err)
    });

    this.subscription.add(searchSubscription);
  }

  isItemVisible(value: string | number): boolean {
    return !this.hiddenItemsMap.get(value);
  }

  handleSearchChange(value: string): void {
    this.search = value;
  }

  handleOpenedChange(opened: boolean): void {
    if (opened) {
      setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
    } else {
      this.search = '';
      this.updateVisibilityMap(this.options);
    }
    this.cdr.markForCheck();
  }

  private updateVisibilityMap(options: TreeControl[], filter: string = ''): void {
    const processNode = (node: TreeControl) => {
      const isVisible = filter === '' || node.label.toLowerCase().includes(filter);
      this.hiddenItemsMap.set(node.value, !isVisible);

      if (node.children?.length) {
        node.children.forEach(processNode);
      }
    };

    this.hiddenItemsMap.clear();
    options.forEach(processNode);
  }

  trackByValue(_: number, item: TreeControl): string | number {
    return item.value;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
