<script setup>
import { DateTime } from 'luxon';
import { ref, reactive, onUnmounted, watch, nextTick, computed } from 'vue'
import ftCloudService from '../services/ftCloudService.js'
import { ftCloudUtils } from '../utils/ftCloudUtils.js'
import { PlayerState, StreamType } from '../models/ftCloudModels.js'
import FTCloudTimeoutDialog from './FTCloudTimeoutDialog.vue'

const props = defineProps({
  cameras: {
    type: [Array, String],
    required: true
  },
  config: {
    type: [Object, String],
    default: () => ({})
  },
  headers: {
    type: [Object, String],
    default: () => ({})
  },
  beginTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  timelineStartTime: {
    type: String,
    default: ''
  },
  timelineEndTime: {
    type: String,
    default: ''
  },
  seekTime: {
    type: String,
    default: ''
  },
  streamType: {
    type: String,
    default: StreamType.MINOR,
    validator: value => Object.values(StreamType).includes(value)
  },
  playType: {
    type: String,
    default: 'device',
    validator: value => ['device', 'server'].includes(value)
  },
  storeType: {
    type: String,
    default: 'MASTER'
  },
  showControls: {
    type: Boolean,
    default: true
  },
  autoPlay: {
    type: Boolean,
    default: false
  }
})

const parsedCameras = computed(() => {
  let cameras = props.cameras
  if (typeof cameras === 'string') {
    try {
      cameras = JSON.parse(cameras)
    } catch (e) {
      console.error('Error processing cameras:', e);
      return []
    }
  }
  return Array.isArray(cameras) ? cameras : []
})

const isValidTimeRange = computed(() => {
  if (!props.beginTime || !props.endTime) return false

  try {
    const beginDate = new Date(props.beginTime)
    const endDate = new Date(props.endTime)

    if (isNaN(beginDate.getTime()) || isNaN(endDate.getTime())) return false

    return beginDate < endDate;
  } catch (error) {
    console.error('Error time range validation:', error);
    return false
  }
})

const getTimelineRange = () => {
  if (props.timelineStartTime && props.timelineEndTime) {
    return {
      start: props.timelineStartTime,
      end: props.timelineEndTime
    }
  }

  if (!props.beginTime) return null

  const date = new Date(props.beginTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const fallbackRange = {
    start: `${year}-${month}-${day} 00:00:00`,
    end: `${year}-${month}-${day} 23:59:59`
  }
  return fallbackRange
}

const parsedConfig = computed(() => {
  let config = props.config
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config)
    } catch (e) {
      console.error('Error parsing config:', e);
      return {}
    }
  }
  return config || {}
})

const parsedHeaders = computed(() => {
  let headers = props.headers
  if (typeof headers === 'string') {
    try {
      headers = JSON.parse(headers)
    } catch (e) {
      console.error('Error parsing headers:', e);
      return {}
    }
  }
  return headers || {}
})

const emit = defineEmits([
  'player-ready',
  'state-change',
  'error',
  'time-change',
  'play-ended',
  'device-offline'
])

const videoContainer = ref(null)
const playerInstance = ref(null)
const currentTime = ref('')
const isPlaying = ref(false)
const isDeviceOffline = ref(false)
const initialSeekTime = ref('')
const hasInitialSeek = ref(false)
const lastTimelineRange = ref('')
const initTimeout = ref(null)
const showTimeoutDialog = ref(false)
const timeoutTimer = ref(null)

const isVideoActuallyPlaying = ref(false)
const videoCheckInterval = ref(null)
const loadingTimeout = ref(null)

const playerState = reactive({
  state: PlayerState.IDLE,
  message: '',
  isInitialized: false
})

const checkVideoPlayback = () => {
  if (!videoContainer.value) return false

  const videos = videoContainer.value.querySelectorAll('video')
  let hasPlayingVideo = false

  videos.forEach(video => {
    if (video.readyState >= 2 && video.currentTime > 0 && !video.paused && !video.ended) {
      hasPlayingVideo = true
    }
  })

  return hasPlayingVideo
}

