<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import FTCloudCameraSelector from './FTCloudCameraSelector.vue';
import FTCloudVideoPlayer from './FTCloudVideoPlayer.vue';
import FTCloudTimeoutDialog from './FTCloudTimeoutDialog.vue';
import { StreamType } from '../models/ftCloudModels.js';

const props = defineProps({
  availableCameras: {
    type: [Array, String],
    default: () => []
  },
  liveFeedStatus: {
    type: String,
    default: 'Active'
  },
  maxSelection: {
    type: Number,
    default: 4
  },
  maxVisibleChannels: {
    type: Number,
    default: 4
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
  }
});

const emit = defineEmits([
  'state-change',
  'error',
  'play-start',
  'play-stop'
]);

const selectedCameras = ref([]);
const isPlaying = ref(true);
const videoPlayerRef = ref(null);
const snapshotImages = ref([]);
const showTimeoutDialog = ref(false);
const timeoutTimer = ref(null);
const videoPlayerKey = ref(0);
const internalLiveFeedStatus = ref(props.liveFeedStatus);

const effectiveLiveFeedStatus = computed(() => {
  return internalLiveFeedStatus.value;
});

const parsedAvailableCameras = computed(() => {
  let cameras = props.availableCameras;
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

const hasValidStreams = computed(() => {
  return parsedAvailableCameras.value.some(camera =>
    camera.main_stream || camera.sub_stream
  );
});

const parsedConfig = computed(() => {
  let config = props.config;
  if (typeof config === 'string') {
    try {
      return JSON.parse(config);
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
      return JSON.parse(headers);
    } catch (e) {
      console.error('Error parsing headers:', e);
      return {};
    }
  }
  return headers || {};
});

const currentStreamType = computed(() => {
  return props.streamType === 'MAJOR' ? 'main_stream' : 'sub_stream';
});

const ftCloudStreamType = computed(() => {
  return props.streamType;
});

const createVideoSource = (camera) => {
  const streamId = camera[currentStreamType.value];
  return {
    provider: camera.provider,
    channel: camera.channel,
    stream: streamId,
    has_playback_fixed: false,
    provider_details: camera.provider_details,
    deviceId: streamId,
    devId: streamId,
    channels: camera.channel
  };
};

const initializeFirstCamera = () => {
  if (parsedAvailableCameras.value.length > 0 && selectedCameras.value.length === 0) {
    const firstCamera = createVideoSource(parsedAvailableCameras.value[0]);
    selectedCameras.value = [firstCamera];
  }
};

const handleCameraSelection = (cameras) => {
  selectedCameras.value = cameras;
  if (cameras.length > 0) {
    isPlaying.value = true;
    clearCustomTimeout();
  }
};

const takeSnapshots = () => {
  if (!videoPlayerRef.value?.videoContainer) return [];

  const snapshots = [];
  const videoContainer = videoPlayerRef.value.videoContainer;
  const videos = videoContainer.querySelectorAll('video');

  videos.forEach((video, index) => {
    try {
      if (video.readyState < 2) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const rect = video.getBoundingClientRect();
      const displayWidth = rect.width;
      const displayHeight = rect.height;

      canvas.width = video.videoWidth || 352;
      canvas.height = video.videoHeight || 288;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL('image/png');
      snapshots.push({
        url: dataURL,
        index: index,
        width: displayWidth,
        height: displayHeight
      });
    } catch (e) {
      console.error('Error preparing snapshot:', e);
    }
  });

  return snapshots;
};

const handleStop = () => {
  if (!videoPlayerRef.value) return;

  try {
    const snapshots = takeSnapshots();
    snapshotImages.value = snapshots;
    videoPlayerRef.value.destroyPlayer();
    isPlaying.value = false;
    clearCustomTimeout();
    emit('play-stop');
  } catch (e) {
    console.error('Error stoping stream:', e);
  }
};

const handlePlay = () => {
  try {
    snapshotImages.value = [];
    isPlaying.value = true;
    emit('play-start');
  } catch (e) {
    console.error('Error playing stream', e);
  }
};

const handlePlayPause = () => {
  if (isPlaying.value) {
    handleStop();
  } else {
    handlePlay();
  }
};

const resetTimeout = () => {
  clearCustomTimeout();
  if (isPlaying.value && selectedCameras.value.length > 0) {
    startTimeout();
  }
};

const handlePlayerReady = () => {
  if (timeoutTimer.value) {
    return;
  }
  startTimeout();
};

const startTimeout = () => {
  timeoutTimer.value = setTimeout(() => {
    showTimeoutDialog.value = true;
  }, 30000);
};

const clearCustomTimeout = () => {
  if (timeoutTimer.value) {
    clearTimeout(timeoutTimer.value);
    timeoutTimer.value = null;
  }
};

const handleStateChange = (event) => {
  emit('state-change', event);
  resetTimeout();
};

const handlePlayerError = (errorInfo) => {
  if (errorInfo?.subErrorType === 'H5_SDK_DEVICE_OFFLINE') {
    internalLiveFeedStatus.value = 'Inactive';
    selectedCameras.value = [];
    isPlaying.value = false;
    clearCustomTimeout();
  }
  emit('error', errorInfo);
};

const handleTimeoutConfirmed = () => {
  showTimeoutDialog.value = false;
  resetTimeout();
};

const handleTimeoutCancelled = () => {
  showTimeoutDialog.value = false;
  selectedCameras.value = [];
  isPlaying.value = false;
  clearCustomTimeout();
};

watch(() => parsedAvailableCameras.value, (newCameras) => {
  if (newCameras.length > 0 && selectedCameras.value.length === 0) {
    setTimeout(() => {
      initializeFirstCamera();
    }, 100);
  }
}, { immediate: true });

watch(() => props.streamType, (newType) => {
  if (videoPlayerRef.value?.changeStreamType) {
    videoPlayerRef.value.changeStreamType(newType);
  }
});

watch(() => props.liveFeedStatus, (newStatus) => {
  internalLiveFeedStatus.value = newStatus;
});

onUnmounted(() => {
  clearCustomTimeout();
});
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <template v-if="effectiveLiveFeedStatus === 'Inactive'">
      <div class="border border-new-gray-300 rounded-lg p-3 bg-white overflow-y-auto mb-2">
        <p class="font-medium">The device is offline</p>
      </div>
    </template>

    <template v-else>
      <div v-if="!parsedAvailableCameras.length" class="flex w-full">
        <div class="border border-new-gray-300 rounded-lg p-3 bg-white gap-3 w-full flex flex-col mb-2">
          <p class="font-medium">Get the full context with camera recordings.</p>
          <p class="text-sm">For extra information <a href="mailto:vidematics@exeros-tech.co.uk" class="text-main-primary underline">contact Exeros</a></p>
        </div>
      </div>

      <div v-else-if="!hasValidStreams" class="font-bold">
        Invalid cameras configuration
      </div>

      <template v-else>
        <FTCloudCameraSelector
          :available-cameras="parsedAvailableCameras"
          :selected-cameras="selectedCameras"
          :live-feed-status="effectiveLiveFeedStatus"
          :max-selection="maxSelection"
          :max-visible-channels="maxVisibleChannels"
          :stream-type="currentStreamType"
          @selection-change="handleCameraSelection" />

        <div v-if="selectedCameras.length > 0" class="border border-new-gray-300 rounded-lg">
          <div class="w-full overflow-hidden h-[calc(75vh-200px)]">
            <FTCloudVideoPlayer
              v-if="effectiveLiveFeedStatus === 'Active' && isPlaying"
              :key="videoPlayerKey"
              ref="videoPlayerRef"
              :cameras="selectedCameras"
              :config="parsedConfig"
              :headers="parsedHeaders"
              :stream-type="ftCloudStreamType"
              :show-controls="true"
              @state-change="handleStateChange"
              @error="handlePlayerError"
              @play-start="$emit('play-start', $event)"
              @player-ready="handlePlayerReady" />

            <div v-if="!isPlaying && snapshotImages.length > 0"
                 class="w-full h-full grid gap-2 p-2"
                 :class="{
                   'grid-cols-1': snapshotImages.length === 1,
                   'grid-cols-2': snapshotImages.length === 2,
                   'grid-cols-2': snapshotImages.length >= 3
                 }"
                 :style="{
                   gridTemplateRows: snapshotImages.length <= 2 ? '1fr' : '1fr 1fr'
                 }">
              <img v-for="(snapshot, index) in snapshotImages"
                   alt="Camera Stop"
                   :key="index"
                   :src="snapshot.url"
                   :style="{
                     width: snapshot.width + 'px',
                     height: snapshot.height + 'px'
                   }"
                   class="rounded bg-gray-100 justify-self-center">
            </div>
          </div>

          <div v-if="showControls && selectedCameras.length > 0" class="bg-white rounded-b-lg">
            <div class="h-8 w-8 flex mx-auto justify-center items-center border-2 border-main-primary rounded-lg text-main-primary cursor-pointer select-none" @click="handlePlayPause">
              <svg v-if="!isPlaying" width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.9097 13.185C1.57636 13.4017 1.23886 13.4142 0.897197 13.2225C0.55553 13.0308 0.384697 12.735 0.384697 12.335V1.98499C0.384697 1.58499 0.55553 1.28916 0.897197 1.09749C1.23886 0.905822 1.57636 0.918322 1.9097 1.13499L10.0597 6.30999C10.3597 6.50999 10.5097 6.79332 10.5097 7.15999C10.5097 7.52666 10.3597 7.80999 10.0597 8.00999L1.9097 13.185Z" fill="currentColor" />
              </svg>
              <svg v-else width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.3847 14.16C9.8347 14.16 9.36386 13.9642 8.9722 13.5725C8.58053 13.1808 8.3847 12.71 8.3847 12.16V2.15999C8.3847 1.60999 8.58053 1.13916 8.9722 0.747488C9.36386 0.355822 9.8347 0.159988 10.3847 0.159988C10.9347 0.159988 11.4055 0.355822 11.7972 0.747488C12.1889 1.13916 12.3847 1.60999 12.3847 2.15999V12.16C12.3847 12.71 12.1889 13.1808 11.7972 13.5725C11.4055 13.9642 10.9347 14.16 10.3847 14.16ZM2.3847 14.16C1.8347 14.16 1.36386 13.9642 0.972197 13.5725C0.58053 13.1808 0.384697 12.71 0.384697 12.16V2.15999C0.384697 1.60999 0.58053 1.13916 0.972197 0.747488C1.36386 0.355822 1.8347 0.159988 2.3847 0.159988C2.9347 0.159988 3.40553 0.355822 3.7972 0.747488C4.18886 1.13916 4.3847 1.60999 4.3847 2.15999V12.16C4.3847 12.71 4.18886 13.1808 3.7972 13.5725C3.40553 13.9642 2.9347 14.16 2.3847 14.16Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>

        <div v-if="selectedCameras.length === 0" class="border border-new-gray-300 rounded-lg">
          <div class="w-full h-[calc(75vh-200px)] flex items-center justify-center text-gray-500">
            <p>Select camera channels to view livestreams</p>
          </div>
          <div class="bg-white rounded-b-lg">
            <div class="h-8 w-8 flex mx-auto justify-center items-center rounded-lg select-none">
            </div>
          </div>
        </div>
      </template>
    </template>

    <FTCloudTimeoutDialog
      :show="showTimeoutDialog"
      :countdown-time="30"
      @confirmed="handleTimeoutConfirmed"
      @cancelled="handleTimeoutCancelled" />
  </div>
</template>
