<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'ternary', 'quaternary'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const baseClasses = 'w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors'

  const typeClasses = {
    primary: 'bg-main-primary text-white',
    secondary: 'text-extra-three bg-extra-three--10',
    ternary: 'bg-white text-[#EE8444] border-2 border-main-primary hover:bg-main-primary hover:text-white',
    quaternary: 'text-main-primary bg-white underline'
  }

  return `${baseClasses} ${typeClasses[props.type]}`
})

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick">
    <slot></slot>
  </button>
</template>
