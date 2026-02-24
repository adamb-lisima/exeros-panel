<template>
  <div :style="styles.container" :class="{ 'select-invalid': hasError, 'select-disabled': disabled, 'select-focused': isOpen }">
    <div :style="styles.fieldContainer">
      <div v-if="prefixIcon" :style="styles.prefix">
        <i :style="styles.icon">{{ prefixIcon }}</i>
      </div>

      <div :style="styles.wrapper" @click="toggleDropdown">
        <div :style="styles.selectDisplay">
          <span v-if="!hasSelectedValue" :style="styles.placeholder">{{ placeholder }}</span>
          <span v-else-if="multiple" :style="styles.selectedValue">{{ selectedLabels }}</span>
          <span v-else :style="styles.selectedValue">{{ selectedLabel }}</span>
        </div>

        <span :style="[styles.label, isOpen || hasSelectedValue ? getLabelFloatStyles() : {}]">
          {{ label }}
        </span>

        <div :style="styles.outline">
          <div :style="getBorderStyles('start')"></div>
          <div :style="getBorderStyles('notch')"></div>
          <div :style="getBorderStyles('end')"></div>
        </div>

        <div v-if="label && (isOpen || hasSelectedValue)" :style="getLabelBackgroundStyles()"></div>

        <div :style="styles.dropdownIcon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="mask0_4975_1429" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="22">
              <rect width="22" height="22" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_4975_1429)">
              <path d="M11.0658 12.6769L9.35235 10.9635C9.12085 10.732 9.06768 10.4643 9.19283 10.1605C9.31799 9.85673 9.54569 9.70483 9.87593 9.70483H13.2923C13.6225 9.70483 13.8502 9.85673 13.9754 10.1605C14.1005 10.4643 14.0474 10.732 13.8158 10.9635L12.1024 12.6769C12.0225 12.7569 11.9408 12.8139 11.8573 12.8479C11.7739 12.882 11.6828 12.8991 11.5841 12.8991C11.4854 12.8991 11.3943 12.882 11.3109 12.8479C11.2274 12.8139 11.1458 12.7569 11.0658 12.6769Z" fill="currentColor" />
            </g>
          </svg>
        </div>
      </div>

      <div v-if="suffixIcon && clearable && hasSelectedValue" :style="styles.suffix" @click.stop="handleClear">
        <i :style="styles.icon">{{ suffixIcon || 'close' }}</i>
      </div>
      <div v-else-if="suffixIcon" :style="styles.suffix">
        <i :style="styles.icon">{{ suffixIcon }}</i>
      </div>
    </div>

    <div v-if="isOpen" :style="styles.dropdown">
      <div v-if="multiple" :style="styles.actionBar">
        <button :style="styles.actionButton" @click.stop="handleSelectDeselectAll">
          {{ allSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>

      <div v-if="showSearchInput" :style="styles.searchContainer">
        <input ref="searchInput" type="text" :style="styles.searchInput" v-model="search" placeholder="Type to search..." @click.stop @keydown.stop />
      </div>

      <div :style="styles.optionsList">
        <div v-for="option in filteredOptions" :key="option.value" :style="[styles.option, isOptionSelected(option.value) ? styles.selectedOption : {}]" @click.stop="handleOptionSelect(option.value)">
          <span v-if="multiple" :style="styles.checkbox">
            <div v-if="isOptionSelected(option.value)" :style="styles.checkboxSelected"></div>
          </span>
          {{ option.label }}
        </div>
      </div>
    </div>

    <div :style="styles.subscript">
      <div v-if="hasError" :style="styles.error">{{ errorMessage }}</div>
      <div v-else-if="hint" :style="styles.hint">{{ hint }}</div>
    </div>
  </div>
</template>

<script>
import { colors, selectStyles, getSelectLabelFloatStyles, getLabelBackgroundStyles, getBorderStyles } from '../../style/formStyles.js';

export default {
  name: 'SelectControl',
  props: {
    modelValue: {
      type: [String, Number, Array],
      default: () => ''
    },
    options: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    },
    prefixIcon: {
      type: String,
      default: ''
    },
    suffixIcon: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    showSearchInput: {
      type: Boolean,
      default: true
    },
    customDisable: {
      type: String,
      default: undefined
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false,
      search: '',
      styles: selectStyles
    };
  },
  computed: {
    hasError() {
      return !!this.errorMessage;
    },
    hasSelectedValue() {
      if (this.multiple) {
        return Array.isArray(this.modelValue) && this.modelValue.length > 0;
      }
      return !!this.modelValue;
    },
    selectedLabel() {
      if (!this.modelValue) return '';
      const selectedOption = this.options.find(option => option.value === this.modelValue);
      return selectedOption?.label?.replace(/^[\u00A0\s│└─├-]+/g, '') || '';
    },
    selectedLabels() {
      if (!Array.isArray(this.modelValue) || this.modelValue.length === 0) return '';

      const selectedOptions = this.options.filter(option => this.modelValue.includes(option.value));

      if (selectedOptions.length <= 2) {
        return selectedOptions.map(option => option.label).join(', ');
      }

      return `${selectedOptions.length} items selected`;
    },
    filteredOptions() {
      if (!this.search) return this.options;

      const searchLower = this.search.toLowerCase();
      return this.options.filter(option => option.label.toLowerCase().includes(searchLower));
    },
    allSelected() {
      if (!this.multiple || !Array.isArray(this.modelValue) || !this.options.length) {
        return false;
      }

      return this.options.length === this.modelValue.length;
    },
    borderColor() {
      if (this.hasError) {
        return colors.warn;
      } else if (this.isOpen) {
        return colors.accent;
      } else if (this.disabled) {
        return colors.textDisabled;
      }
      return colors.outline;
    },
    borderWidth() {
      return this.isOpen ? '2px' : '1px';
    },
    backgroundColor() {
      return this.disabled ? colors.backgroundDisabled : 'transparent';
    },
    actualBackgroundColor() {
      return this.backgroundColor === 'transparent' ? colors.background : this.backgroundColor;
    },
    labelPosition() {
      return '16px';
    },
    labelWidth() {
      return this.label ? `calc(${this.label.length * 0.75}ch + 8px)` : '0';
    }
  },
  mounted() {
    document.addEventListener('click', this.closeDropdown);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdown);
  },
  methods: {
    getLabelFloatStyles() {
      return getSelectLabelFloatStyles(this.hasError, this.isOpen, this.actualBackgroundColor);
    },
    getLabelBackgroundStyles() {
      return getLabelBackgroundStyles(this.labelPosition, this.labelWidth, this.actualBackgroundColor);
    },
    getBorderStyles(part) {
      return getBorderStyles(part, this.borderColor, this.borderWidth, this.backgroundColor, this.labelPosition, this.labelWidth);
    },
    toggleDropdown() {
      if (this.disabled || this.customDisable === 'true') return;

      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        this.styles.dropdownIcon.transform = 'rotate(180deg)';
      } else {
        this.styles.dropdownIcon.transform = 'rotate(0)';
      }

      if (this.isOpen && this.showSearchInput) {
        this.$nextTick(() => {
          if (this.$refs.searchInput) {
            this.$refs.searchInput.focus();
          }
        });
      }
    },
    closeDropdown(event) {
      if (!this.$el.contains(event.target)) {
        this.isOpen = false;
        this.search = '';
        this.styles.dropdownIcon.transform = 'rotate(0)';
      }
    },
    handleOptionSelect(value) {
      if (this.multiple) {
        let newValue = [...(Array.isArray(this.modelValue) ? this.modelValue : [])];

        if (newValue.includes(value)) {
          newValue = newValue.filter(v => v !== value);
        } else {
          newValue.push(value);
        }

        this.$emit('update:modelValue', newValue);
        this.$emit('input', newValue);
      } else {
        this.$emit('update:modelValue', value);
        this.$emit('input', value);
        this.isOpen = false;
        this.styles.dropdownIcon.transform = 'rotate(0)';
      }
    },
    isOptionSelected(value) {
      if (this.multiple) {
        return Array.isArray(this.modelValue) && this.modelValue.includes(value);
      }
      return this.modelValue === value;
    },
    handleSelectDeselectAll() {
      if (this.allSelected) {
        this.$emit('update:modelValue', []);
      } else {
        const allValues = this.options.map(option => option.value);
        this.$emit('update:modelValue', allValues);
      }
    },
    handleClear(event) {
      event.stopPropagation();
      this.$emit('update:modelValue', this.multiple ? [] : '');
    }
  }
};
</script>
