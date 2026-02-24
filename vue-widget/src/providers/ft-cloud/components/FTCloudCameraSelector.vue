<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  availableCameras: {
    type: [Array, String],
    default: () => []
  },
  selectedCameras: {
    type: Array,
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
  streamType: {
    type: String,
    default: 'main_stream'
  }
});

const emit = defineEmits(['selectionChange']);

const isOpen = ref(false);
const hoveredButton = ref(null);
const hoveredDropdownItem = ref(null);
const showMaxError = ref(false);
const activeTooltip = ref(null);

const parsedAvailableCameras = computed(() => {
  let cameras = props.availableCameras;
  if (typeof cameras === 'string') {
    cameras = JSON.parse(cameras);
  }
  return Array.isArray(cameras) ? cameras : [];
});

const visibleCameras = computed(() => {
  return parsedAvailableCameras.value.slice(0, props.maxVisibleChannels);
});

const hiddenCameras = computed(() => {
  return parsedAvailableCameras.value.slice(props.maxVisibleChannels);
});

const isSelected = camera => {
  return props.selectedCameras.some(selected => selected.channel === camera.channel);
};

const getTooltipText = camera => {
  const selected = isSelected(camera);
  if (!selected && props.selectedCameras.length >= props.maxSelection) {
    return 'Maximum 4 cameras can be selected';
  }
  return null;
};

const getCameraButtonStyle = (camera, isHovered) => {
  const selected = isSelected(camera);
  const isDisabled = !selected && props.selectedCameras.length >= props.maxSelection;

  const hoveredBackgroundColor = selected ? '#f8f8f8' : '#e8e8e8';
  const normalBackgroundColor = selected ? 'white' : '#f5f5f5';
  const backgroundColor = isHovered ? hoveredBackgroundColor : normalBackgroundColor;

  const selectedBorderColor = selected ? '#e0e0e0' : '#f5f5f5';
  const borderColor = isHovered ? '#d0d0d0' : selectedBorderColor;

  return {
    display: 'flex',
    gap: '8px',
    padding: '8px 8px',
    borderRadius: '12px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    alignItems: 'center',
    backgroundColor,
    borderColor,
    transition: 'all 0.2s ease',
    position: 'relative'
  };
};

const getMoreButtonStyle = isHovered => {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 6px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginLeft: 'auto',
    backgroundColor: isHovered ? '#f1f1f1' : 'transparent',
    transition: 'background-color 0.2s ease'
  };
};

const handleMouseEnter = (key, camera) => {
  hoveredButton.value = key;
  const tooltipText = getTooltipText(camera);
  if (tooltipText) {
    activeTooltip.value = key;
  }
};

const handleMouseLeave = () => {
  hoveredButton.value = null;
  activeTooltip.value = null;
};

const handleDropdownMouseEnter = (channel, camera) => {
  hoveredDropdownItem.value = channel;
  const tooltipText = getTooltipText(camera);
  if (tooltipText) {
    activeTooltip.value = `dropdown-${channel}`;
  }
};

const handleDropdownMouseLeave = () => {
  hoveredDropdownItem.value = null;
  activeTooltip.value = null;
};

const handleCameraClick = camera => {
  const currentlySelected = isSelected(camera);

  if (!currentlySelected && props.selectedCameras.length >= props.maxSelection) {
    showMaxError.value = true;
    setTimeout(() => {
      showMaxError.value = false;
    }, 3000);
    return;
  }

  let newSelection;
  if (currentlySelected) {
    newSelection = props.selectedCameras.filter(selected => selected.channel !== camera.channel);
  } else {
    newSelection = [
      ...props.selectedCameras,
      {
        provider: camera.provider,
        channel: camera.channel,
        stream: camera[props.streamType],
        has_playback_fixed: false,
        provider_details: camera.provider_details,
        deviceId: camera.stream,
        devId: camera.stream,
        channels: camera.channel
      }
    ];
  }

  emit('selectionChange', newSelection);
  isOpen.value = false;
};
</script>