const startVideoMonitoring = () => {
  isVideoActuallyPlaying.value = false

  if (videoCheckInterval.value) {
    clearInterval(videoCheckInterval.value)
  }

  videoCheckInterval.value = setInterval(() => {
    const isPlaying = checkVideoPlayback()

    if (isPlaying && !isVideoActuallyPlaying.value) {
      isVideoActuallyPlaying.value = true
      clearInterval(videoCheckInterval.value)
      if (loadingTimeout.value) {
        clearTimeout(loadingTimeout.value)
      }
    }
  }, 500)

  loadingTimeout.value = setTimeout(() => {
    if (!isVideoActuallyPlaying.value) {
      isVideoActuallyPlaying.value = true
      clearInterval(videoCheckInterval.value)
    }
  }, 30000)
}

const stopVideoMonitoring = () => {
  isVideoActuallyPlaying.value = false

  if (videoCheckInterval.value) {
    clearInterval(videoCheckInterval.value)
    videoCheckInterval.value = null
  }

  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value)
    loadingTimeout.value = null
  }
}

const isDeviceOfflineError = (errorInfo) => {
  if (errorInfo?.subErrorType === 'H5_SDK_DEVICE_OFFLINE') return true
  if (errorInfo?.errorInfo?.message === 'device offline') return true
  if (errorInfo?.errorInfo?.code === 21717) return true
  if (errorInfo?.data?.message === 'device offline') return true
  return errorInfo?.data?.code === 21717;
}

const startTimeout = () => {
  if (timeoutTimer.value) {
    return
  }

  timeoutTimer.value = setTimeout(() => {
    showTimeoutDialog.value = true
  }, 30000)
}

const resetTimeout = () => {
  clearCustomTimeout()
  if (isPlaying.value && parsedCameras.value.length > 0) {
    startTimeout()
  }
}

const clearCustomTimeout = () => {
  if (timeoutTimer.value) {
    clearTimeout(timeoutTimer.value)
    timeoutTimer.value = null
  }
}

const handleTimeoutConfirmed = () => {
  showTimeoutDialog.value = false
  resetTimeout()
}

const handleTimeoutCancelled = () => {
  showTimeoutDialog.value = false
  destroyPlayer()
  clearCustomTimeout()
}

const handleDoubleClick = () => {
  if (!playerInstance.value?.pluginMap?.fullscreen) return

  try {
    const camera = parsedCameras.value[0]
    playerInstance.value.pluginMap.fullscreen.fullscreen({
      devId: camera.stream || camera.devId,
      channel: camera.channel
    })
  } catch (e) {
    console.error('Error on fullscreen:', e);
  }
}

