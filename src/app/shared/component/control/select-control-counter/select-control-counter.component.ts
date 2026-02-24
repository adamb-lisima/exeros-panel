import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlComponent } from 'src/app/shared/component/control/control.component';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';

type TempSelectControl = SelectControl & { hidden?: boolean };

type Value = string | number | (string | number)[];

@Component({
  selector: 'app-select-control-counter',
  templateUrl: './select-control-counter.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: SelectControlCounterComponent }],
  styles: [
    `
      ::ng-deep .wide-select .mat-option {
        min-width: 500px !important;
      }
    `
  ]
})
export class SelectControlCounterComponent extends ControlComponent<Value> implements OnInit, OnChanges, AfterViewInit {
  search = '';
  tempOptions: TempSelectControl[] = [];
  allSelected = false;
  selectedCount: number = 0;
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

  get canClear(): boolean {
    return this.clearable && !!(Array.isArray(this.value) ? this.value.length : this.value);
  }

  ngOnInit(): void {
    this.tempOptions = this.options;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
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
    this.updateSelectedCount();
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

  private markIfAllSelected(): void {
    const array = Array.isArray(this.value) ? this.value : [this.value];
    this.allSelected = this.options.every(option => array.includes(option.value));
  }

  private updateSelectedCount(): void {
    if (Array.isArray(this.value)) {
      this.selectedCount = this.value.length;
    } else {
      this.selectedCount = 0;
    }
  }
}
