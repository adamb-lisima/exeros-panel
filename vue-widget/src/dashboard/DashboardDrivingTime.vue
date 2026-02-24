<template>
  <div class="h-full flex flex-col">
    <p class="font-semibold text-xl mb-4">Driving Time</p>

    <div v-if="isLoading" class="flex-1 relative">
      <Loader />
    </div>
    <div v-else-if="chartOptions" class="flex-1">
      <LineChart
        ref="lineChart"
        :height="270"
        :data="chartOptions.series"
        :title="''"
        class="flex-1"
      />
    </div>
    <div v-else class="flex-1 bg-gray-50 rounded p-4 flex items-center justify-center">
      <p>No driving time data available</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { DateTime } from 'luxon'
import LineChart from '../components/charts/LineChart.vue'
import Loader from '../components/common/Loader.vue'

const props = defineProps({
  dashboardData: Object,
  userToken: String
})

const lineChart = ref(null)
const isLoading = ref(true)

const chartOptions = computed(() => {
  if (!props.dashboardData?.driving_time) return null

  const sortedDrivingTime = [...props.dashboardData.driving_time].sort((a, b) => {
    const aMillis = DateTime.fromFormat(a.date, 'yyyy-MM-dd').toMillis()
    const bMillis = DateTime.fromFormat(b.date, 'yyyy-MM-dd').toMillis()
    return aMillis - bMillis
  })

  return {
    series: [{
      name: 'Driving Time',
      data: sortedDrivingTime.map(time => ({
        x: time.date,
        y: time.value,
        unit: time.unit
      }))
    }]
  }
})

watch(() => props.dashboardData, (newData) => {
  isLoading.value = false
}, { immediate: false })

onMounted(() => {
  setTimeout(() => {
    if (lineChart.value) {
      lineChart.value.updateOptions({
        yaxis: {
          labels: {
            formatter: (val) => `${val.toFixed(0)} hours`
          }
        }
      })
    }
  }, 100)
})
</script>
