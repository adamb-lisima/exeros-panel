import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlComponent } from 'src/app/shared/component/control/control.component';
import { TreeControl } from '../tree-control/tree-control.model';

type TempTreeControl = TreeControl & { hidden?: boolean };

@Component({
  selector: 'app-multiselect-tree',
  templateUrl: './multiselect-tree.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: MultiselectTreeComponent }]
})
export class MultiselectTreeComponent extends ControlComponent<string | string[]> implements OnInit, OnChanges {
  search = '';
  tempOptions: TempTreeControl[] = [];
  @ViewChild('searchInput', { static: true }) searchInput?: ElementRef<HTMLInputElement>;
  @Input() options: TreeControl[] = [];
  @Input() multiple = false;
  @Input() prefixIcon?: 'search';
  @Input() showHintSpace = true;
  @Input() selectChildren: boolean = false;
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

  handleSearchChange(value: string): void {
    this.tempOptions = this.filterOptions(this.options, value.toLowerCase());
  }

  handleOpenedChange(opened: boolean): void {
    if (opened) {
      this.searchInput?.nativeElement.focus();
    } else {
      this.search = '';
      this.tempOptions = this.options;
    }
  }

  private filterOptions(options: TempTreeControl[], filter: string): TempTreeControl[] {
    return options.map(option => ({
      ...option,
      children: option.children ? this.filterOptions(option.children, filter) : undefined,
      hidden: !option.label.toLowerCase().includes(filter)
    }));
  }

  handleModelChange(value: string | string[]): void {
    if (this.multiple && Array.isArray(value)) {
      const selectedValues = new Set<string | number>(value);
      const previousValue = new Set<string | number>(this.value as string[]);

      if (this.selectChildren) {
        value.forEach(val => {
          if (!previousValue.has(val)) {
            this.selectChildrenRecursive(val, selectedValues, true);
          }
        });

        previousValue.forEach(val => {
          if (!selectedValues.has(val)) {
            this.selectChildrenRecursive(val, selectedValues, false);
          }
        });
      }

      this.value = Array.from(selectedValues) as string[];
    } else if (typeof value === 'string' || typeof value === 'number') {
      const selectedValues = new Set<string | number>([value]);
      if (this.selectChildren) {
        this.selectChildrenRecursive(value, selectedValues, true);
      }
      this.value = Array.from(selectedValues) as string[];
    } else {
      this.value = value;
    }
    this.onChange(this.value as string | string[]);
  }

  private selectChildrenRecursive(parentValue: string | number, selectedValues: Set<string | number>, isSelected: boolean): void {
    const parentOption = this.findOptionByValue(this.options, parentValue);
    if (parentOption?.children) {
      parentOption.children.forEach(child => {
        if (isSelected) {
          selectedValues.add(child.value);
        } else {
          selectedValues.delete(child.value);
        }
        this.selectChildrenRecursive(child.value, selectedValues, isSelected);
      });
    }
  }

  private findOptionByValue(options: TreeControl[], value: string | number): TreeControl | undefined {
    for (const option of options) {
      if (option.value === value) {
        return option;
      }
      if (option.children) {
        const childOption = this.findOptionByValue(option.children, value);
        if (childOption) {
          return childOption;
        }
      }
    }
    return undefined;
  }
}
