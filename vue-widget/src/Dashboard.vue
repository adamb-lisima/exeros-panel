<template>
  <div v-if="hasAccess" class="grid grid-cols-4 auto-rows-max gap-4">
    <div class="exeros-fragment col-span-4 p-4 mb-4">
      <el-alert title="Element Plus integracja działa poprawnie!" type="success" description="To jest testowy komponent Element Plus" show-icon :closable="false" />

      <div class="mt-4 flex items-center gap-4">
        <el-button type="primary">Element Plus Button</el-button>
        <el-date-picker v-model="testDate" type="date" placeholder="Wybierz datę" format="DD/MM/YYYY" />
        <el-select v-model="testValue" placeholder="Wybierz opcję">
          <el-option v-for="item in testOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </div>

    <div class="exeros-fragment row-start-1 flex flex-col gap-6">
      <p class="font-semibold text-sm">Driver Checks</p>
      <div class="flex justify-between items-center">
        <p class="text-xl">{{ dashboardData?.driver_checks || 0 }}%</p>
        <img src="/assets/svg/icons-gray-back/4-1.svg" width="40" height="40" alt="icon" />
      </div>
    </div>

    <div class="exeros-fragment row-start-1 flex flex-col gap-6">
      <p class="font-semibold text-sm">Accidents</p>
      <div class="flex justify-between items-center">
        <p class="text-xl">{{ dashboardData?.accident_qty || 0 }}</p>
        <img src="/assets/svg/icons-gray-back/54.svg" width="40" height="40" alt="icon" />
      </div>
    </div>

    <div class="exeros-fragment row-start-1 flex flex-col gap-6">
      <p class="font-semibold text-sm">Distance Driven</p>
      <div class="flex justify-between items-center">
        <p class="text-xl">{{ formatDistance(dashboardData?.distance_driven) }} Miles</p>
        <img src="/assets/svg/icons-gray-back/3.svg" width="40" height="40" alt="icon" />
      </div>
    </div>

    <div class="exeros-fragment row-start-1 flex flex-col gap-6">
      <p class="font-semibold text-sm">Online History</p>
      <div class="flex justify-between items-center">
        <p class="text-xl">{{ dashboardData?.mdvr?.active_count || 0 }}/{{ dashboardData?.mdvr?.all_count || 0 }}</p>
        <img src="/assets/svg/icons-gray-back/1.svg" width="40" height="40" alt="icon" />
      </div>
    </div>

    <div class="exeros-fragment row-start-2 col-span-2 h-[340px]">
      <DashboardDrivingTime :dashboard-data="dashboardData" :user-token="userToken" />
    </div>

    <div class="exeros-fragment row-start-2 col-span-2 h-[340px]">
      <DashboardEvents :dashboard-data="dashboardData" :user-token="userToken" />
    </div>

    <div class="exeros-fragment row-start-3 h-[550px]">
      <DashboardVehicleChecks :dashboard-data="dashboardData" :user-token="userToken" />
    </div>

    <div class="exeros-fragment row-start-3 h-[550px]">
      <DashboardAccidents :dashboard-data="dashboardData" :user-token="userToken" />
    </div>

    <div class="exeros-fragment row-start-3 col-span-2 h-[550px]">
      <DashboardMap :dashboard-data="dashboardData" :user-token="userToken" />
    </div>
  </div>

  <div v-else class="p-4 text-center text-gray-500">No access to dashboard</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import DashboardDrivingTime from './dashboard/DashboardDrivingTime.vue';
import DashboardEvents from './dashboard/DashboardEvents.vue';
import DashboardVehicleChecks from './dashboard/DashboardVehicleChecks.vue';
import DashboardAccidents from './dashboard/DashboardAccidents.vue';
import DashboardMap from './dashboard/DashboardMap.vue';

const props = defineProps({
  userToken: String,
  apiUrl: String,
  userPermissions: [String, Array],
  rangeFrom: String,
  rangeTo: String,
  fleetId: [String, Number]
});

const testDate = ref(new Date());
const testValue = ref('');
const testOptions = ref([
  {
    value: 'option1',
    label: 'Option 1'
  },
  {
    value: 'option2',
    label: 'Option 2'
  },
  {
    value: 'option3',
    label: 'Option 3'
  }
]);

const dashboardData = ref(null);
const hasAccess = ref(false);
const loading = ref(false);

const checkPermissions = () => {
  if (props.userPermissions) {
    let permissions;

    if (Array.isArray(props.userPermissions)) {
      permissions = props.userPermissions;
    } else {
      permissions = JSON.parse(props.userPermissions);
    }

    hasAccess.value = permissions.includes('DASHBOARD_VIEWER');
  }
};

const fetchDashboardData = async () => {
  if (!props.userToken || !hasAccess.value || !props.fleetId) {
    return;
  }

  loading.value = true;

  try {
    const params = new URLSearchParams({
      fleet_id: props.fleetId.toString()
    });

    if (props.rangeFrom && props.rangeTo) {
      params.append('from', props.rangeFrom);
      params.append('to', props.rangeTo);
    }

    const url = `${props.apiUrl}/v2/dashboard?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${props.userToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();

      dashboardData.value = result.data || result;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkPermissions();
  if (hasAccess.value) {
    fetchDashboardData();
  }
});

const formatDistance = distance => {
  if (!distance) return 0;
  return Math.round(distance).toLocaleString();
};

watch(
  [() => props.userToken, () => props.fleetId, () => props.rangeFrom, () => props.rangeTo],
  (newValues, oldValues) => {

    if (hasAccess.value) {
      fetchDashboardData();
    }
  },
  {
    deep: true,
    immediate: false
  }
);

watch(
  () => props.userPermissions,
  () => {
    checkPermissions();
    if (hasAccess.value) {
      fetchDashboardData();
    }
  }
);
</script>