<template>
  <div
    v-if="showMaxError"
    :style="{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-80%)',
      backgroundColor: '#ffffff',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '4px',
      fontSize: '14px',
      zIndex: '10001'
    }">
    Maximum 4 cameras can be selected
  </div>

  <div style="display: flex; gap: 8px; align-items: center">
    <span style="font-size: 14px">Show channels:</span>

    <div v-for="camera in visibleCameras" :key="camera.channel" :style="getCameraButtonStyle(camera, hoveredButton === `visible-${camera.channel}`)" @click="handleCameraClick(camera)" @mouseenter="handleMouseEnter(`visible-${camera.channel}`, camera)" @mouseleave="handleMouseLeave">
      <div
        v-if="activeTooltip === `visible-${camera.channel}` && getTooltipText(camera)"
        :style="{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 12px',
          backgroundColor: '#ffffff',
          color: 'white',
          fontSize: '12px',
          lineHeight: '1.4',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          zIndex: '10000',
          pointerEvents: 'none'
        }">
        {{ getTooltipText(camera) }}
        <div
          :style="{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-80%)',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(97, 97, 97, 0.95)'
          }"></div>
      </div>

      <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13.8333C11.3807 13.8333 12.5 12.7141 12.5 11.3333C12.5 9.95258 11.3807 8.83333 10 8.83333C8.61925 8.83333 7.5 9.95258 7.5 11.3333C7.5 12.7141 8.61925 13.8333 10 13.8333Z" stroke="currentColor" stroke-width="1.06" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M2.5 14.5V8.16666C2.5 7.23324 2.5 6.76653 2.68166 6.41001C2.84144 6.0964 3.09641 5.84144 3.41002 5.68165C3.76653 5.49999 4.23325 5.49999 5.16667 5.49999H6.04553C6.14798 5.49999 6.19921 5.5 6.24647 5.49458C6.49305 5.46634 6.71421 5.32965 6.84974 5.12174C6.87572 5.08189 6.89863 5.03606 6.94444 4.94444C7.03608 4.76118 7.08189 4.66955 7.13385 4.58985C7.40492 4.17401 7.84723 3.90064 8.34042 3.84415C8.43492 3.83333 8.53733 3.83333 8.74225 3.83333H11.2577C11.4627 3.83333 11.5651 3.83333 11.6596 3.84415C12.1527 3.90064 12.5951 4.17401 12.8662 4.58985C12.9181 4.66954 12.9639 4.7612 13.0556 4.94444C13.1013 5.03607 13.1242 5.08189 13.1502 5.12174C13.2858 5.32965 13.5069 5.46634 13.7535 5.49458C13.8008 5.5 13.852 5.49999 13.9545 5.49999H14.8333C15.7667 5.49999 16.2335 5.49999 16.59 5.68165C16.9036 5.84144 17.1586 6.0964 17.3183 6.41001C17.5 6.76653 17.5 7.23324 17.5 8.16666V14.5C17.5 15.4334 17.5 15.9002 17.3183 16.2567C17.1586 16.5702 16.9036 16.8252 16.59 16.985C16.2335 17.1667 15.7667 17.1667 14.8333 17.1667H5.16667C4.23325 17.1667 3.76653 17.1667 3.41002 16.985C3.09641 16.8252 2.84144 16.5702 2.68166 16.2567C2.5 15.9002 2.5 15.4334 2.5 14.5Z" stroke="currentColor" stroke-width="1.06" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ camera.name }}
    </div>

    <div v-if="parsedAvailableCameras.length > maxVisibleChannels" style="position: relative; margin-left: auto">
      <div :style="getMoreButtonStyle(hoveredButton === 'more')" @click="isOpen = !isOpen" @mouseenter="hoveredButton = 'more'" @mouseleave="hoveredButton = null">
        <span style="text-decoration: underline; color: #ee8444; font-size: 14px; font-weight: 500"> {{ parsedAvailableCameras.length - maxVisibleChannels }} more </span>
      </div>

      <div
        v-if="isOpen"
        :style="{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '4px',
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
          padding: '8px',
          zIndex: '9999',
          minWidth: '192px'
        }">
        <div style="display: flex; flex-direction: column; gap: 8px">
          <div v-for="camera in hiddenCameras" :key="camera.channel" :style="getCameraButtonStyle(camera, hoveredDropdownItem === camera.channel)" @click="handleCameraClick(camera)" @mouseenter="handleDropdownMouseEnter(camera.channel, camera)" @mouseleave="handleDropdownMouseLeave">
            <div
              v-if="activeTooltip === `dropdown-${camera.channel}` && getTooltipText(camera)"
              :style="{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-80%)',
                padding: '6px 12px',
                backgroundColor: '#ffffff',
                color: 'black',
                fontSize: '12px',
                lineHeight: '1.4',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                zIndex: '10000',
                pointerEvents: 'none'
              }">
              {{ getTooltipText(camera) }}
            </div>

            <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13.8333C11.3807 13.8333 12.5 12.7141 12.5 11.3333C12.5 9.95258 11.3807 8.83333 10 8.83333C8.61925 8.83333 7.5 9.95258 7.5 11.3333C7.5 12.7141 8.61925 13.8333 10 13.8333Z" stroke="currentColor" stroke-width="1.06" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2.5 14.5V8.16666C2.5 7.23324 2.5 6.76653 2.68166 6.41001C2.84144 6.0964 3.09641 5.84144 3.41002 5.68165C3.76653 5.49999 4.23325 5.49999 5.16667 5.49999H6.04553C6.14798 5.49999 6.19921 5.5 6.24647 5.49458C6.49305 5.46634 6.71421 5.32965 6.84974 5.12174C6.87572 5.08189 6.89863 5.03606 6.94444 4.94444C7.03608 4.76118 7.08189 4.66955 7.13385 4.58985C7.40492 4.17401 7.84723 3.90064 8.34042 3.84415C8.43492 3.83333 8.53733 3.83333 8.74225 3.83333H11.2577C11.4627 3.83333 11.5651 3.83333 11.6596 3.84415C12.1527 3.90064 12.5951 4.17401 12.8662 4.58985C12.9181 4.66954 12.9639 4.7612 13.0556 4.94444C13.1013 5.03607 13.1242 5.08189 13.1502 5.12174C13.2858 5.32965 13.5069 5.46634 13.7535 5.49458C13.8008 5.5 13.852 5.49999 13.9545 5.49999H14.8333C15.7667 5.49999 16.2335 5.49999 16.59 5.68165C16.9036 5.84144 17.1586 6.0964 17.3183 6.41001C17.5 6.76653 17.5 7.23324 17.5 8.16666V14.5C17.5 15.4334 17.5 15.9002 17.3183 16.2567C17.1586 16.5702 16.9036 16.8252 16.59 16.985C16.2335 17.1667 15.7667 17.1667 14.8333 17.1667H5.16667C4.23325 17.1667 3.76653 17.1667 3.41002 16.985C3.09641 16.8252 2.84144 16.5702 2.68166 16.2567C2.5 15.9002 2.5 15.4334 2.5 14.5Z" stroke="currentColor" stroke-width="1.06" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ camera.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
