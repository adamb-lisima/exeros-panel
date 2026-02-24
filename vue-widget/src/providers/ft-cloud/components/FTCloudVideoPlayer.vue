<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import ftCloudService from '../services/ftCloudService.js';
import { ftCloudUtils } from '../utils/ftCloudUtils.js';
import { PlayerState, StreamType } from '../models/ftCloudModels.js';

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
  streamType: {
    type: String,
    default: StreamType.MAJOR,
    validator: value => Object.values(StreamType).includes(value)
  },
  showControls: {
    type: Boolean,
    default: true
  },
  autoPlay: {
    type: Boolean,
    default: true
  }
});

const parsedCameras = computed(() => {
  let cameras = props.cameras;
  if (typeof cameras === 'string') {
    try {
      cameras = JSON.parse(cameras);
    } catch (e) {
      console.error('Error processing cameras:', e);
      return [];
    }
  }
  return Array.isArray(cameras) ? cameras : [];
});

const parsedConfig = computed(() => {
  let config = props.config;
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config);
    } catch (e) {
      console.error('Error parsing config:', e);
      return {};
    }
  }
  return config || {};
});

const parsedHeaders = computed(() => {
  let headers = props.headers;
  if (typeof headers === 'string') {
    try {
      headers = JSON.parse(headers);
    } catch (e) {
      console.error('Error parsing headers:', e);
      return {};
    }
  }
  return headers || {};
});

const emit = defineEmits(['player-ready', 'state-change', 'error', 'play-start', 'play-stop', 'device-offline']);

const videoContainer = ref(null);
const playerInstance = ref(null);
const currentStreamType = ref(props.streamType);
const isVideoActuallyPlaying = ref(false);
const videoCheckInterval = ref(null);
const loadingTimeout = ref(null);

const playerState = reactive({
  state: PlayerState.IDLE,
  message: '',
  isInitialized: false
});

const checkVideoPlayback = () => {
  if (!videoContainer.value) return false;

  const videos = videoContainer.value.querySelectorAll('video');
  let hasPlayingVideo = false;

  videos.forEach(video => {
    if (video.readyState >= 2 && video.currentTime > 0 && !video.paused && !video.ended) {
      hasPlayingVideo = true;
    }
  });

  return hasPlayingVideo;
};

const startVideoMonitoring = () => {
  isVideoActuallyPlaying.value = false;

  if (videoCheckInterval.value) {
    clearInterval(videoCheckInterval.value);
  }

  videoCheckInterval.value = setInterval(() => {
    const isPlaying = checkVideoPlayback();

    if (isPlaying && !isVideoActuallyPlaying.value) {
      isVideoActuallyPlaying.value = true;
      playerState.state = PlayerState.PLAYING;
      clearInterval(videoCheckInterval.value);
      if (loadingTimeout.value) {
        clearTimeout(loadingTimeout.value);
      }
    }
  }, 500);

  loadingTimeout.value = setTimeout(() => {
    if (!isVideoActuallyPlaying.value) {
      isVideoActuallyPlaying.value = true;
      playerState.state = PlayerState.PLAYING;
      clearInterval(videoCheckInterval.value);
    }
  }, 30000);
};

const stopVideoMonitoring = () => {
  isVideoActuallyPlaying.value = false;

  if (videoCheckInterval.value) {
    clearInterval(videoCheckInterval.value);
    videoCheckInterval.value = null;
  }

  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value);
    loadingTimeout.value = null;
  }
};

const handleDoubleClick = () => {
  toggleFullscreen();
};

