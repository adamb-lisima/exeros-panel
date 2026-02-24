const ColorUtil = {
  get(property: string): string {
    return window.getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  }
};

export default ColorUtil;
