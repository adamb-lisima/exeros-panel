<template>
  <div :style="styles.container" :class="{ 'textarea-invalid': hasError, 'textarea-disabled': disabled, 'textarea-focused': isFocused }">
    <div :style="styles.fieldContainer">
      <div v-if="prefixIcon" :style="styles.prefix">
        <i :style="styles.icon">{{ prefixIcon }}</i>
      </div>

      <div :style="styles.wrapper">
        <textarea :style="styles.input" :value="modelValue" :placeholder="isFocused || hasValue ? placeholder : ''" :rows="rows" :disabled="disabled" :maxlength="maxlength" @input="updateValue($event)" @focus="handleFocus" @blur="handleBlur"></textarea>

        <span :style="[styles.label, isFocused || hasValue ? getLabelFloatStyles() : {}]">
          {{ label }}
        </span>

        <div :style="styles.outline">
          <div :style="getBorderStyles('start')"></div>
          <div :style="getBorderStyles('notch')"></div>
          <div :style="getBorderStyles('end')"></div>
        </div>

        <div v-if="label && (isFocused || hasValue)" :style="getLabelBackgroundStyles()"></div>
      </div>

      <div v-if="suffixIcon" :style="styles.suffix" @click="$emit('suffix-click')">
        <i :style="styles.icon">{{ suffixIcon }}</i>
      </div>
    </div>

    <div :style="styles.subscript">
      <div v-if="hasError" :style="styles.error">{{ errorMessage }}</div>
      <div v-else-if="hint" :style="styles.hint">{{ hint }}</div>
      <div v-if="showCounter && maxlength" :style="styles.counter">{{ modelValue?.length || 0 }}/{{ maxlength }}</div>
    </div>
  </div>
</template>

<script>
import formControlMixin from '../../style/mixins/formControlMixin.js';
import { textareaStyles, getTextareaLabelFloatStyles } from '../../style/formStyles.js';

export default {
  name: 'TextareaControl',
  mixins: [formControlMixin],
  props: {
    rows: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      styles: textareaStyles
    };
  },
  methods: {
    getLabelFloatStyles() {
      return getTextareaLabelFloatStyles(this.hasError, this.isFocused, this.actualBackgroundColor);
    }
  }
};
</script>
