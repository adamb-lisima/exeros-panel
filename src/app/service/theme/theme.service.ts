import { Injectable } from '@angular/core';

const STORAGE_KEY = 'dark_mode';

type ThemeType = 'dark' | 'default';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly availableThemes: ThemeType[] = ['dark', 'default'];

  get currentTheme(): ThemeType {
    const theme = localStorage.getItem(STORAGE_KEY) as ThemeType;
    return this.availableThemes.includes(theme) ? theme : 'default';
  }

  set currentTheme(v: ThemeType) {
    localStorage.setItem(STORAGE_KEY, v);
  }

  loadTheme(): void {
    const theme = this.currentTheme;
    const unusedTheme = theme === 'default' ? 'dark' : 'default';
    document.documentElement.classList.add(theme);
    document.documentElement.classList.remove(unusedTheme);
  }
}
