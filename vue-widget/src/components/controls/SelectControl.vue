<template>
  <div class="v-input v-input--horizontal v-input--density-compact v-select" style="width: 100%;">
    <div class="v-input__control">
      <div class="v-field v-field--active v-field--appended v-field--enclosed v-field--variant-outlined v-theme--light v-locale--is-ltr" role="combobox" @click="toggleOpen">
        <div class="v-field__overlay"></div>
        <div class="v-field__loader">
          <div class="v-progress-linear v-theme--light" role="progressbar" style="height: 2px; --v-progress-linear-height: 2px;">
            <div class="v-progress-linear__background" style="width: 100%;"></div>
            <div class="v-progress-linear__indeterminate">
              <div class="v-progress-linear__indeterminate long"></div>
              <div class="v-progress-linear__indeterminate short"></div>
            </div>
          </div>
        </div>
        <div class="v-field__field">
          <label class="v-label v-field-label v-field-label--floating" style="--v-field-label-scale: 0.75em;">{{ label }}</label>
          <div class="v-field__input">{{ displayText }}</div>
        </div>
        <div class="v-field__append-inner">
          <div class="v-input__icon v-input__icon--append">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon notranslate v-theme--light v-icon--size-default" style="font-size: 20px; height: 20px; width: 20px;">
              <path d="M7,10L12,15L17,10H7Z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isOpen" class="v-overlay v-menu v-overlay--absolute v-overlay--contained" style="position: absolute; top: 100%; left: 0; right: 0; z-index: 2000;">
      <div class="v-overlay__content">
        <div class="v-card v-theme--light v-card--density-default v-card--variant-elevated" style="max-height: 300px;">
          <div class="v-card-text" style="padding: 0;">
            <div v-if="multiple" class="v-list-item v-theme--light" style="padding: 8px 16px; border-bottom: 1px solid rgba(0,0,0,0.12);">
              <button @click.stop="toggleSelectAll" style="background: none; border: none; color: #1976D2; cursor: pointer; font-size: 14px; width: 100%; text-align: right;">
                {{ allSelected ? 'Deselect All' : 'Select All' }}
              </button>
            </div>

            <div v-if="showSearchInput" class="v-list-item v-theme--light" style="padding: 8px 16px; border-bottom: 1px solid rgba(0,0,0,0.12);">
              <input
                v-model="searchQuery"
                @click.stop
                placeholder="Type to search..."
                style="width: 100%; padding: 8px; border: 1px solid rgba(0,0,0,0.23); border-radius: 4px; outline: none;"
              />
            </div>

            <div style="max-height: 200px; overflow-y: auto;">
              <div v-for="option in filteredOptions"
                   :key="option.value"
                   @click.stop="selectOption(option)"
                   class="v-list-item v-theme--light"
                   :style="{
                     padding: '12px 16px',
                     cursor: 'pointer',
                     backgroundColor: isSelected(option.value) ? '#E3F2FD' : 'transparent',
                     color: isSelected(option.value) ? '#1976D2' : 'inherit'
                   }"
                   @mouseenter="$event.target.style.backgroundColor = isSelected(option.value) ? '#E3F2FD' : 'rgba(0,0,0,0.04)'"
                   @mouseleave="$event.target.style.backgroundColor = isSelected(option.value) ? '#E3F2FD' : 'transparent'">
                <div class="v-list-item__content">
                  <div class="v-list-item-title">{{ option.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: [String, Number, Array],
  options: { type: Array, default: () => [] },
  label: String,
  multiple: Boolean,
  clearable: Boolean,
  showSearchInput: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const displayText = computed(() => {
  if (props.multiple) {
    const count = Array.isArray(props.modelValue) ? props.modelValue.length : 0
    return count === 0 ? '' :
      count === 1 ? props.options.find(o => o.value === props.modelValue[0])?.label :
        `${count} selected`
  }
  return props.options.find(o => o.value === props.modelValue)?.label || ''
})

const allSelected = computed(() => {
  if (!props.multiple) return false
  return Array.isArray(props.modelValue) && props.modelValue.length === props.options.length
})

const isSelected = (value) => {
  return props.multiple
    ? Array.isArray(props.modelValue) && props.modelValue.includes(value)
    : props.modelValue === value
}

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option) => {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = current.indexOf(option.value)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(option.value)
    }
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', option.value)
    isOpen.value = false
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', props.options.map(o => o.value))
  }
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.v-select')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (props.multiple && !props.modelValue?.length) {
    emit('update:modelValue', props.options.map(o => o.value))
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.v-input {
  align-items: flex-start;
  display: flex;
  flex: 1 1 auto;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  max-width: 100%;
  position: relative;
  text-align: start;
}

