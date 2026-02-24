<template>
  <div class="w-full p-5">
    <div class="flex justify-between items-center pb-5">
      <p class="font-medium">Send message</p>
      <div class="rounded-md cursor-pointer bg-anti-flash-white" @click="handleCloseClick" aria-label="Close">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.7279 21.2129L21.2132 12.7276" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21.2132 21.2138L12.7279 12.7285" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>
    <span class="w-full flex-[0_0_1px] bg-platinum py-4"></span>

    <div class="flex flex-col">
      <textarea-control v-model="message" label="Message" placeholder="Enter your message here" :rows="4" :maxlength="300" showCounter :error-message="messageError"></textarea-control>
    </div>

    <div class="flex flex-row gap-6 pb-4">
      <div class="flex items-center gap-2">
        <input type="radio" id="singleDriver" name="recipientType" :value="'DRIVER'" v-model="messageType" class="w-4 h-4 text-main-primary cursor-pointer" />
        <label class="px-2 text-sm" for="singleDriver">Send to one driver</label>
      </div>
      <div class="flex items-center gap-2">
        <input type="radio" id="allDrivers" name="recipientType" :value="'FLEET'" v-model="messageType" class="w-4 h-4 text-main-primary cursor-pointer" />
        <label class="px-2 text-sm" for="allDrivers">Send to all drivers in the fleet</label>
      </div>
    </div>

    <div class="space-b-[-50px]">
      <select-control v-model.number="selectedFleetId" label="Fleet" :options="fleetOptions" :error-message="fleetError" @input="handleFleetChange"></select-control>
    </div>

    <div class="space-t-[-50px] pb-4" v-if="messageType === 'DRIVER'">
      <div class="mb-1">
        <text-control v-model="driverSearch" label="Search Driver" placeholder="Search by driver name" @input="handleDriverSearchChange"></text-control>
      </div>

      <div class="max-h-60 overflow-y-auto">
        <div v-if="driversInFleet.length === 0" class="p-3 text-gray-500">No drivers found in this fleet</div>
        <div v-for="driver in driversInFleet" :key="driver.id" class="flex items-center p-3 hover:bg-gray-50 cursor-pointer" @click="selectDriver(driver)">
          <input type="radio" :id="'driver-' + driver.id" name="driverSelect" :checked="selectedRecipientId === driver.id" class="mr-3" />
          <label :for="'driver-' + driver.id" class="w-full cursor-pointer flex justify-between text-xs font-normal ml-2">
            <span>{{ driver.name }}</span>
          </label>
        </div>
      </div>
    </div>

    <span class="w-full flex-[0_0_1px] bg-platinum py-4"></span>

    <div class="flex justify-end pt-8">
      <button class="px-4 py-2 bg-main-primary text-white rounded-md disabled:opacity-50" :disabled="!isValid" @click="handleSendClick">Send message</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import TextareaControl from '../shared/text-area/TextArea.vue';
import TextControl from '../shared/text-control/TextControl.vue';
import SelectControl from '../shared/select-control/SelectControl.vue';

const MESSAGE_TYPE_DRIVER = 'DRIVER';
const MESSAGE_TYPE_FLEET = 'FLEET';

const props = defineProps({
  driverData: String,
  dialogVisible: String,
  fleetTreeData: String,
  driversData: String,
  initialFleetId: Number
});

const message = ref('');
const messageError = ref('');
const messageType = ref(MESSAGE_TYPE_DRIVER);
const selectedFleetId = ref(1);
const selectedRecipientId = ref(null);
const fleetError = ref('');
const fleetOptions = ref([]);
const driversInFleet = ref([]);
const driverSearch = ref('');
const initialDriverId = ref(null);

const isDirty = computed(() => !!message.value.trim());
const isValid = computed(() => {
  if (!isDirty.value) return false;
  if (!selectedFleetId.value) return false;

  if (messageType.value === MESSAGE_TYPE_FLEET) {
    return true;
  }

  return !!selectedRecipientId.value;
});

function parseFleetTreeData() {
  if (!props.fleetTreeData) return;

  const parsedData = JSON.parse(props.fleetTreeData);

  fleetOptions.value = parsedData.map(fleet => ({
    label: fleet.label,
    value: parseInt(fleet.value, 10)
  }));
}

function parseDriversData() {
  if (!props.driversData) return;

  try {
    const parsedDrivers = JSON.parse(props.driversData);

    driversInFleet.value = parsedDrivers;

    if (selectedRecipientId.value) {
      driversInFleet.value = driversInFleet.value.map(driver => ({
        ...driver,
        selected: driver.id === selectedRecipientId.value
      }));
    }
  } catch (e) {
    console.error('Error parsing drivers data:', e);
  }
}

function handleFleetChange(fleetId) {
  const parsedId = typeof fleetId === 'string' ? parseInt(fleetId, 10) : Number(fleetId);

  if (!parsedId && parsedId !== 0) return;

  const event = new CustomEvent('fleet-changed', {
    bubbles: true,
    composed: true,
    detail: parsedId
  });
  window.dispatchEvent(event);

  if (selectedFleetId.value !== parsedId) {
    selectedRecipientId.value = null;
    driverSearch.value = '';
  }

  selectedFleetId.value = parsedId;

  if (messageType.value === MESSAGE_TYPE_FLEET) {
    selectedRecipientId.value = parsedId;
    notifyRecipientSelected();
  }
}

