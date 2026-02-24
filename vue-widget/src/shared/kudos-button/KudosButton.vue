<template>
  <div :style="styles.mainContainer">
    <button :style="[styles.button, isActive ? styles.buttonActive : styles.buttonInactive, !isActive && isHovered ? styles.buttonHover : {}]" @click="handleClick" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <span :style="styles.iconContainer">
        <span ref="svgContainer" :style="styles.absoluteContainer">
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_5275_17494)">
              <path d="M15.1139 3.72848C15.1896 3.51085 15.2274 3.40204 15.2833 3.37188C15.3317 3.34578 15.39 3.34578 15.4384 3.37188C15.4944 3.40204 15.5322 3.51085 15.6078 3.72848L16.1079 5.16723C16.1295 5.22917 16.1402 5.26014 16.1596 5.2832C16.1768 5.30358 16.1986 5.31945 16.2233 5.32946C16.2512 5.34078 16.284 5.34145 16.3496 5.34278L17.8724 5.37382C18.1028 5.37851 18.218 5.38086 18.2639 5.42473C18.3037 5.46271 18.3217 5.51814 18.3119 5.57225C18.3005 5.63477 18.2087 5.70435 18.0251 5.84357L16.8113 6.76377C16.759 6.80341 16.7329 6.82322 16.717 6.84877C16.7029 6.87139 16.6945 6.89708 16.6926 6.92361C16.6905 6.95368 16.7 6.98505 16.719 7.04784L17.1601 8.50577C17.2268 8.7263 17.2601 8.83657 17.2326 8.89383C17.2088 8.94341 17.1616 8.97766 17.1071 8.98501C17.0442 8.99347 16.9496 8.92769 16.7605 8.79608L15.5102 7.92607C15.4564 7.88862 15.4295 7.8699 15.4002 7.86261C15.3744 7.8562 15.3474 7.8562 15.3215 7.86261C15.2923 7.8699 15.2654 7.88862 15.2115 7.92607L13.9613 8.79608C13.7721 8.92769 13.6776 8.99347 13.6146 8.98501C13.5601 8.97766 13.5129 8.94341 13.4891 8.89383C13.4616 8.83657 13.495 8.7263 13.5617 8.50577L14.0028 7.04784C14.0218 6.98505 14.0312 6.95368 14.0291 6.92361C14.0272 6.89708 14.0189 6.87139 14.0048 6.84877C13.9889 6.82322 13.9627 6.80341 13.9105 6.76377L12.6967 5.84357C12.5131 5.70435 12.4213 5.63477 12.4099 5.57225C12.4 5.51814 12.418 5.46271 12.4578 5.42473C12.5038 5.38086 12.619 5.37851 12.8493 5.37382L14.3722 5.34278C14.4377 5.34145 14.4705 5.34078 14.4985 5.32946C14.5231 5.31945 14.545 5.30358 14.5621 5.2832C14.5815 5.26014 14.5923 5.22917 14.6138 5.16723L15.1139 3.72848Z" :stroke="isActive ? colors.white : colors.blue600" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3.39223 3.72848C3.46789 3.51085 3.5057 3.40204 3.56165 3.37188C3.61005 3.34578 3.66832 3.34578 3.71676 3.37188C3.77267 3.40204 3.81049 3.51085 3.88614 3.72848L4.38626 5.16723C4.4078 5.22917 4.41855 5.26014 4.43796 5.2832C4.45509 5.30358 4.47695 5.31945 4.50163 5.32946C4.52954 5.34078 4.56231 5.34145 4.62787 5.34278L6.15075 5.37382C6.38112 5.37851 6.49628 5.38086 6.54227 5.42473C6.58204 5.46271 6.60005 5.51814 6.59018 5.57225C6.5788 5.63477 6.487 5.70435 6.3034 5.84357L5.08959 6.76377C5.03733 6.80341 5.01122 6.82322 4.99527 6.84877C4.98119 6.87139 4.97286 6.89708 4.97096 6.92361C4.96884 6.95368 4.97831 6.98505 4.9973 7.04784L5.4384 8.50577C5.5051 8.7263 5.53847 8.83657 5.51095 8.89383C5.48713 8.94341 5.43997 8.97766 5.38545 8.98501C5.32248 8.99347 5.22793 8.92769 5.03881 8.79608L3.78852 7.92607C3.7347 7.88862 3.7078 7.8699 3.67855 7.86261C3.6527 7.8562 3.62567 7.8562 3.59986 7.86261C3.57061 7.8699 3.54368 7.88862 3.48985 7.92607L2.23959 8.79608C2.05047 8.92769 1.95591 8.99347 1.89293 8.98501C1.83843 8.97766 1.79127 8.94341 1.76745 8.89383C1.73992 8.83657 1.77329 8.7263 1.84 8.50577L2.28108 7.04784C2.30007 6.98505 2.30957 6.95368 2.30743 6.92361C2.30554 6.89708 2.29719 6.87139 2.28311 6.84877C2.26717 6.82322 2.24104 6.80341 2.18879 6.76377L0.975 5.84357C0.791398 5.70435 0.699596 5.63477 0.6882 5.57225C0.678334 5.51814 0.696348 5.46271 0.736131 5.42473C0.782093 5.38086 0.897271 5.37851 1.12762 5.37382L2.6505 5.34278C2.71606 5.34145 2.74884 5.34078 2.77677 5.32946C2.80144 5.31945 2.8233 5.30358 2.84044 5.2832C2.85983 5.26014 2.8706 5.22917 2.89213 5.16723L3.39223 3.72848Z" :stroke="isActive ? colors.white : colors.blue600" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9.29946 0.91176C9.37512 0.69413 9.41293 0.585318 9.46888 0.55516C9.51728 0.529058 9.57555 0.529058 9.62398 0.55516C9.6799 0.585318 9.71771 0.69413 9.79337 0.91176L10.2935 2.35051C10.315 2.41245 10.3258 2.44342 10.3452 2.46648C10.3623 2.48686 10.3842 2.50274 10.4089 2.51274C10.4368 2.52406 10.4695 2.52473 10.5351 2.52606L12.058 2.5571C12.2883 2.56179 12.4035 2.56414 12.4495 2.60801C12.4893 2.64599 12.5073 2.70142 12.4974 2.75553C12.486 2.81805 12.3942 2.88763 12.2106 3.02685L10.9968 3.94705C10.9446 3.98669 10.9184 4.0065 10.9025 4.03206C10.8884 4.05467 10.8801 4.08036 10.8782 4.1069C10.8761 4.13696 10.8855 4.16834 10.9045 4.23112L11.3456 5.68905C11.4123 5.90959 11.4457 6.01985 11.4182 6.07711C11.3944 6.12669 11.3472 6.16094 11.2927 6.16829C11.2297 6.17675 11.1352 6.11097 10.946 5.97936L9.69575 5.10936C9.64192 5.0719 9.61503 5.05318 9.58578 5.04589C9.55993 5.03948 9.5329 5.03948 9.50708 5.04589C9.47783 5.05318 9.4509 5.0719 9.39708 5.10936L8.14681 5.97936C7.95769 6.11097 7.86313 6.17675 7.80016 6.16829C7.74566 6.16094 7.6985 6.12669 7.67468 6.07711C7.64715 6.01985 7.68051 5.90959 7.74723 5.68905L8.18831 4.23112C8.2073 4.16834 8.21679 4.13696 8.21466 4.1069C8.21277 4.08036 8.20442 4.05467 8.19034 4.03206C8.1744 4.0065 8.14827 3.98669 8.09602 3.94705L6.88223 3.02685C6.69862 2.88763 6.60682 2.81805 6.59543 2.75553C6.58556 2.70142 6.60357 2.64599 6.64336 2.60801C6.68932 2.56414 6.8045 2.56179 7.03485 2.5571L8.55773 2.52606C8.62329 2.52473 8.65607 2.52406 8.684 2.51274C8.70867 2.50274 8.73053 2.48686 8.74766 2.46648C8.76706 2.44342 8.77783 2.41245 8.79936 2.35051L9.29946 0.91176Z" :stroke="isActive ? colors.white : colors.blue600" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M10.2764 7.55875C10.6451 7.58775 11.0161 7.75082 11.2344 8.09586C11.451 8.43885 11.4497 8.85556 11.3047 9.257L11.3057 9.25797L10.6992 11.0978C10.5926 11.4213 10.8332 11.755 11.1738 11.755H14.0996C15.1521 11.7556 15.8773 12.8118 15.499 13.7941L13.8105 18.175C13.5876 18.7536 13.0312 19.1357 12.4111 19.1359H4.53418C3.70576 19.1359 3.03321 18.4643 3.0332 17.6359V13.2609C3.03324 12.4325 3.70577 11.7609 4.53418 11.7609H5.57422C5.73096 11.7607 5.87926 11.6868 5.97363 11.5617L8.05273 8.80094C8.68865 7.93137 9.54766 7.50177 10.2764 7.55875ZM10.1982 8.55582C9.90716 8.53315 9.34998 8.71808 8.85645 9.39567L8.85156 9.4025L6.77246 12.1632C6.75622 12.1848 6.73699 12.2042 6.71973 12.2248V18.1359H12.4111C12.6177 18.1357 12.8037 18.0083 12.8779 17.8156L14.5654 13.4347C14.6913 13.1075 14.4501 12.7556 14.0996 12.755H11.1738C10.1522 12.755 9.42932 11.7556 9.74902 10.7853L10.3555 8.94547L10.3623 8.92692C10.4384 8.72269 10.3972 8.64332 10.3896 8.63102C10.3817 8.61837 10.3397 8.56702 10.1982 8.55582ZM5.57422 12.7609H4.53418C4.25806 12.7609 4.03421 12.9848 4.03418 13.2609V17.6359C4.03419 17.912 4.25804 18.1359 4.53418 18.1359H5.71973V12.7521C5.67156 12.7568 5.62312 12.7609 5.57422 12.7609Z" :fill="isActive ? colors.white : colors.blue600" />
            </g>
            <defs>
              <clipPath id="clip0_5275_17494">
                <rect width="19" height="19" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </span>
      </span>
      <span :style="[styles.text, isActive ? styles.textActive : styles.textInactive]">
        {{ isActive ? 'Kudos delivered!' : 'Give Kudos To Driver' }}
      </span>
    </button>

    <div ref="lottieContainer" :style="[styles.lottieContainer, { display: isAnimating ? 'block' : 'none' }]"></div>
  </div>
