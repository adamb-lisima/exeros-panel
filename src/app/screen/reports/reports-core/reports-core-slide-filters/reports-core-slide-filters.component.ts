import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-reports-core-slide-filters',
  templateUrl: './reports-core-slide-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreSlideFiltersComponent {
  @Input() title = 'Filters';
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() clearClick = new EventEmitter<void>();
  @Output() applyClick = new EventEmitter<void>();

  toggleFilters(): void {
    this.isOpenChange.emit(!this.isOpen);
  }

  handleClear(): void {
    this.clearClick.emit();
  }

  handleApply(): void {
    this.applyClick.emit();
  }
}
