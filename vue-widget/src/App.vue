<template>
  <div class="vue-widget">
    <div class="p-2 bg-green-50 border border-green-200 rounded">
      <div>Alert Message: {{ alertMessage }}</div>
      <div>Alert Type: {{ alertType }}</div>
      <div>Show Alert: {{ showAlert }}</div>
    </div>
  </div>
</template>

<script setup>
import { watch, watchEffect } from 'vue';

const props = defineProps({
  alertMessage: String,
  alertType: String,
  showAlert: String
})

watchEffect(() => {
  if (props.showAlert === 'true') {
    alert(`ALERT: ${props.alertMessage}`);
  }
});
</script>
