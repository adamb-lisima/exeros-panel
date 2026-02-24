<template>
  <div class="stacked-bar-chart-container w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { getChartColors } from '../../utils/chartColors.js'

const props = defineProps({
  options: {
    type: Object,
    required: true
  }
})

const chartContainer = ref(null)
let apexChart = null

const initChart = async () => {
  if (typeof window.ApexCharts === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/apexcharts@latest'
    document.head.appendChild(script)

    await new Promise(resolve => {
      script.onload = resolve
    })
  }

  if (!props.options.series || !props.options.series.length) return

  const containerHeight = chartContainer.value?.offsetHeight || 340

  const dates = [...new Set(props.options.series.flatMap(s => s.data.map(d => d.x)))].sort()

  const series = props.options.series.map(s => ({
    name: s.name,
    data: dates.map(date => {
      const point = s.data.find(d => d.x === date)
      return point ? point.y : 0
    })
  }))

  const chartColors = getChartColors(series.length)

  const chartOptions = {
    series,
    chart: {
      type: 'bar',
      height: containerHeight + (containerHeight * 0.15),
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
      parentHeightOffset: 0
    },
    colors: chartColors,
    dataLabels: { enabled: false },
    stroke: {
      width: 0
    },
    title: {
      text: ''
    },
    xaxis: {
      categories: dates.map(date => {
        const d = new Date(date)
        const dateCount = dates.length
        if (dateCount > 25) {
          return d.getDay() === 1 ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' }) : ''
        } else if (dateCount > 8) {
          return d.toLocaleDateString('en-GB', { day: 'numeric' })
        } else {
          return d.toLocaleDateString('en-GB', { weekday: 'short' })
        }
      }),
      labels: {
        style: {
          fontSize: '12px',
          colors: ['#666']
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      title: { text: undefined },
      labels: {
        style: {
          colors: ['#666'],
          fontSize: '12px'
        },
        formatter: val => Math.round(val).toString()
      }
    },
    tooltip: {
      y: {
        formatter: (val, { series, seriesIndex, dataPointIndex, w }) => {
          const seriesName = w.globals.seriesNames[seriesIndex]
          return `${seriesName}: ${val}`
        }
      },
      x: {
        formatter: (val, { series, seriesIndex, dataPointIndex, w }) => {
          const date = dates[dataPointIndex]
          return new Date(date).toLocaleDateString('en-GB')
        }
      }
    },
    legend: {
      show: false
    },
    fill: {
      opacity: 1
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: '8px',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last'
      }
    },
    grid: {
      borderColor: '#f4f4f4',
      strokeDashArray: 6,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    }
  }

  if (apexChart) {
    apexChart.destroy()
  }

  apexChart = new window.ApexCharts(chartContainer.value, chartOptions)
  apexChart.render()
}

watch(() => props.options, () => {
  nextTick(() => {
    initChart()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})
</script>
