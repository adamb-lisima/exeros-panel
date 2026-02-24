<template>
  <div :style="styles.container" :class="{ 'input-invalid': hasError, 'input-disabled': disabled, 'input-focused': isFocused }">
    <div :style="styles.fieldContainer">
      <div v-if="prefixIcon" :style="styles.prefix">
        <i :style="styles.icon">{{ prefixIcon }}</i>
      </div>

      <div :style="styles.wrapper">
        <input :type="type" :style="styles.input" :value="modelValue" :placeholder="isFocused || hasValue ? placeholder : ''" :disabled="disabled" :maxlength="maxlength" @input="updateValue($event)" @focus="handleFocus" @blur="handleBlur" />

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
import { inputStyles, getInputLabelFloatStyles } from '../../style/formStyles.js';

export default {
  name: 'TextControl',
  mixins: [formControlMixin],
  props: {
    type: {
      type: String,
      default: 'text',
      validator: value => ['text', 'password', 'email', 'number', 'tel', 'url'].includes(value)
    }
  },
  data() {
    return {
      styles: inputStyles
    };
  },
  methods: {
    getLabelFloatStyles() {
      return getInputLabelFloatStyles(this.hasError, this.isFocused, this.actualBackgroundColor);
    }
  }
};
</script>