.v-input--density-compact {
  --v-input-control-height: 40px;
  --v-field-input-padding-top: 4px;
  --v-field-input-padding-bottom: 4px;
}

.v-input__control {
  align-items: center;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  display: flex;
  flex-direction: column;
  height: var(--v-input-control-height, 56px);
  flex: 1 0 auto;
  position: relative;
}

.v-field {
  display: grid;
  grid-template-areas: "prepend-inner field clear append-inner";
  grid-template-columns: max-content minmax(0, 1fr) max-content max-content;
  position: relative;
  border-radius: 4px;
  flex: 1 0 auto;
  transition-duration: 0.15s;
  transition-property: border, box-shadow, background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.v-field--variant-outlined {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: transparent;
}

.v-field--variant-outlined:hover {
  border-color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.v-field--variant-outlined .v-field__overlay {
  background: currentColor;
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.25s ease;
}

.v-field__field {
  display: flex;
  flex: 1 0 auto;
  grid-area: field;
  position: relative;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding-inline-end: 16px;
  padding-inline-start: 16px;
  padding-top: var(--v-field-input-padding-top);
  padding-bottom: var(--v-field-input-padding-bottom);
  cursor: pointer;
}

.v-field__input {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  opacity: 1;
  flex: 1 1 auto;
  transition: 0.15s opacity cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 24px;
  outline: none;
  padding: 0;
  margin-top: 16px;
  width: 100%;
  min-width: 0;
}

.v-label {
  align-items: center;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  display: flex;
  font-size: 16px;
  letter-spacing: 0.009375em;
  min-height: 40px;
  opacity: 1;
  transition: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  transition-property: color, opacity, transform;
}

.v-field-label--floating {
  --v-field-label-scale: 0.75em;
  font-size: var(--v-field-label-scale);
  visibility: hidden;
  max-width: 133.333333%;
}

.v-field--variant-outlined .v-field-label--floating {
  position: absolute;
  top: 0;
  background: rgb(var(--v-theme-surface));
  left: 16px;
  padding: 0 4px;
  visibility: visible;
  transform: translateY(-50%);
}

.v-field__append-inner {
  align-items: center;
  display: flex;
  grid-area: append-inner;
  padding-inline-start: 4px;
}

.v-icon {
  align-items: center;
  display: inline-flex;
  font-feature-settings: "liga";
  height: 1em;
  justify-content: center;
  letter-spacing: normal;
  line-height: 1;
  position: relative;
  text-indent: 0;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  vertical-align: middle;
  width: 1em;
}

/* Overlay styles */
.v-overlay {
  position: absolute !important;
}

.v-overlay__content {
  position: relative;
}

.v-card {
  border-radius: 4px;
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
  background: rgb(var(--v-theme-surface));
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  text-decoration: none;
  transition-duration: 0.28s;
  transition-property: box-shadow, opacity, background;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.v-list-item {
  align-items: center;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  display: flex;
  flex: 1 1 100%;
  letter-spacing: 0.009375em;
  line-height: 1.5;
  min-height: 40px;
  outline: none;
  padding: 4px 16px;
  position: relative;
  text-decoration: none;
}
</style>
