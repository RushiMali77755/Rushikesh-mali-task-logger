import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'carbon-theme';
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const saved = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved !== null ? saved === 'dark' : prefersDark;
    this.setTheme(isDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkMode());
  }

  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(this.storageKey, 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(this.storageKey, 'light');
    }
  }
}
