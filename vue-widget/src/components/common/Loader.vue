<template>
  <div :class="containerClasses">
    <div :class="loaderClasses"></div>
    <div v-if="overlay" class="loader-overlay"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['small', 'normal', 'main'].includes(value)
  },
  overlay: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'main', 'infinite-scroll'].includes(value)
  }
})

const containerClasses = computed(() => [
  'loader',
  `loader--${props.type}`,
  {
    'loader--small': props.size === 'small'
  }
])

const loaderClasses = computed(() => [
  'loader-spinner'
])
</script>

<style scoped>
.loader {
  position: relative;
  overflow: hidden;
}

.loader--small .loader-spinner {
  transform: scale(0.5, 0.5);
}

.loader--main .loader-spinner,
.loader--main .loader-overlay {
  z-index: 1001;
}

.loader--infinite-scroll .loader-spinner,
.loader--infinite-scroll .loader-overlay {
  z-index: 500;
}

.loader-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -0.5em -0.5em;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  animation: loading 1.3s infinite linear;
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: gray;
  opacity: 0.2;
  border-radius: 10px;
}

@keyframes loading {
  0%, 100% {
    box-shadow: 0 -3em 0 0.2em #FF3D00, 2em -2em 0 0em #FF3D00, 3em 0 0 -1em #FF3D00, 2em 2em 0 -1em #FF3D00, 0 3em 0 -1em #FF3D00, -2em 2em 0 -1em #FF3D00, -3em 0 0 -1em #FF3D00, -2em -2em 0 0 #FF3D00;
  }
  12.5% {
    box-shadow: 0 -3em 0 0 #FF3D00, 2em -2em 0 0.2em #FF3D00, 3em 0 0 0 #FF3D00, 2em 2em 0 -1em #FF3D00, 0 3em 0 -1em #FF3D00, -2em 2em 0 -1em #FF3D00, -3em 0 0 -1em #FF3D00, -2em -2em 0 -1em #FF3D00;
  }
  25% {
    box-shadow: 0 -3em 0 -0.5em #FF3D00, 2em -2em 0 0 #FF3D00, 3em 0 0 0.2em #FF3D00, 2em 2em 0 0 #FF3D00, 0 3em 0 -1em #FF3D00, -2em 2em 0 -1em #FF3D00, -3em 0 0 -1em #FF3D00, -2em -2em 0 -1em #FF3D00;
  }
  37.5% {
    box-shadow: 0 -3em 0 -1em #FF3D00, 2em -2em 0 -1em #FF3D00, 3em 0em 0 0 #FF3D00, 2em 2em 0 0.2em #FF3D00, 0 3em 0 0em #FF3D00, -2em 2em 0 -1em #FF3D00, -3em 0em 0 -1em #FF3D00, -2em -2em 0 -1em #FF3D00;
  }
  50% {
    box-shadow: 0 -3em 0 -1em #FF3D00, 2em -2em 0 -1em #FF3D00, 3em 0 0 -1em #FF3D00, 2em 2em 0 0em #FF3D00, 0 3em 0 0.2em #FF3D00, -2em 2em 0 0 #FF3D00, -3em 0em 0 -1em #FF3D00, -2em -2em 0 -1em #FF3D00;
  }
  62.5% {
    box-shadow: 0 -3em 0 -1em #FF3D00, 2em -2em 0 -1em #FF3D00, 3em 0 0 -1em #FF3D00, 2em 2em 0 -1em #FF3D00, 0 3em 0 0 #FF3D00, -2em 2em 0 0.2em #FF3D00, -3em 0 0 0 #FF3D00, -2em -2em 0 -1em #FF3D00;
  }
  75% {
    box-shadow: 0em -3em 0 -1em #FF3D00, 2em -2em 0 -1em #FF3D00, 3em 0em 0 -1em #FF3D00, 2em 2em 0 -1em #FF3D00, 0 3em 0 -1em #FF3D00, -2em 2em 0 0 #FF3D00, -3em 0em 0 0.2em #FF3D00, -2em -2em 0 0 #FF3D00;
  }
  87.5% {
    box-shadow: 0em -3em 0 0 #FF3D00, 2em -2em 0 -1em #FF3D00, 3em 0 0 -1em #FF3D00, 2em 2em 0 -1em #FF3D00, 0 3em 0 -1em #FF3D00, -2em 2em 0 0 #FF3D00, -3em 0em 0 0 #FF3D00, -2em -2em 0 0.2em #FF3D00;
  }
}
</style>
