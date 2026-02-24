import { defineCustomElement } from 'vue';
import Dashboard from './Dashboard.vue';
import DriverMessageDialog from './drivers/DriversMessageDialog.vue';
import EventsStatus from './events/events-core/EventsStatus.vue';
import KudosButton from './shared/kudos-button/KudosButton.vue';
import FTCloudLive from './providers/ft-cloud/components/FTCloudLive.vue';
import FTCloudPlayback from './providers/ft-cloud/components/FTCloudPlayback.vue';
import EventsVideo from './events/events-core/EventsVideo.vue';
import SettingsCoreAppSettings from './settings/settings-core/settings-core-app-settings/SettingsCoreAppSettings.vue';
import SettingsCoreAppSettingsAddSetting from './settings/settings-core/settings-core-app-settings/SettingsCoreAppSettingsAddSetting.vue';

import 'element-plus/dist/index.css';
import './style/formStyles.js';
import './style/main.css';

const DashboardElement = defineCustomElement(Dashboard, {
  shadowRoot: false
});

const DriverMessageDialogElement = defineCustomElement(DriverMessageDialog, {
  shadowRoot: false
});

const KudosButtonElement = defineCustomElement(KudosButton, {
  shadowRoot: false
});

const EventsStatusElement = defineCustomElement(EventsStatus, {
  shadowRoot: false
});

const FTCloudLiveElement = defineCustomElement(FTCloudLive, { shadowRoot: false });
const FTCloudPlaybackElement = defineCustomElement(FTCloudPlayback, { shadowRoot: false });

const EventsVideoElement = defineCustomElement(EventsVideo, {
  shadowRoot: false
});

const SettingsCoreAppSettingsElement = defineCustomElement(SettingsCoreAppSettings, {
  shadowRoot: false
});

const SettingsCoreAppAddSettingElement = defineCustomElement(SettingsCoreAppSettingsAddSetting, {
  shadowRoot: false
});

customElements.define('settings-app-add-dialog', SettingsCoreAppAddSettingElement);
customElements.define('settings-core-app-settings-list', SettingsCoreAppSettingsElement);
customElements.define('events-status', EventsStatusElement);
customElements.define('vue-dashboard', DashboardElement);
customElements.define('driver-message-dialog', DriverMessageDialogElement);
customElements.define('vue-kudos-button', KudosButtonElement);

customElements.define('ft-cloud-live', FTCloudLiveElement);
customElements.define('ft-cloud-playback', FTCloudPlaybackElement);

customElements.define('events-video', EventsVideoElement);
