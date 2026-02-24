<template>
  <div class="line-chart-container w-full h-full">
    <div ref="chartContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  options: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 300
  },
  colors: {
    type: Array,
    default: () => []
  }
})

const chartContainer = ref(null)
let apexChart = null

const getComputedColor = (colorVar) => {
  if (colorVar.startsWith('var(')) {
    const varName = colorVar.slice(4, -1)
    return getComputedStyle(document.documentElement).getPropertyValue(varName) || '#FF3D00'
  }
  return colorVar
}

const chartOptions = {
  series: [],
  chart: {
    height: 350,
    type: 'line',
    toolbar: { show: false },
    animations: { enabled: true },
    zoom: { enabled: false }
  },
  dataLabels: { enabled: false },
  colors: ['#FF3D00'],
  title: {
    text: '',
    align: 'left',
    style: { fontSize: '16px', fontWeight: 'bold' }
  },
  stroke: { width: 3, curve: 'smooth' },
  fill: { opacity: 0.2, type: 'solid' },
  markers: { size: 4, hover: { size: 6 } },
  xaxis: {
    type: 'datetime',
    labels: { datetimeUTC: false }
  },
  yaxis: {
    show: true,
    reversed: false,
    labels: { formatter: val => val.toFixed(2) }
  },
  grid: {
    borderColor: '#e0e0e0',
    strokeDashArray: 6,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } }
  },
  tooltip: {
    enabled: true,
    shared: false,
    x: { format: 'dd MMM yyyy' }
  },
  legend: { show: true, position: 'bottom' }
}

const initChart = async () => {
  if (typeof window.ApexCharts === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/apexcharts@latest'
    document.head.appendChild(script)

    await new Promise(resolve => {
      script.onload = resolve
    })
  }

  updateChartOptions()

  const defaultColor = getComputedStyle(document.documentElement).getPropertyValue('--main-primary') || '#FF3D00'

  apexChart = new window.ApexCharts(chartContainer.value, {
    ...chartOptions,
    series: chartOptions.series,
    chart: { ...chartOptions.chart, height: props.height },
    title: { ...chartOptions.title, text: props.title },
    colors: getChartColors()
  })

  apexChart.render()
}

const getChartColors = () => {
  if (props.colors.length) {
    return props.colors.map(color => getComputedColor(color))
  }

  if (props.options.lineColor) {
    return [getComputedColor(props.options.lineColor)]
  }

  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--main-primary') || '#FF3D00'
  return [primaryColor]
}

const updateChartOptions = () => {
  chartOptions.series = props.data.map(series => ({
    name: series.name,
    data: series.data.map(point => ({
      x: new Date(point.x),
      y: point.y
    }))
  }))

  if (props.options.showYAxis !== undefined) {
    chartOptions.yaxis.show = props.options.showYAxis
  }
  if (props.options.invertedYAxis !== undefined) {
    chartOptions.yaxis.reversed = props.options.invertedYAxis
  }
  if (props.options.yAxisMin !== undefined) {
    chartOptions.yaxis.min = props.options.yAxisMin
  }
  if (props.options.yAxisMax !== undefined) {
    chartOptions.yaxis.max = props.options.yAxisMax
  }
}

const updateOptions = (newOptions) => {
  if (apexChart) {
    apexChart.updateOptions(newOptions)
  }
}

watch(() => [props.data, props.options, props.title, props.height, props.colors],
  () => {
    if (apexChart) {
      updateChartOptions()
      apexChart.updateOptions({
        ...chartOptions,
        chart: { ...chartOptions.chart, height: props.height },
        title: { ...chartOptions.title, text: props.title },
        colors: getChartColors()
      })
    }
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

defineExpose({
  chart: { updateOptions },
  updateOptions
})
</script>
