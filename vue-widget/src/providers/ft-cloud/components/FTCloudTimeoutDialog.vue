<script setup>
import { ref, watch, onUnmounted } from 'vue';
import Button from '../../../shared/button/Button.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  countdownTime: {
    type: Number,
    default: 30
  }
});

const emit = defineEmits(['confirmed', 'cancelled']);

const countdown = ref(null);
const intervalId = ref(null);

const startCountdown = () => {
  countdown.value = props.countdownTime;

  intervalId.value = setInterval(() => {
    countdown.value--;

    if (countdown.value <= 0) {
      clearInterval(intervalId.value);
      emit('cancelled');
    }
  }, 1000);
};

const stopCountdown = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
  countdown.value = null;
};

const handleYes = () => {
  stopCountdown();
  emit('confirmed');
};

const handleNo = () => {
  stopCountdown();
  emit('cancelled');
};

watch(
  () => props.show,
  newValue => {
    if (newValue) {
      startCountdown();
    } else {
      stopCountdown();
    }
  }
);

onUnmounted(() => {
  stopCountdown();
});
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="w-[530px] flex flex-col gap-6 p-6 rounded bg-white">
      <div class="flex flex-col gap-2">
        <p class="font-bold text-lg">Do you wish to continue previewing video?</p>
        <p v-if="countdown">Video will stop in {{ countdown }} seconds.</p>
      </div>
      <div class="flex gap-3 mr-auto">
        <Button @click="handleYes">Yes</Button>
        <Button @click="handleNo">No</Button>
      </div>
    </div>
  </div>
</template>
