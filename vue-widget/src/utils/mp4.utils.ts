export default class Mp4Utils {
  constructor(element, data, options = {}) {
    this.element = element;
    this.data = data;
    this.options = options;
    this.firstPlaying = { value: false };
    this.init();
  }

  play() {
    if (this.element) {
      this.element.play().catch(e => console.error('Error playing video:', e));
    }
  }

  pause() {
    if (this.element) {
      this.element.pause();
    }
  }

  destroy() {
    this.pause();

    if (this.element) {
      this.element.src = '';
      this.element.load();

      this.element.removeEventListener('canplaythrough', this.canPlayThroughHandler);
      this.element.removeEventListener('playing', this.playingHandler);
      this.element.removeEventListener('play', this.playHandler);
      this.element.removeEventListener('pause', this.pauseHandler);
      this.element.removeEventListener('seeked', this.seekedHandler);
      this.element.removeEventListener('ratechange', this.rateChangeHandler);
    }
  }

  init() {
    this.canPlayThroughHandler = () => {
      const state = {
        element: this.element,
        firstCanPlay: true,
        duration: this.element.duration,
        currentTime: this.element.currentTime,
        paused: this.element.paused,
        ignoreEventCounter: 0,
        rate: this.element.playbackRate,
        lastTimeout: Date.now()
      };
      this.element.muted = true;
      this.element.play().catch(e => console.error('Error playing video after canplaythrough:', e));

      if (this.options.onStateChange) {
        this.options.onStateChange(state);
      }
    };

    this.playingHandler = () => {
      this.firstPlaying.value = true;

      if (this.options.onPlaying) {
        this.options.onPlaying(true);
      }
    };

    this.playHandler = () => {
      const state = {
        element: this.element,
        paused: false,
        currentTime: this.element.currentTime,
        duration: this.element.duration,
        ignoreEventCounter: 0,
        rate: this.element.playbackRate,
        lastTimeout: Date.now()
      };

      if (this.options.onStateChange) {
        this.options.onStateChange(state);
      }
    };

    this.pauseHandler = () => {
      const state = {
        element: this.element,
        paused: true,
        currentTime: this.element.currentTime,
        duration: this.element.duration,
        ignoreEventCounter: 0,
        rate: this.element.playbackRate,
        lastTimeout: Date.now()
      };

      if (this.options.onStateChange) {
        this.options.onStateChange(state);
      }
    };

    this.seekedHandler = () => {
      const state = {
        element: this.element,
        currentTime: this.element.currentTime,
        duration: this.element.duration,
        paused: this.element.paused,
        ignoreEventCounter: 0,
        rate: this.element.playbackRate,
        lastTimeout: Date.now()
      };

      if (this.options.onStateChange) {
        this.options.onStateChange(state);
      }
    };

    this.rateChangeHandler = event => {
      const rate = event.currentTarget.playbackRate;
      const state = {
        element: this.element,
        rate,
        currentTime: this.element.currentTime,
        duration: this.element.duration,
        paused: this.element.paused,
        ignoreEventCounter: 0,
        lastTimeout: Date.now()
      };

      if (this.options.onStateChange) {
        this.options.onStateChange(state);
      }
    };

    this.element.addEventListener('canplaythrough', this.canPlayThroughHandler, { once: true });
    this.element.addEventListener('playing', this.playingHandler, { once: true });
    this.element.addEventListener('play', this.playHandler);
    this.element.addEventListener('pause', this.pauseHandler);
    this.element.addEventListener('seeked', this.seekedHandler);
    this.element.addEventListener('ratechange', this.rateChangeHandler);

    this.element.src = this.data.source;
  }
}
