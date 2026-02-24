<template>
  <div class="w-full flex-1 flex flex-col pb-5 h-[calc(80vh-64px)]">
    <div class="flex items-center gap-6">
      <span class="text-xl font-medium">All app settings</span>
      <button class="px-4 py-2 bg-main-primary text-white rounded-md hover:bg-main-primary-dark" @click="handleCreateSettingsClick">Add app setting</button>
    </div>

    <table class="table-auto">
      <thead>
        <th></th>
        <tr class="border-b border-bright-gray">
          <td class="px-2"></td>
          <td class="px-2 py-2 text-xs text-manatee">Name</td>
          <td class="px-2 text-xs text-manatee">Type</td>
          <td class="px-2 text-xs text-manatee">Input type</td>
          <td class="px-2"></td>
        </tr>
      </thead>

      <tbody v-if="settings?.data">
        <tr v-for="setting in settings.data" :key="setting.id" class="border-b border-bright-gray">
          <td class="px-2 text-sm"></td>
          <td class="px-2 py-4 text-sm">{{ setting.name }}</td>
          <td class="px-2 text-sm">{{ setting.type }}</td>
          <td class="px-2 text-sm">{{ setting.input_type }}</td>
          <td>
            <div class="flex">
              <span @click="handleEditSettingsClick(setting)" class="px-2 text-main-primary text-sm font-semibold underline cursor-pointer">Edit</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-auto">
      <div v-if="settings?.data && settings.data.length > 0">
        <paginator
          class="flex justify-center"
          :info="{
            page: parseInt(currentPage) || 1,
            perPage: parseInt(perPage) || 10,
            totalItems: settings.data.length
          }"
          @page-change="onPageChange">
        </paginator>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsCoreAppSettingsList',
  props: {
    settingsData: {
      type: String,
      default: '[]'
    },
    perPage: {
      type: String,
      default: '10'
    },
    currentPage: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      settings: null
    };
  },
  watch: {
    settingsData: {
      handler(newValue) {
        if (newValue) {
          try {
            this.settings = JSON.parse(newValue);
            console.log('Settings data parsed:', this.settings);
          } catch (e) {
            console.error('Error parsing settings data:', e);
          }
        }
      },
      immediate: true
    }
  },
  mounted() {
    console.log('Settings component mounted');
    console.log('Initial props:', {
      settingsData: this.settingsData,
      perPage: this.perPage,
      currentPage: this.currentPage
    });
  },
  methods: {
    onPageChange(page) {
      const event = new CustomEvent('page-change', {
        detail: page,
        bubbles: true,
        composed: true
      });
      window.dispatchEvent(event);
    },

    handleCreateSettingsClick() {
      const event = new CustomEvent('create-setting', {
        bubbles: true,
        composed: true
      });
      window.dispatchEvent(event);
    },

    handleEditSettingsClick(setting) {
      const event = new CustomEvent('edit-setting', {
        detail: JSON.stringify(setting),
        bubbles: true,
        composed: true
      });
      window.dispatchEvent(event);
    }
  }
};
</script>
