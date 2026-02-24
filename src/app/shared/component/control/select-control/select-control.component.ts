import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlComponent } from 'src/app/shared/component/control/control.component';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';

type TempSelectControl = SelectControl & { hidden?: boolean };

type Value = string | number | (string | number)[];

@Component({
  selector: 'app-select-control',
  templateUrl: './select-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: SelectControlComponent }]
})
export class SelectControlComponent extends ControlComponent<Value> implements OnInit, OnChanges, AfterViewInit {
  search = '';
  tempOptions: TempSelectControl[] = [];
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
  @Input() error: boolean = false;
  @Input() errorText = '';
  @Input() errorMessage = '';

  get canClear(): boolean {
    return this.clearable && !!(Array.isArray(this.value) ? this.value.length : this.value);
  }

  ngOnInit(): void {
    this.tempOptions = this.options;
  }

  private allValues: (string | number)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      this.allValues = this.options.map(option => option.value);
      this.tempOptions = this.options;
      this.search = '';
      this.handleModelChange(this.multiple ? [] : '');
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
    if (this.allSelected) {
      this.handleModelChange([]);
    } else {
      this.handleModelChange(this.allValues);
    }
  }

  private markIfAllSelected(): void {
    if (!this.options.length) {
      this.allSelected = false;
      return;
    }

    const valueArray = Array.isArray(this.value) ? this.value : [this.value];
    this.allSelected = valueArray.length === this.allValues.length;
  }

  trackByValue(index: number, item: TempSelectControl): string | number {
    return item.value;
  }

  get hasError(): boolean {
    return this.error;
  }

  get displayError(): string {
    return this.errorText || this.errorMessage;
  }
}
