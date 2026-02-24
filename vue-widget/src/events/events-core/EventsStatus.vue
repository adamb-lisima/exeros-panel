<template>
  <div class="flex flex-col gap-2" v-if="event">
    <div class="flex flex-row justify-between items-center">
      <p class="font-semibold text-sm">Status</p>
      <p class="font-semibold text-sm text-right flex flex-row gap-1 items-center" :class="timerColor" title="Counted from occurence time">
        <svg fill="currentColor" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 fill-current fill-black dark:fill-cultured">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier"><path d="M1072.588 960c0 167.266 96.226 245.308 189.29 320.64 116.555 94.532 247.793 200.922 261.346 526.419H396.07c13.553-325.497 144.79-431.887 261.345-526.419 93.064-75.332 189.29-153.374 189.29-320.64s-96.226-245.308-189.29-320.64C540.86 544.828 409.623 438.438 396.07 112.941h1127.153c-13.553 325.497-144.791 431.887-261.346 526.419-93.064 75.332-189.29 153.374-189.29 320.64m260.443-232.998c135.529-109.891 304.263-246.663 304.263-670.531V0H282v56.47c0 423.869 168.734 560.64 304.264 670.532 88.771 72.057 147.5 119.605 147.5 232.998 0 113.393-58.729 160.941-147.5 232.998C450.734 1302.889 282 1439.66 282 1863.529V1920h1355.294v-56.47c0-423.869-168.734-560.64-304.263-670.532-88.772-72.057-147.502-119.605-147.502-232.998 0-113.393 58.73-160.941 147.502-232.998M933.84 1274.665l-169.638 137.676c-74.315 60.197-138.353 112.037-172.687 225.317h736.264c-34.334-113.28-98.372-165.12-172.687-225.317l-169.638-137.676c-15.021-12.197-36.593-12.197-51.614 0" fill-rule="evenodd"></path></g>
        </svg>
        {{ event.status === 'REVIEW_REQUIRED' ? eventTimer : timeDifference }}
      </p>
    </div>
    <div class="flex flex-row justify-between items-center">
      <p class="font-semibold text-sm"></p>
      <p class="font-semibold text-sm text-right flex flex-row gap-1 items-center" :class="timerColorFromAdded" title="Counted from added to Vidematics time">
        <svg fill="currentColor" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 fill-current fill-black dark:fill-cultured">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier"><path d="M1072.588 960c0 167.266 96.226 245.308 189.29 320.64 116.555 94.532 247.793 200.922 261.346 526.419H396.07c13.553-325.497 144.79-431.887 261.345-526.419 93.064-75.332 189.29-153.374 189.29-320.64s-96.226-245.308-189.29-320.64C540.86 544.828 409.623 438.438 396.07 112.941h1127.153c-13.553 325.497-144.791 431.887-261.346 526.419-93.064 75.332-189.29 153.374-189.29 320.64m260.443-232.998c135.529-109.891 304.263-246.663 304.263-670.531V0H282v56.47c0 423.869 168.734 560.64 304.264 670.532 88.771 72.057 147.5 119.605 147.5 232.998 0 113.393-58.729 160.941-147.5 232.998C450.734 1302.889 282 1439.66 282 1863.529V1920h1355.294v-56.47c0-423.869-168.734-560.64-304.263-670.532-88.772-72.057-147.502-119.605-147.502-232.998 0-113.393 58.73-160.941 147.502-232.998M933.84 1274.665l-169.638 137.676c-74.315 60.197-138.353 112.037-172.687 225.317h736.264c-34.334-113.28-98.372-165.12-172.687-225.317l-169.638-137.676c-15.021-12.197-36.593-12.197-51.614 0" fill-rule="evenodd"></path></g>
        </svg>
        {{ (event.last_status || event.status) === 'REVIEW_REQUIRED' ? eventTimerFromAdded : timeDifferenceFromAdded }}
      </p>
    </div>
    <div class="flex items-center gap-4">
      <a class="flex-1 px-3 py-2 rounded-xl border border-extra-one font-medium text-sm text-center transition-all" :class="isStatusSelected('ESCALATED') ? 'cursor-not-allowed text-white bg-extra-one' : 'cursor-pointer text-extra-one hover:border-main-primary'" @click="handleStatusClick('ESCALATED')"> Escalate </a>
      <a class="flex-1 px-3 py-2 rounded-xl border border-extra-one font-medium text-sm text-center transition-all" :class="isStatusSelected('DO_NOT_ESCALATE') ? 'cursor-not-allowed text-white bg-extra-one' : 'cursor-pointer text-extra-one hover:border-main-primary'" @click="handleStatusClick('DO_NOT_ESCALATE')"> Do Not Escalate </a>
      <a class="flex-1 px-3 py-2 rounded-xl border border-extra-two font-medium text-sm text-center transition-all" :class="isStatusSelected('FALSE_EVENT') || event.driver_requested_status_change ? 'cursor-not-allowed text-white bg-extra-two' : 'cursor-pointer text-extra-two hover:border-main-primary'" @click="handleStatusClick('FALSE_EVENT')">
        <span v-if="event.driver_requested_status_change" class="bg-[#f24822] rounded-sm text-xs text-white px-2 py-0.5">flagged as false by driver</span>
        <span v-else>False Alarm</span>
      </a>
    </div>
    <div class="relative">
      <div class="absolute bg-extra-one w-0.5 h-3" style="left: 15.5%"></div>
      <div class="absolute bg-extra-one w-0.5 h-3" style="left: 49.5%"></div>
      <div class="h-0.5 bg-extra-one mt-2.5" style="width: 34%; margin-left: 15.5%"></div>
      <div class="mt-1 text-xs" style="margin-left: 28%">Valid Event</div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  name: 'EventStatusComponent',
  props: {
    eventData: {
      type: String,
      default: '{}'
    },
    userData: {
      type: String,
      default: '{}'
    }
  },
  data() {
    return {
      eventTimer: '00:00:00',
      eventTimerFromAdded: '00:00:00',
      timerColor: '',
      timerColorFromAdded: '',
      intervalId: null,
      intervalIdFromAdded: null,
      startTime: null,
      startTimeFromAdded: null,
      timeDifference: null,
      timeDifferenceFromAdded: null,
      showTimer: true,
      showTimerFromAdded: true
    };
  },
  computed: {
    event() {
      try {
        return JSON.parse(this.eventData);
      } catch (e) {
        console.error('Error parsing event data:', e);
        return null;
      }
    },
    loggedInUser() {
      try {
        return JSON.parse(this.userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
  },
  watch: {
    eventData: {
      handler(newValue) {
        if (newValue) {
          this.resetTimers();
          this.initializeTimers();
        }
      },
      immediate: true
    }
  },
  created() {
    this.initializeTimers();
  },
  beforeUnmount() {
    this.stopTimer();
    this.stopTimerFromAdded();
  },
  methods: {
    resetTimers() {
      this.stopTimer();
      this.stopTimerFromAdded();
      this.timeDifference = null;
      this.timeDifferenceFromAdded = null;
      this.eventTimer = '00:00:00';
      this.eventTimerFromAdded = '00:00:00';
      this.timerColor = '';
      this.timerColorFromAdded = '';
      this.showTimer = true;
      this.showTimerFromAdded = true;
    },

    initializeTimers() {
      if (!this.event) return;

      this.setupStartTimes();
      this.processReviewTimes();
      this.setupAppropriateTimers();
    },

    setupStartTimes() {
      if (this.event.occurence_start_time) {
        this.startTime = this.parseDateTime(this.event.occurence_start_time);
      }

      if (this.event.event_added_at) {
        this.startTimeFromAdded = this.parseDateTime(this.event.event_added_at);
      }
    },

    parseDateTime(dateTimeString) {
      return DateTime.fromFormat(dateTimeString, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/London' });
    },

    processReviewTimes() {
      if (!this.event.review_time) return;

      const reviewTime = this.parseDateTime(this.event.review_time);
      if (!reviewTime.isValid) return;

      this.processMainTimer(reviewTime);
      this.processAddedTimer(reviewTime);
    },

    processMainTimer(reviewTime) {
      if (!this.startTime) return;

      if (this.startTime > reviewTime) {
        this.showTimer = false;
      } else {
        this.calculateTimeDifference();
      }
    },

    processAddedTimer(reviewTime) {
      if (!this.startTimeFromAdded) return;

      if (this.startTimeFromAdded > reviewTime) {
        this.showTimerFromAdded = false;
      } else {
        this.calculateTimeDifferenceFromAdded();
      }
    },

    setupAppropriateTimers() {
      if (this.event.status === 'REVIEW_REQUIRED') {
        this.startTimer();
        this.startTimerFromAdded();
      } else {
        this.calculateTimeDifference();
        this.calculateTimeDifferenceFromAdded();
      }
    },

    startTimer() {
      this.stopTimer();

      this.intervalId = setInterval(() => {
        if (this.startTime) {
          const now = DateTime.now().setZone('Europe/London');
          const seconds = Math.floor(now.diff(this.startTime, 'seconds').seconds);
          this.eventTimer = this.formatTime(seconds);
          this.timerColor = this.getTimerColor(seconds);
        }
      }, 1000);
    },

    startTimerFromAdded() {
      this.stopTimerFromAdded();

      this.intervalIdFromAdded = setInterval(() => {
        if (this.startTimeFromAdded) {
          const now = DateTime.now().setZone('Europe/London');
          const seconds = Math.floor(now.diff(this.startTimeFromAdded, 'seconds').seconds);
          this.eventTimerFromAdded = this.formatTime(seconds);
          this.timerColorFromAdded = this.getTimerColor(seconds);
        }
      }, 1000);
    },

    stopTimer() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    stopTimerFromAdded() {
      if (this.intervalIdFromAdded) {
        clearInterval(this.intervalIdFromAdded);
        this.intervalIdFromAdded = null;
      }
    },

    calculateTimeDifference() {
      if (!this.event?.review_time) return;

      const reviewTime = DateTime.fromFormat(this.event.review_time, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/London' });
      if (this.startTime && reviewTime.isValid) {
        const seconds = Math.floor(reviewTime.diff(this.startTime, 'seconds').seconds);
        this.timeDifference = this.formatTime(seconds);
        this.timerColor = this.getTimerColor(seconds);
        this.eventTimer = this.timeDifference;
      }
    },

    calculateTimeDifferenceFromAdded() {
      if (!this.event?.review_time) return;

      const reviewTime = DateTime.fromFormat(this.event.review_time, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/London' });
      if (this.startTimeFromAdded && reviewTime.isValid) {
        const seconds = Math.floor(reviewTime.diff(this.startTimeFromAdded, 'seconds').seconds);
        this.timeDifferenceFromAdded = this.formatTime(seconds);
        this.timerColorFromAdded = this.getTimerColor(seconds);
        this.eventTimerFromAdded = this.timeDifferenceFromAdded;
      }
    },

    formatTime(seconds) {
      if (seconds < 0) {
        seconds = Math.abs(seconds);
      }
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    getTimerColor(seconds) {
      const minutes = seconds / 60;
      if (minutes < 5) return 'text-extra-one';
      if (minutes < 6) return 'text-main-primary';
      return 'text-extra-two';
    },

    isStatusSelected(status) {
      if (!this.event || !this.loggedInUser) return false;

      if (status === 'FALSE_EVENT' && this.event.driver_requested_status_change === true) {
        return true;
      }

      return this.event.status === status || (this.loggedInUser.reviewer_level === 'LEVEL_2' && this.event.level2_status === status);
    },

    handleStatusClick(status) {
      if (!this.event || !this.loggedInUser) return;

      if (this.isStatusSelected(status)) {
        return;
      }

      const event = new CustomEvent('status-change', {
        detail: {
          status,
          event: this.event
        },
        bubbles: true,
        composed: true
      });

      window.dispatchEvent(event);
    },

    humanize(text) {
      if (!text) return '';

      return text
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, a => a.toUpperCase());
    }
  }
};
</script>
