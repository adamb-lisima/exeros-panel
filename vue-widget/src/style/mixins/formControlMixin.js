import { colors, getLabelBackgroundStyles, getBorderStyles } from '../formStyles.js';

export default {
  props: {
    modelValue: {
      type: String,
      default: ''
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
    maxlength: {
      type: Number,
      default: null
    },
    showCounter: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'focus', 'blur', 'suffix-click'],
  data() {
    return {
      isFocused: false
    };
  },
  computed: {
    hasError() {
      return !!this.errorMessage;
    },
    hasValue() {
      return !!this.modelValue;
    },
    borderColor() {
      if (this.hasError) {
        return colors.warn;
      } else if (this.isFocused) {
        return colors.accent;
      } else if (this.disabled) {
        return colors.textDisabled;
      }
      return colors.outline;
    },
    borderWidth() {
      return this.isFocused ? '2px' : '1px';
    },
    backgroundColor() {
      return this.disabled ? colors.backgroundDisabled : 'transparent';
    },
    actualBackgroundColor() {
      return this.backgroundColor == 'transparent' ? colors.background : this.backgroundColor;
    },
    labelPosition() {
      return '16px';
    },
    labelWidth() {
      return this.label ? `calc(${this.label.length * 0.75}ch + 8px)` : '0';
    }
  },
  methods: {
    getBorderStyles(part) {
      return getBorderStyles(part, this.borderColor, this.borderWidth, this.backgroundColor, this.labelPosition, this.labelWidth);
    },
    getLabelBackgroundStyles() {
      return getLabelBackgroundStyles(this.labelPosition, this.labelWidth, this.actualBackgroundColor, this.borderWidth, '1');
    },
    updateValue(event) {
      this.$emit('update:modelValue', event.target.value);
    },
    handleFocus(event) {
      this.isFocused = true;
      this.$emit('focus', event);
    },
    handleBlur(event) {
      this.isFocused = false;
      this.$emit('blur', event);
    }
  }
};