const addCanvasControls = () => {
  if (!props.showControls || !videoContainer.value) return;

  setTimeout(() => {
    const containers = videoContainer.value.querySelectorAll('[id^="live-camera-"]');

    containers.forEach((container, index) => {
      const canvas = container.querySelector('canvas');
      const video = container.querySelector('video');
      const target = canvas || video;

      if (target && index < parsedCameras.value.length) {
        const existingControls = container.querySelector('.ft-controls');
        if (existingControls) {
          existingControls.remove();
        }

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'ft-controls';
        controlsDiv.style.cssText = `
          position: absolute;
          bottom: 8px;
          right: 8px;
          z-index: 99999;
          display: flex;
          gap: 8px;
          pointer-events: auto;
        `;

        const snapBtn = document.createElement('div');
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
        `;
        snapBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13.8333C11.3807 13.8333 12.5 12.7141 12.5 11.3333C12.5 9.95258 11.3807 8.83333 10 8.83333C8.61925 8.83333 7.5 9.95258 7.5 11.3333C7.5 12.7141 8.61925 13.8333 10 13.8333Z" stroke="currentColor" stroke-width="1.06" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M15 5.83333H13.3333L12.5 4.16666H7.5L6.66667 5.83333H5C4.07953 5.83333 3.33333 6.57953 3.33333 7.49999V14.1667C3.33333 15.0871 4.07953 15.8333 5 15.8333H15C15.9205 15.8333 16.6667 15.0871 16.6667 14.1667V7.49999C16.6667 6.57953 15.9205 5.83333 15 5.83333Z" stroke="currentColor" stroke-width="1.06" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        `;

        snapBtn.onclick = () => {
          if (!playerInstance.value?.pluginMap?.snapshot) return;

          try {
            const camera = parsedCameras.value[index];
            playerInstance.value.pluginMap.snapshot.capture(
              {
                devId: camera.deviceId || camera.devId || camera.stream,
                channel: camera.channel || camera.channels
              },
              { autodownload: true }
            );
          } catch (e) {
            console.error('Error on snapshot:', e);
          }
        };

        controlsDiv.appendChild(snapBtn);
        container.appendChild(controlsDiv);

        target.addEventListener('dblclick', handleDoubleClick);
      }
    });
  }, 1000);
};

const cleanupContainer = () => {
  if (videoContainer.value) {
    videoContainer.value.innerHTML = '';
  }
};

const destroyPlayer = () => {
  stopVideoMonitoring();

  if (videoContainer.value) {
    videoContainer.value.removeEventListener('dblclick', handleDoubleClick);
  }

  if (playerInstance.value) {
    try {
      playerInstance.value.destroy();
    } catch (error) {
      console.error('Error when destroying player:', error);
    } finally {
      playerInstance.value = null;
      playerState.state = PlayerState.IDLE;
      playerState.isInitialized = false;
    }
  }
  cleanupContainer();
};

const initializePlayer = async () => {
  if (!parsedCameras.value.length || !videoContainer.value) return;

  try {
    destroyPlayer();

    playerState.state = PlayerState.LOADING;
    startVideoMonitoring();

    await ftCloudService.initialize(parsedConfig.value, parsedHeaders.value);
    await nextTick();

    videoContainer.value.style.display = 'grid';
    videoContainer.value.style.gap = '8px';
    videoContainer.value.style.padding = '8px';
    videoContainer.value.style.boxSizing = 'border-box';

    const cameraCount = parsedCameras.value.length;
    if (cameraCount === 1) {
      videoContainer.value.style.gridTemplateColumns = '1fr';
      videoContainer.value.style.gridTemplateRows = '1fr';
    } else if (cameraCount === 2) {
      videoContainer.value.style.gridTemplateColumns = '1fr 1fr';
      videoContainer.value.style.gridTemplateRows = '1fr';
    } else if (cameraCount >= 3) {
      videoContainer.value.style.gridTemplateColumns = '1fr 1fr';
      videoContainer.value.style.gridTemplateRows = '1fr 1fr';
    }

    const containers = [];
    for (let i = 0; i < Math.min(parsedCameras.value.length, 4); i++) {
      const div = document.createElement('div');
      div.style.backgroundColor = '#f5f5f5';
      div.style.borderRadius = '8px';
      div.style.overflow = 'hidden';
      div.style.position = 'relative';
      div.style.width = '100%';
      div.style.height = '100%';
      div.id = `live-camera-${i}`;
      videoContainer.value.appendChild(div);
      containers.push(div);
    }

    const streamTypeMap = { MAIN_STREAM: 'MAJOR', SUB_STREAM: 'MINOR' };
    const ftStreamType = streamTypeMap[currentStreamType.value] || currentStreamType.value;

    const playerOptions = ftCloudUtils.createPlayerOptions(parsedCameras.value, ftStreamType);

    const player = ftCloudService.createLivePlayer(containers, playerOptions);
    playerInstance.value = player;

    if (!playerInstance.value) {
      throw new Error('Player instance is undefined after creation');
    }

    if (player.hooks?.afterReady) {
      player.hooks.afterReady.tap('ready', () => {
        emit('player-ready', playerInstance.value);
        addCanvasControls();

        setTimeout(() => {
          changeStreamType(props.streamType);
        }, 500);
      });
    }

    if (player.hooks?.onError) {
      player.hooks.onError.tap('error', errorInfo => {
        const error = ftCloudUtils.handlePlayerError(errorInfo);
        playerState.state = error.state;
        playerState.message = error.message;
        stopVideoMonitoring();

        if (errorInfo?.subErrorType === 'H5_SDK_DEVICE_OFFLINE') {
          emit('device-offline', errorInfo);
        }

        emit('error', errorInfo);
      });
    }

    if (player.pluginMap?.videoInfoLayer) {
      player.pluginMap.videoInfoLayer.setInfoList(['p', 'fps', 'mbps']);
    }

    playerInstance.value.load();
    playerState.isInitialized = true;
  } catch (error) {
    const errorInfo = ftCloudUtils.handlePlayerError(error);
    playerState.state = errorInfo.state;
    playerState.message = errorInfo.message;
    stopVideoMonitoring();
    emit('error', error);
  }
};

