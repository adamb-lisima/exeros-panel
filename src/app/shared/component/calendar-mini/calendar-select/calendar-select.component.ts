import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectControl } from '../../control/select-control/select-control.model';

@Component({
  selector: 'app-calendar-select',
  templateUrl: './calendar-select.component.html',
  styles: [
    `
      .select-container {
        height: 2rem;
        padding: 0 0.5rem;
        font-size: 0.875rem;
        border-radius: 0.25rem;
        border: 1px solid var(--neutral-200);
        background-color: var(--neutral-0);
        color: var(--neutral-950);
        transition: border-color 0.2s ease;
      }

      .select-container:hover:not(.disabled) {
        border-color: var(--neutral-300);
      }

      .select-container.disabled {
        cursor: not-allowed;
        background-color: var(--neutral-50);
        color: var(--neutral-400);
      }

      .select-menu {
        position: absolute;
        z-index: 50;
        width: 100%;
        margin-top: 0.25rem;
        padding: 0.25rem 0;
        background-color: var(--neutral-0);
        color: var(--neutral-950);
        border-radius: 0.375rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        border: 1px solid var(--neutral-200);
        max-height: 15rem;
        overflow-y: auto;
      }

      .select-option {
        width: 100%;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        text-align: left;
        transition: background-color 0.2s ease;
        cursor: pointer;
        border: none;
        background: none;
        color: var(--neutral-950);
      }

      .select-option:hover:not(.disabled) {
        background-color: var(--neutral-100);
      }

      .select-option:focus {
        outline: none;
        background-color: var(--neutral-100);
      }

      .select-option.selected {
        background-color: var(--neutral-100);
        font-weight: 500;
      }

      .select-option.disabled {
        cursor: not-allowed;
        color: var(--neutral-400);
      }

      /* Custom scrollbar styles */
      .select-menu::-webkit-scrollbar {
        width: 6px;
      }

      .select-menu::-webkit-scrollbar-thumb {
        background-color: var(--neutral-300);
        border-radius: 3px;
      }

      .select-menu::-webkit-scrollbar-track {
        background-color: transparent;
      }

      /* Firefox scrollbar */
      .select-menu {
        scrollbar-width: thin;
        scrollbar-color: var(--neutral-300) transparent;
      }
    `
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarSelectComponent),
      multi: true
    }
  ]
})
export class CalendarSelectComponent<T = number> implements ControlValueAccessor {
  @Input() options: SelectControl<T>[] = [];
  @Input() disabled = false;
  @Input() class = '';

  isOpen = false;
  value: T | null = null;

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  getSelectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.value);
    return selected ? selected.label : '';
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  onSelect(value: T, event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;

    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.isOpen = false;
  }

  writeValue(value: T | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
