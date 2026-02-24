import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlComponent } from 'src/app/shared/component/control/control.component';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';

type TempSelectControl = SelectControl & { hidden?: boolean };

type Value = string | number | (string | number)[];

@Component({
  selector: 'app-select-control-show-filter',
  templateUrl: './select-control-show-filter.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: SelectControlShowFilterComponent }]
})
export class SelectControlShowFilterComponent extends ControlComponent<Value> implements OnInit, OnChanges, AfterViewInit {
  search = '';
  tempOptions: TempSelectControl[] = [];
  selectedOptions: TempSelectControl[] = [];
  allSelected = false;
  @ViewChild('searchInput', { static: true }) searchInput?: ElementRef<HTMLInputElement>;
  @Input() options: SelectControl[] = [];
  @Input() clearable = false;
  @Input() multiple = false;
  @Input() prefixIcon?: 'sort' | 'search';
  @Input() showSearchInput = true;
  @Input() showHintSpace = true;
  @Input() disabled: boolean = false;
  @Input() selectAll: boolean = false;
  @Input() mode?: string;
  @Input() customDisable?: string;
  @Input() oneOption = false;
  @Input() firstFive = false;
  get canClear(): boolean {
    return this.clearable && !!(Array.isArray(this.value) ? this.value.length : this.value);
  }

  get selectedCount(): number {
    if (this.multiple && Array.isArray(this.value)) {
      return this.value.length;
    }
    return this.value != null ? 1 : 0;
  }

  ngOnInit(): void {
    this.tempOptions = this.options;
    if (this.oneOption && !this.value) {
      this.value = this.options.length ? [this.options[0].value] : [];
    }
    if (this.firstFive && !this.value) {
      this.value = this.options.length ? [this.options[0].value] : [];
    } else if (this.multiple && (!this.value || this.value === 0)) {
      this.value = this.options.map(option => option.value);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value && changes.value.currentValue) {
      this.markIfAllSelected();
      this.updateSelectedOptions();
    }

    if (changes.options) {
      this.tempOptions = this.options;
      this.search = '';
      this.markIfAllSelected();
      this.updateSelectedOptions();
    }
  }

  ngAfterViewInit(): void {
    if (this.multiple && this.selectAll && this.mode === 'create') {
      this.handleSelectDeselectAllClick();
    }
  }

  override handleModelChange(value: Value): void {
    super.handleModelChange(value);
    this.markIfAllSelected();
    this.updateSelectedOptions();
  }

  handleSearchChange(value: string): void {
    const filter = value.toLowerCase();
    this.tempOptions = this.options.map(option => ({
      ...option,
      hidden: !option.label.toLowerCase().includes(filter)
    }));
  }

  handleOpenedChange(opened: boolean): void {
    this.markIfAllSelected();
    if (opened) {
      this.searchInput?.nativeElement.focus();
    } else {
      this.search = '';
      this.tempOptions = this.options;
    }
  }

  handleClearClick(event: MouseEvent): void {
    this.handleModelChange(this.multiple ? [] : '');
    event.stopPropagation();
  }

  handleSelectDeselectAllClick(): void {
    this.handleModelChange(this.allSelected ? [] : this.options.map(option => option.value));
  }

  private updateSelectedOptions(): void {
    if (Array.isArray(this.value)) {
      this.selectedOptions = this.options.filter(option => (this.value as Array<string | number>).includes(option.value));
    } else {
      this.selectedOptions = [];
    }
  }

  private markIfAllSelected(): void {
    const array = Array.isArray(this.value) ? this.value : [this.value];
    this.allSelected = this.options.every(option => array.includes(option.value));
  }
}
