<template>
  <div class="events-video-container">
    <div v-if="parsedMode === 'screenshot'">
      <div v-if="parsedEvent">
        <div v-if="parsedEvent.thumbs && parsedEvent.thumbs.length" class="flex flex-col items-center gap-4">
          <template v-for="(thumb, i) in parsedEvent.thumbs" :key="i">
            <img v-if="i < parsedEvent.cameras?.length" class="w-fit" height="500px" :src="thumb" alt="thumb" />
          </template>
        </div>
        <p v-else class="font-bold">There are no cameras available</p>
      </div>
    </div>

    <div v-else>
      <div v-if="parsedEvent">
        <div v-if="isYawnPrediction(parsedEvent)" class="flex flex-col gap-4 mb-4">
          <div class="flex flex-row items-center p-2 gap-2 bg-[#F1F1F1] rounded-lg w-full h-[129px] relative">
            <button class="w-8 h-8 flex items-center justify-center" @click="prevSlide">
              <i class="material-icons text-[#1C1B1B]">arrow_left</i>
            </button>

            <div class="flex flex-row gap-2 flex-1 justify-center">
              <div v-for="(relation, i) in getVisibleRelations(parsedEvent.relations)" :key="i" class="flex flex-col justify-center items-center p-1 gap-1 rounded w-[183.33px] h-[113px] cursor-pointer" :class="[i + Math.floor(activeTabIndex / getVisibleTabsCount()) * getVisibleTabsCount() === activeTabIndex ? 'bg-[#EE8444]' : 'bg-white']" @click="onTabClick(i + Math.floor(activeTabIndex / getVisibleTabsCount()) * getVisibleTabsCount())" @keydown.enter="onTabClick(i + Math.floor(activeTabIndex / getVisibleTabsCount()) * getVisibleTabsCount())">
                <div class="relative w-[175.33px] h-[80px] rounded">
                  <img alt="img" :src="getFirstThumb(relation)" class="w-full h-full object-cover rounded" :style="{ background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))' }" />
                  <button class="absolute inset-0 m-auto w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                    <i class="material-icons text-black">play_arrow</i>
                  </button>
                </div>
                <span class="text-sm font-medium font-['Poppins']" :class="[i + Math.floor(activeTabIndex / getVisibleTabsCount()) * getVisibleTabsCount() === activeTabIndex ? 'text-white' : 'text-[#454E49]']">
                  {{ formatOccupationTime(relation.occupation_time) }}
                </span>
              </div>
            </div>

            <button class="w-8 h-8 flex items-center justify-center" @click="nextSlide">
              <i class="material-icons text-[#1C1B1B]">arrow_right</i>
            </button>
          </div>
        </div>

        <div v-if="cameras.length" class="flex flex-col gap-4 relative">
          <template v-for="(camera, i) in cameras" :key="camera.key">
            <VideoMP4 v-if="camera.stream" :source="getCamera(camera)" :current-event="parsedEvent" @state-change="state => handleStateChange(i, state)" @time-update="handleTimeUpdate" class="max-w-[900px] w-full mx-auto" />
            <img v-else class="max-w-[900px] w-full mx-auto" :src="camera.picture" alt="thumb" />
          </template>

          <div
            v-if="parsedEvent.driver_requested_status_change && hasEventEditorAccess"
            :style="{
              position: 'absolute',
              bottom: '48px',
              left: '0',
              right: '0',
              zIndex: '1',
              backgroundColor: 'white',
              height: '80px',
              marginLeft: 'auto',
              marginRight: 'auto',
              maxWidth: '900px',
              width: '100%',
              paddingLeft: '20px',
              paddingRight: '20px'
            }">
            <div
              :style="{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: '64px',
                paddingTop: '20px',
                paddingBottom: '20px'
              }">
              <button
                @click="confirmAsTrue"
                @keydown.enter="confirmAsTrue"
                :style="{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: 'var(--main-primary, #EE8444)',
                  backgroundColor: 'white',
                  textDecoration: 'underline',
                  transition: 'colors 0.3s ease'
                }"
                :disabled="false">
                Mark as true
              </button>
              <button
                @click="markAsFalse"
                @keydown.enter="markAsFalse"
                :style="{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'var(--main-primary, #EE8444)',
                  color: 'white',
                  transition: 'colors 0.3s ease'
                }"
                :disabled="false">
                Confirm as false
              </button>
            </div>
          </div>
        </div>

        <template v-else>
          <div v-if="parsedEvent.videos_public">
            <p class="font-bold">There are no cameras available</p>
          </div>
          <div v-else>
            <p class="font-bold">Cameras are hidden because Driver Mode is enabled for this vehicle. Escalate the event to view the video.</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import { DateTime } from 'luxon';