const addCanvasControls = () => {
  if (!props.showControls || !videoContainer.value) return

  setTimeout(() => {
    const playerContainers = videoContainer.value.querySelectorAll('.st-player-container')

    playerContainers.forEach((container, index) => {
      const video = container.querySelector('video')
      const canvas = container.querySelector('canvas')
      const target = canvas || video

      if (target && index < parsedCameras.value.length) {
        const existingControls = container.querySelector('.ft-controls')
        if (existingControls) {
          existingControls.remove()
        }

        const controlsDiv = document.createElement('div')
        controlsDiv.className = 'ft-controls'
        controlsDiv.style.cssText = `
          position: absolute;
          bottom: 8px;
          right: 8px;
          z-index: 99999;
          display: flex;
          gap: 8px;
          pointer-events: auto;
        `

        const snapBtn = document.createElement('div')
        snapBtn.style.cssText = `
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `
        snapBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13.8333C11.3807 13.8333 12.5 12.7141 12.5 11.3333C12.5 9.95258 11.3807 8.83333 10 8.83333C8.61925 8.83333 7.5 9.95258 7.5 11.3333C7.5 12.7141 8.61925 13.8333 10 13.8333Z" stroke="currentColor" stroke-width="1.06" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M15 5.83333H13.3333L12.5 4.16666H7.5L6.66667 5.83333H5C4.07953 5.83333 3.33333 6.57953 3.33333 7.49999V14.1667C3.33333 15.0871 4.07953 15.8333 5 15.8333H15C15.9205 15.8333 16.6667 15.0871 16.6667 14.1667V7.49999C16.6667 6.57953 15.9205 5.83333 15 5.83333Z" stroke="currentColor" stroke-width="1.06" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        `

        snapBtn.onclick = () => {
          if (!playerInstance.value?.pluginMap?.snapshot) return

          try {
            const camera = parsedCameras.value[index]
            const devId = camera.stream || camera.devId
            playerInstance.value.pluginMap.snapshot.capture(
              { devId: devId, channel: camera.channel },
              { autodownload: true }
            )
          } catch (e) {
            console.error('Error on snapshot:', e);
          }
        }

        controlsDiv.appendChild(snapBtn)
        container.appendChild(controlsDiv)

        target.addEventListener('dblclick', handleDoubleClick)
      }
    })
  }, 1000)
}

const destroyPlayer = () => {
  clearCustomTimeout()
  stopVideoMonitoring()

  if (playerInstance.value) {
    try {
      playerInstance.value.destroy()
    } catch (error) {
      console.error('Error when destroying player:', error);
    } finally {
      playerInstance.value = null
      playerState.state = PlayerState.IDLE
      playerState.isInitialized = false
      currentTime.value = ''
      isPlaying.value = false
      hasInitialSeek.value = false
    }
  }

  if (videoContainer.value) {
    videoContainer.value.innerHTML = ''
  }
}

const setupVideoContainerLayout = (container, cameraCount) => {
  container.style.display = 'grid'
  container.style.gap = '8px'
  container.style.padding = '8px'
  container.style.boxSizing = 'border-box'

  if (cameraCount === 1) {
    container.style.gridTemplateColumns = '1fr'
    container.style.gridTemplateRows = '1fr'
  } else if (cameraCount === 2) {
    container.style.gridTemplateColumns = '1fr 1fr'
    container.style.gridTemplateRows = '1fr'
  } else if (cameraCount >= 3) {
    container.style.gridTemplateColumns = '1fr 1fr'
    container.style.gridTemplateRows = '1fr 1fr'
  }
}

const initializePlayer = async () => {
  if (!parsedCameras.value.length || !videoContainer.value) return
  if (!isValidTimeRange.value) {
    playerState.state = PlayerState.ERROR
    playerState.message = 'Invalid time range'
    emit('error', new Error('Invalid time range'))
    return
  }

  try {
    destroyPlayer()
    isDeviceOffline.value = false
    hasInitialSeek.value = false
    initialSeekTime.value = props.beginTime

    const timelineRange = getTimelineRange()
    const newTimelineRangeKey = `${timelineRange.start}-${timelineRange.end}`
    lastTimelineRange.value = newTimelineRangeKey

    playerState.state = PlayerState.LOADING
    startVideoMonitoring()

    await ftCloudService.initialize(parsedConfig.value, parsedHeaders.value)
    await nextTick()

    setupVideoContainerLayout(videoContainer.value, parsedCameras.value.length);

    const containers = []
    for (let i = 0; i < Math.min(parsedCameras.value.length, 4); i++) {
      const div = document.createElement('div')
      div.style.backgroundColor = '#f5f5f5'
      div.style.borderRadius = '8px'
      div.style.overflow = 'hidden'
      div.style.position = 'relative'
      div.style.width = '100%'
      div.style.height = '100%'
      div.id = `playback-camera-${i}`
      videoContainer.value.appendChild(div)
      containers.push(div)
    }

    const deviceInfoMap = new Map()
    parsedCameras.value.forEach(camera => {
      const devId = camera.stream || camera.devId
      if (deviceInfoMap.has(devId)) {
        const existing = deviceInfoMap.get(devId)
        existing.channels += ',' + camera.channel
      } else {
        deviceInfoMap.set(devId, {
          devId: devId,
          channels: camera.channel.toString()
        })
      }
    })

    const finalDeviceInfos = Array.from(deviceInfoMap.values())

    const fileList = parsedCameras.value.map(camera => ({
      devId: camera.stream || camera.devId,
      chan: camera.channel,
      beginTime: timelineRange.start,
      endTime: timelineRange.end,
      streamType: props.streamType,
      storeType: props.storeType
    }))

    const playbackOptions = {
      deviceInfos: finalDeviceInfos,
      streamType: props.streamType,
      storeType: props.storeType,
      playType: props.playType,
      beginTime: timelineRange.start,
      endTime: timelineRange.end,
      platformTimeZoneOffset: 0,
      fileList: fileList
    }

    const player = ftCloudService.createHistoryPlayer(containers, playbackOptions)
    playerInstance.value = player

    if (!playerInstance.value) {
      throw new Error('History player instance is undefined after creation')
    }

    if (player.hooks?.afterReady) {
      player.hooks.afterReady.tap('ready', () => {
        playerState.state = PlayerState.READY
        playerState.isInitialized = true
        emit('player-ready', playerInstance.value)
        addCanvasControls()

        playerInstance.value.play()
        isPlaying.value = true
        playerState.state = PlayerState.PLAYING
        startTimeout()

        if (initialSeekTime.value && !hasInitialSeek.value) {
          setTimeout(() => {
            seekToTime(initialSeekTime.value)
            hasInitialSeek.value = true
          }, 1000)
        }
      })
    }

    if (player.hooks?.onError) {
      player.hooks.onError.tap('error', (errorInfo) => {
        stopVideoMonitoring()

        if (isDeviceOfflineError(errorInfo)) {
          isDeviceOffline.value = true
          playerState.state = PlayerState.ERROR
          playerState.message = 'Vehicle is offline'
          emit('device-offline', errorInfo)
          emit('error', errorInfo)
          return
        }

        const error = ftCloudUtils.handlePlayerError(errorInfo)
        playerState.state = error.state
        playerState.message = error.message
        emit('error', errorInfo)
      })
    }

    if (player.hooks?.onTimeChange) {
      player.hooks.onTimeChange.tap('timeChange', ({ utc, dateTime }) => {
        currentTime.value = dateTime

        const londonDateTime = DateTime.fromSeconds(utc, { zone: 'utc' }).setZone('Europe/London')

        emit('time-change', londonDateTime)
      })
    }

    if (player.hooks?.onPlayEnded) {
      player.hooks.onPlayEnded.tap('onPlayEnded', (player, eventData) => {
        playerState.state = PlayerState.STOPPED
        isPlaying.value = false
        clearCustomTimeout()
        emit('play-ended', eventData)
      })
    }

    playerInstance.value.load()

  } catch (error) {
    stopVideoMonitoring()

    if (isDeviceOfflineError(error)) {
      isDeviceOffline.value = true
      playerState.state = PlayerState.ERROR
      playerState.message = 'Vehicle is offline'
      emit('device-offline', error)
    } else {
      const errorInfo = ftCloudUtils.handlePlayerError(error)
      playerState.state = errorInfo.state
      playerState.message = errorInfo.message
    }
    emit('error', error)
  }
}

const play = () => {
  if (playerInstance.value && playerState.isInitialized) {
    try {
      playerInstance.value.play()
      playerState.state = PlayerState.PLAYING
      isPlaying.value = true
      resetTimeout()
    } catch (e) {
      console.error('Error on play stream:', e);
    }
  }
}

const pause = () => {
  if (playerInstance.value && playerState.isInitialized) {
    try {
      playerInstance.value.pause()
      playerState.state = PlayerState.PAUSED
      isPlaying.value = false
      clearCustomTimeout()
    } catch (e) {
      console.error('Error on pause stream:', e);
    }
  }
}

const seekToTime = (timeString) => {
  if (playerInstance.value && playerState.isInitialized && timeString) {
    try {
      playerInstance.value.seek(timeString)
      resetTimeout()
    } catch (e) {
      console.error('Error on seek:', e);
    }
  }
}

const seek = () => {
  if (props.seekTime) {
    seekToTime(props.seekTime)
  }
}

const takeSnapshot = () => {
  if (!playerInstance.value?.pluginMap?.snapshot) return

  try {
    const camera = parsedCameras.value[0]
    const devId = camera.stream || camera.devId
    playerInstance.value.pluginMap.snapshot.capture(
      { devId: devId, channel: camera.channel },
      { autodownload: true }
    )
  } catch (e) {
    console.error('Error on snapshot:', e);
  }
}

watch(() => [props.beginTime, props.endTime, props.timelineStartTime, props.timelineEndTime], (newValues, oldValues) => {
  if (initTimeout.value) {
    clearTimeout(initTimeout.value)
    initTimeout.value = null
  }

  if (!newValues[0] || !newValues[1] || !isValidTimeRange.value) {
    if (playerState.isInitialized) {
      destroyPlayer()
    }
    return
  }

  const timelineRange = getTimelineRange()
  const newTimelineRange = `${timelineRange.start}-${timelineRange.end}`
  const timelineChanged = newTimelineRange !== lastTimelineRange.value

  const oldDay = oldValues[0] ? new Date(oldValues[0]).toDateString() : null
  const newDay = new Date(newValues[0]).toDateString()
  const dayChanged = oldDay !== newDay

  const playerInitialized = playerState.isInitialized

  if (!playerInitialized || dayChanged || timelineChanged) {
    initTimeout.value = setTimeout(() => {
      initializePlayer()
    }, 100)
  } else if (playerInitialized && newValues[0] !== oldValues[0]) {
    seekToTime(newValues[0])
  }
}, { immediate: false })

watch(() => parsedCameras.value, (newCameras, oldCameras) => {
  const camerasChanged = JSON.stringify(newCameras.map(c => ({
    stream: c.stream,
    channel: c.channel
  }))) !== JSON.stringify(oldCameras?.map(c => ({
    stream: c.stream,
    channel: c.channel
  })) || [])

  if (camerasChanged && newCameras.length > 0 && isValidTimeRange.value) {
    if (initTimeout.value) {
      clearTimeout(initTimeout.value)
    }
    initTimeout.value = setTimeout(() => {
      initializePlayer()
    }, 100)
  } else if (newCameras.length === 0) {
    destroyPlayer()
  }
}, { immediate: true })

watch(() => [props.streamType, props.storeType, props.playType], () => {
  if (playerState.isInitialized) {
    if (initTimeout.value) {
      clearTimeout(initTimeout.value)
    }
    initTimeout.value = setTimeout(() => {
      initializePlayer()
    }, 100)
  }
})

onUnmounted(() => {
  if (initTimeout.value) {
    clearTimeout(initTimeout.value)
  }
  destroyPlayer()
})

defineExpose({
  play,
  pause,
  seek,
  seekToTime,
  takeSnapshot,
  destroyPlayer,
  initializePlayer,
  playerInstance,
  playerState,
  videoContainer,
  isDeviceOffline
})
</script>

<template>
  <div class="border border-new-gray-300 rounded-lg overflow-hidden h-[calc(65vh-200px)]"
       :class="{ 'loader loader--small': playerState.state === 'loading' && !isVideoActuallyPlaying }">
    <div ref="videoContainer" class="w-full h-full"></div>

    <FTCloudTimeoutDialog
      :show="showTimeoutDialog"
      :countdown-time="30"
      @confirmed="handleTimeoutConfirmed"
      @cancelled="handleTimeoutCancelled" />
  </div>
</template>