function handleDriverSearchChange(value) {
  const searchValue = typeof value === 'string' ? value : value?.target?.value || '';
  driverSearch.value = searchValue;

  const event = new CustomEvent('driver-search-changed', {
    bubbles: true,
    composed: true,
    detail: {
      search: searchValue,
      fleetId: selectedFleetId.value
    }
  });
  window.dispatchEvent(event);
}

function selectDriver(driver) {
  if (!driver) {
    return;
  }

  initialDriverId.value = driver.id;
  selectedRecipientId.value = driver.id;

  if (driversInFleet.value.length > 0) {
    driversInFleet.value = driversInFleet.value.map(d => ({
      ...d,
      selected: d.id === driver.id
    }));
  }

  notifyRecipientSelected();
}

function notifyMessageTypeChanged() {
  const event = new CustomEvent('message-type-changed', {
    bubbles: true,
    composed: true,
    detail: messageType.value
  });
  window.dispatchEvent(event);

  if (messageType.value === MESSAGE_TYPE_FLEET && selectedFleetId.value) {
    selectedRecipientId.value = parseInt(selectedFleetId.value);
    notifyRecipientSelected();
  } else if (initialDriverId.value && messageType.value === MESSAGE_TYPE_DRIVER) {
    selectedRecipientId.value = initialDriverId.value;
    notifyRecipientSelected();
  } else {
    selectedRecipientId.value = null;
  }
}

onMounted(() => {
  parseFleetTreeData();
  parseDriversData();

  if (selectedFleetId.value === 1) {
    handleFleetChange(1);
  }

  if (props.driverData) {
    const driverData = JSON.parse(props.driverData);

    initialDriverId.value = driverData.id;
    selectedRecipientId.value = driverData.id;
    messageType.value = MESSAGE_TYPE_DRIVER;

    notifyRecipientSelected();
  }
});
function notifyRecipientSelected() {
  const data = {
    type: messageType.value,
    id: selectedRecipientId.value
  };

  const event = new CustomEvent('recipient-selected', {
    bubbles: true,
    composed: true,
    detail: JSON.stringify(data)
  });
  window.dispatchEvent(event);
}

function handleCloseClick() {
  const event = new CustomEvent('dialog-closed', {
    bubbles: true,
    composed: true
  });
  window.dispatchEvent(event);
}

function handleSendClick() {
  if (!isValid.value) return;

  messageError.value = '';
  fleetError.value = '';

  let receiverId;

  if (messageType.value === MESSAGE_TYPE_FLEET) {
    receiverId = parseInt(selectedFleetId.value);
  } else {
    receiverId = selectedRecipientId.value;
  }

  const messageData = {
    message_type: messageType.value,
    receiver_id: receiverId,
    message: message.value
  };

  const event = new CustomEvent('message-sent', {
    bubbles: true,
    composed: true,
    detail: JSON.stringify(messageData)
  });
  window.dispatchEvent(event);
}

watch(messageType, () => {
  notifyMessageTypeChanged();
});

defineExpose({
  openWithDriver(driver) {
    if (!driver) return;

    const driverData = typeof driver === 'string' ? JSON.parse(driver) : driver;

    initialDriverId.value = driverData.id;
    selectedRecipientId.value = driverData.id;
    messageType.value = MESSAGE_TYPE_DRIVER;

    if (driversInFleet.value.length > 0) {
      driversInFleet.value = driversInFleet.value.map(d => ({
        ...d,
        selected: d.id === driverData.id
      }));
    }

    notifyRecipientSelected();
  }
});

watch(
  () => props.driverData,
  newVal => {
    if (!newVal) return;
    try {
      const driverData = JSON.parse(newVal);

      initialDriverId.value = driverData.id;
      selectedRecipientId.value = driverData.id;

      if (driversInFleet.value.length > 0) {
        driversInFleet.value = driversInFleet.value.map(d => ({
          ...d,
          selected: d.id === driverData.id
        }));
      }

      if (messageType.value === MESSAGE_TYPE_DRIVER) {
        notifyRecipientSelected();
      }
    } catch (e) {
      console.error('Error parsing driver data from prop:', e);
    }
  },
  { immediate: true }
);

watch(
  () => props.fleetTreeData,
  () => {
    parseFleetTreeData();
  },
  { immediate: true }
);

watch(
  () => props.driversData,
  () => {
    parseDriversData();
  },
  { immediate: true }
);

onMounted(() => {
  parseFleetTreeData();
  parseDriversData();

  if (selectedFleetId.value === 1) {
    handleFleetChange(1);
  }

  if (props.driverData) {
    const driverData = JSON.parse(props.driverData);

    initialDriverId.value = driverData.id;
    selectedRecipientId.value = driverData.id;
    messageType.value = MESSAGE_TYPE_DRIVER;

    notifyRecipientSelected();
  }
});
</script>
