import PlayerUtils from 'src/app/shared/component/smax-video/player.utils';

interface Data {
  source: string;
}

export default class Mp4Utils extends PlayerUtils<any, Data> {
  play(): void {
    void this.element.play();
  }

  pause(): void {
    this.element.pause();
  }

  override destroy() {
    this.pause();

    if (this.player) {
      this.player.destroy();
      this.player = undefined;
    }

    if (this.element) {
      this.element.src = '';
      this.element.load();
    }
  }

  protected init(): void {
    this.element.addEventListener(
      'canplaythrough',
      () => {
        this.state = { firstCanPlay: true, duration: this.element.duration };
        this.element.muted = true;
        void this.element.play();
      },
      { once: true }
    );
    this.element.addEventListener('playing', () => this.firstPlaying.next(true), { once: true });
    this.element.addEventListener('play', () => (this.state = { paused: false, currentTime: this.element.currentTime, duration: this.element.duration }));
    this.element.addEventListener('pause', () => (this.state = { paused: true, currentTime: this.element.currentTime, duration: this.element.duration }));
    this.element.addEventListener('seeked', () => (this.state = { currentTime: this.element.currentTime, duration: this.element.duration }));
    this.element.addEventListener('ratechange', event => {
      const rate = (event.currentTarget as HTMLVideoElement).playbackRate;
      this.state = { rate, duration: this.element.duration };
    });
    this.element.addEventListener('ratechange', event => {
      const rate = (event.currentTarget as HTMLVideoElement).playbackRate;
      this.state = { rate };
    });
    this.element.src = this.data.source;
  }
}