import VideoMP4 from '@/shared/video/VideoMP4.vue';
import VideoUtils from '../../utils/video.utils';

export default {
  name: 'EventsVideoComponent',
  components: {
    VideoMP4
  },
  props: {
    eventData: String,
    modeData: String,
    userPermissions: {
      type: String,
      default: '[]'
    }
  },
  data() {
    return {
      parsedEvent: null,
      parsedMode: 'camera',
      activeTabIndex: 0,
      currentEventId: null,
      showReviewBar: false,
      videoUtils: null,
      YAWN_CLUSTER_TYPE: 'Tiredness',
      accessGroup: {
        SUPER_ADMIN: 'SUPER_ADMIN',
        EVENTS_EDITOR: 'events_editor',
        EVENTS_COMMENTER: 'events_commenter'
      }
    };
  },
  computed: {
    cameras() {
      if (!this.parsedEvent) return [];

      if (this.isYawnPrediction(this.parsedEvent)) {
        const selectedRelation = this.parsedEvent.relations[this.activeTabIndex];
        return (
          selectedRelation?.cameras.map(camera => ({
            picture: camera.picture,
            channel: camera.channel,
            stream: camera.sub_stream,
            key: `${selectedRelation.event_id}_${camera.channel}`
          })) ?? []
        );
      }

      return (
        this.parsedEvent?.cameras?.map(camera => ({
          picture: camera.picture,
          channel: camera.channel,
          stream: camera.sub_stream,
          key: `${this.parsedEvent.id}_${camera.channel}`
        })) ?? []
      );
    },
    hasEventEditorAccess() {
      return this.checkPermission(this.accessGroup.EVENTS_EDITOR) || this.checkPermission(this.accessGroup.SUPER_ADMIN);
    }
  },
  created() {
    this.videoUtils = new VideoUtils();
  },
  mounted() {
    if (this.eventData) {
      this.parseData();
    }
  },
  beforeDestroy() {
    this.videoUtils = null;
  },
  watch: {
    eventData: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.parseData();
        }
      }
    },
    modeData() {
      this.parsedMode = this.modeData || 'camera';
    },
    parsedEvent: {
      handler(newEvent) {
        if (newEvent?.id !== this.currentEventId) {
          this.currentEventId = newEvent?.id || null;
          this.showReviewBar = false;
          this.videoUtils = new VideoUtils();

          if (newEvent?.driver_requested_status_change && this.hasEventEditorAccess) {
            setTimeout(() => {
              this.openReviewConfirmDialog(newEvent);
            }, 100);
          }
        }
      },
      deep: true
    }
  },
  methods: {
    parseData() {
      if (!this.eventData) {
        return;
      }

      this.parsedEvent = JSON.parse(this.eventData);

      if (!this.parsedEvent || typeof this.parsedEvent !== 'object') {
        this.parsedEvent = null;
        return;
      }

      this.parsedMode = this.modeData || 'camera';
    },

    async handleStateChange(index, state) {
      this.videoUtils.update({ [index]: state });
      await this.videoUtils.sync(index);
      this.videoUtils.emitOffset(offset => {
        if (this.parsedEvent?.occurence_start_time) {
          const videoCurrentTime = DateTime.fromFormat(this.parsedEvent.occurence_start_time, 'yyyy-MM-dd HH:mm:ss').plus({ second: offset });

          this.$emit('video-current-time', videoCurrentTime);

          const customEvent = new CustomEvent('video-current-time-change', {
            detail: { videoCurrentTime }
          });
          window.dispatchEvent(customEvent);
        }
      });
    },

    handleTimeUpdate(time) {
      if (this.parsedEvent?.occurence_start_time) {
        const videoCurrentTime = DateTime.fromFormat(this.parsedEvent.occurence_start_time, 'yyyy-MM-dd HH:mm:ss').plus({ second: time });

        this.$emit('time-update', time);

        const customEvent = new CustomEvent('video-current-time-change', {
          detail: { videoCurrentTime }
        });
        window.dispatchEvent(customEvent);
      }
    },

    openReviewConfirmDialog(event) {
      if (!this.hasEventEditorAccess) return;
      const customEvent = new CustomEvent('open-review-confirm-dialog', {
        detail: {
          driverReview: event.driver_review,
          eventId: event.id,
          onResult: result => {
            this.showReviewBar = true;
          }
        }
      });
      window.dispatchEvent(customEvent);
    },

    markAsFalse() {
      if (!this.parsedEvent?.driver_review || !this.hasEventEditorAccess) return;

      const customEvent = new CustomEvent('accept-driver-review', {
        detail: {
          reviewId: this.parsedEvent.driver_review.id,
          onComplete: success => {
            if (success) {
              this.showReviewBar = false;

              this.$nextTick(() => {
                this.showReviewBar = false;
              });
            }
          }
        }
      });
      window.dispatchEvent(customEvent);
      this.showReviewBar = false;
    },

    confirmAsTrue() {
      if (!this.parsedEvent?.driver_review || !this.hasEventEditorAccess) return;
      const customEvent = new CustomEvent('open-reason-reject-dialog', {
        detail: {
          driverReview: this.parsedEvent.driver_review,
          eventId: this.parsedEvent.id,
          onResult: result => {
            if (result?.confirmed && result.reason.trim() !== '') {
              const rejectEvent = new CustomEvent('reject-driver-review', {
                detail: {
                  reviewId: this.parsedEvent.driver_review?.id || '',
                  reason: result.reason,
                  onComplete: success => {
                    this.$nextTick(() => {
                      this.showReviewBar = false;
                    });
                  }
                }
              });
              window.dispatchEvent(rejectEvent);
              this.showReviewBar = false;
            }
          }
        }
      });
      window.dispatchEvent(customEvent);
    },

    getVisibleTabsCount() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 1600) return 3;
      if (screenWidth < 1920) return 4;
      return 5;
    },

    getVisibleRelations(relations) {
      if (!relations) return [];
      const start = Math.floor(this.activeTabIndex / this.getVisibleTabsCount()) * this.getVisibleTabsCount();
      return relations.slice(start, start + this.getVisibleTabsCount());
    },

    onTabClick(index) {
      this.activeTabIndex = index;
    },

    nextSlide() {
      if (this.parsedEvent?.relations) {
        this.activeTabIndex = (this.activeTabIndex + 1) % this.parsedEvent.relations.length;
      }
    },

    prevSlide() {
      if (this.parsedEvent?.relations) {
        this.activeTabIndex = this.activeTabIndex === 0 ? this.parsedEvent.relations.length - 1 : this.activeTabIndex - 1;
      }
    },

    getFirstThumb(relation) {
      return relation?.thumbs?.[0] || '';
    },

    formatOccupationTime(time) {
      if (!time) return '';

      return DateTime.fromFormat(time, 'yyyy-MM-dd HH:mm:ss').toFormat('HH:mm:ss');
    },

    isYawnPrediction(event) {
      return event?.event_type === this.YAWN_CLUSTER_TYPE;
    },

    getCamera(camera) {
      return camera;
    },

    getSelectedRelation(event) {
      if (!event?.relations) return undefined;
      return event.relations[this.activeTabIndex];
    },

    checkPermission(permission) {
      if (!this.userPermissions) {
        return false;
      }

      let permissions = [];

      if (typeof this.userPermissions === 'string') {
        permissions = JSON.parse(this.userPermissions);
      } else if (Array.isArray(this.userPermissions)) {
        permissions = this.userPermissions;
      }

      if (!Array.isArray(permissions)) {
        return false;
      }

      const hasSuperAdmin = permissions.includes(this.accessGroup.SUPER_ADMIN);
      const hasRequestedPermission = permissions.includes(permission);

      return hasSuperAdmin || hasRequestedPermission;
    }
  }
};
</script>