</template>

<script>
const colors = {
  blue600: '#2295ff',
  blue50: '#eff6ff',
  white: '#ffffff',
  hoverGray: '#FAFAFA'
};

export default {
  name: 'KudosButton',
  props: {
    eventId: {
      type: [Number, String],
      required: true
    },
    active: {
      type: [Boolean, String],
      default: false
    }
  },
  data() {
    return {
      isActive: false,
      isHovered: false,
      isLottieScriptLoaded: false,
      isAnimating: false,
      lottieElement: null,
      colors,
      currentEventId: null,
      styles: {
        mainContainer: {
          position: 'relative',
          display: 'inline-block'
        },
        lottieContainer: {
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: '0',
          top: '-150%',
          zIndex: '10',
          pointerEvents: 'none'
        },
        button: {
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px 8px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          border: 'none',
          outline: 'none',
          fontFamily: 'Poppins, sans-serif',
          height: '40px',
          minWidth: '180px',
          position: 'relative',
          zIndex: '1'
        },
        buttonActive: {
          backgroundColor: colors.blue600,
          color: colors.white
        },
        buttonHover: {
          backgroundColor: colors.hoverGray
        },
        buttonInactive: {
          backgroundColor: colors.white,
          color: colors.blue600,
          outline: `2px solid ${colors.blue600}`,
          outlineOffset: '-2px'
        },
        iconContainer: {
          width: '20px',
          height: '20px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        absoluteContainer: {
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          overflow: 'visible',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        text: {
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: 'Poppins, sans-serif'
        },
        textActive: {
          color: colors.white
        },
        textInactive: {
          color: colors.blue600
        },
        lottie: {
          width: '300%',
          height: '600%',
          position: 'absolute',
          left: '-100%',
          top: '-80%'
        }
      }
    };
  },
  watch: {
    eventId: {
      immediate: true,
      handler(newEventId) {
        if (this.currentEventId !== newEventId) {
          this.isAnimating = false;
          this.currentEventId = newEventId;
          this.syncActiveState();
        }
      }
    },
    active: {
      immediate: true,
      handler() {
        this.syncActiveState();
      }
    },
    isAnimating: {
      handler(newVal) {
        if (this.$refs.lottieContainer) {
          this.$refs.lottieContainer.style.display = newVal ? 'block' : 'none';
        }
      }
    }
  },
  mounted() {
    this.loadLottieScript();
    this.currentEventId = this.eventId;
    this.syncActiveState();
  },
  methods: {
    syncActiveState() {
      const newActive = this.active === true || this.active === 'true';

      if (this.isActive !== newActive) {
        this.isActive = newActive;
      }
    },

    updateVisibility() {
      if (this.$refs.lottieContainer) {
        this.$refs.lottieContainer.style.display = this.isAnimating ? 'block' : 'none';
      }
    },

    handleClick() {
      this.isActive = !this.isActive;

      if (this.isActive && this.isLottieScriptLoaded) {
        this.playLottieAnimation();
      }

      const event = new CustomEvent('kudos-toggled', {
        bubbles: true,
        detail: { eventId: this.eventId }
      });
      dispatchEvent(event);
    },

    playLottieAnimation() {
      this.ensureLottieElementExists();

      this.isAnimating = true;
      this.updateVisibility();

      if (this.lottieElement) {
        if (typeof this.lottieElement.play === 'function') {
          this.lottieElement.play();
        } else {
          this.lottieElement.setAttribute('autoplay', 'true');

          setTimeout(() => {
            const playButton = this.lottieElement.shadowRoot?.querySelector('button.play');
            if (playButton) {
              playButton.click();
            }
          }, 100);
        }
      }

      setTimeout(() => {
        this.isAnimating = false;
        this.updateVisibility();
      }, 2000);
    },

    ensureLottieElementExists() {
      if (this.lottieElement) return;

      if (!this.$refs.lottieContainer) return;

      this.lottieElement = document.createElement('dotlottie-wc');
      this.lottieElement.setAttribute('src', 'https://lottie.host/6924f917-31a4-4387-9886-80b1720c3855/81fzUsO2xC.lottie');
      this.lottieElement.setAttribute('autoplay', 'false');
      this.lottieElement.setAttribute('loop', 'false');

      Object.assign(this.lottieElement.style, this.styles.lottie);

      this.$refs.lottieContainer.appendChild(this.lottieElement);
    },

    loadLottieScript() {
      if (window.customElements && customElements.get('dotlottie-wc')) {
        this.isLottieScriptLoaded = true;
        this.$nextTick(() => {
          this.ensureLottieElementExists();
        });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js';
      script.type = 'module';

      script.onload = () => {
        this.isLottieScriptLoaded = true;
        this.$nextTick(() => {
          this.ensureLottieElementExists();
        });
      };

      script.onerror = error => {
      };

      document.head.appendChild(script);
    }
  }
};
</script>
