<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center gap-8">
      <p class="font-semibold text-xl">Events & Alarms</p>
      <SelectControl v-if="alarmTypesOptions.length && !isLoading"
                     v-model="selectedAlarmTypes"
                     :options="alarmTypesOptions"
                     label="Type"
                     :multiple="true"
                     :clearable="true"
                     class="w-[250px]" />
    </div>

    <div v-if="isLoading" class="flex-1 relative">
      <Loader />
    </div>
    <div v-else-if="chartOptions && chartOptions.series.length" class="flex-1 mt-4">
      <StackedBarChart :options="chartOptions" />
    </div>
    <div v-else class="flex-1 mt-4 bg-gray-50 rounded p-4 flex items-center justify-center">
      <p class="text-sm">There are no events available for selection</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import StackedBarChart from '../components/charts/StackedBarChart.vue'
import SelectControl from '../components/controls/SelectControl.vue'
import Loader from '../components/common/Loader.vue'

const props = defineProps({
  dashboardData: Object,
  userToken: String
})

const selectedAlarmTypes = ref([])
const isLoading = ref(true)

const alarmTypesOptions = computed(() => {
  if (!props.dashboardData?.event_chart) return []

  const allTypes = new Set()
  props.dashboardData.event_chart.forEach(chart => {
    chart.events.forEach(event => {
      allTypes.add(event.name)
    })
  })

  return Array.from(allTypes).sort().map(type => ({
    value: type,
    label: type
  }))
})

const chartOptions = computed(() => {
  if (!props.dashboardData?.event_chart || !selectedAlarmTypes.value.length) return { series: [] }

  const dates = props.dashboardData.event_chart.map(chart => chart.date).sort()

  const filteredEventsByDate = props.dashboardData.event_chart.map(chart => ({
    date: chart.date,
    events: chart.events.filter(event => selectedAlarmTypes.value.includes(event.name))
  }))

  const eventNameSet = new Set()
  filteredEventsByDate.forEach(chart => {
    chart.events.forEach(event => eventNameSet.add(event.name))
  })

  if (eventNameSet.size === 0) return { series: [] }

  const series = Array.from(eventNameSet).map(eventName => ({
    name: eventName,
    data: dates.map(date => {
      const chartData = filteredEventsByDate.find(c => c.date === date)
      const event = chartData?.events.find(e => e.name === eventName)
      return {
        x: date,
        y: event?.value || 0,
        name: eventName
      }
    })
  }))

  return { series }
})

watch(() => props.dashboardData, (newData) => {
  isLoading.value = false
}, { immediate: false })

watch(() => alarmTypesOptions.value, (newOptions) => {
  if (newOptions.length > 0 && selectedAlarmTypes.value.length === 0) {
    selectedAlarmTypes.value = newOptions.map(option => option.value)
  }
}, { immediate: true })
</script>