const changeStreamType = newType => {
  if (!playerInstance.value) return;

  const streamTypeMap = { MAIN_STREAM: 'MAJOR', SUB_STREAM: 'MINOR' };
  const ftStreamType = streamTypeMap[newType] || newType;

  try {
    const streamData = parsedCameras.value.map(camera => ({
      devId: camera.deviceId || camera.devId || camera.stream,
      channel: camera.channel || camera.channels,
      streamType: ftStreamType
    }));

    playerInstance.value.streamType = streamData;
    currentStreamType.value = newType;
  } catch (e) {
    console.error('Error on stream type change:', e);
  }
};

const toggleZoom = () => {
  if (!playerInstance.value?.pluginMap?.magnifier) return;

  try {
    const camera = parsedCameras.value[0];
    playerInstance.value.pluginMap.magnifier.enable({
      devId: camera.deviceId || camera.devId || camera.stream,
      channel: camera.channel || camera.channels
    });
  } catch (e) {
    console.error('Error on zoom:', e);
  }
};

const toggleFullscreen = () => {
  if (!playerInstance.value?.pluginMap?.fullscreen) return;

  try {
    const camera = parsedCameras.value[0];
    playerInstance.value.pluginMap.fullscreen.fullscreen({
      devId: camera.deviceId || camera.devId || camera.stream,
      channel: camera.channel || camera.channels
    });
  } catch (e) {
    console.error('Error on fullscreen:', e);
  }
};

const takeSnapshot = () => {
  if (!playerInstance.value?.pluginMap?.snapshot) return;

  try {
    const camera = parsedCameras.value[0];
    playerInstance.value.pluginMap.snapshot.capture(
      {
        devId: camera.deviceId || camera.devId || camera.stream,
        channel: camera.channel || camera.channels
      },
      { autodownload: true }
    );
  } catch (e) {
    console.error('Error on snapshot:', e);
  }
};

let previousCameras = [];

watch(
  () => parsedCameras.value,
  newCameras => {
    const camerasChanged = JSON.stringify(newCameras.map(c => c.channel).sort()) !== JSON.stringify(previousCameras.map(c => c.channel).sort());

    if (newCameras.length > 0 && camerasChanged) {
      initializePlayer();
    }

    previousCameras = [...newCameras];
  },
  { immediate: false }
);

watch(
  () => props.streamType,
  newType => {
    changeStreamType(newType);
  }
);

onMounted(() => {
  currentStreamType.value = props.streamType;
  if (parsedCameras.value.length > 0) {
    initializePlayer();
  }
});

onUnmounted(() => {
  destroyPlayer();
});

defineExpose({
  changeStreamType,
  takeSnapshot,
  destroyPlayer,
  toggleZoom,
  toggleFullscreen,
  playerInstance,
  playerState,
  videoContainer
});
</script>

<template>
  <div class="w-full h-full overflow-hidden" :class="{ 'loader loader--small': playerState.state === 'loading' && !isVideoActuallyPlaying }">
    <div ref="videoContainer" class="w-full h-full"></div>
  </div>
</template>
