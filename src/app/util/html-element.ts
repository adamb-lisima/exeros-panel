const HtmlElementUtil = {
  fullscreen(element: HTMLElement): void {
    // @ts-ignore
    if (document.fullscreenElement || document?.webkitFullscreenElement || document?.mozFullScreenElement) {
      // @ts-ignore
      const exitFullScreen = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      exitFullScreen.call(document);
    } else {
      // @ts-ignore
      const requestFullscreen = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
      requestFullscreen.call(element);
    }
  }
};

export default HtmlElementUtil;
