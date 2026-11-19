import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="theme-toggle-btn"
      (click)="theme.toggleTheme()"
      [attr.aria-label]="theme.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
      [title]="theme.isDarkMode() ? 'Light Mode' : 'Dark Mode'"
    >
      @if (theme.isDarkMode()) {
        <!-- Sun icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      } @else {
        <!-- Moon icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      }
      <span class="mode-label">{{ theme.isDarkMode() ? 'Light' : 'Dark' }}</span>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: transparent;
      border: 1px solid var(--color-hairline);
      border-radius: var(--radius-none);
      color: var(--color-ink);
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--color-surface-1);
      }

      svg {
        display: block;
      }

      .mode-label {
        font-weight: var(--font-weight-regular);
        letter-spacing: var(--letter-spacing-caption);
      }
    }
  `],
})
export class DarkModeToggleComponent {
  constructor(public theme: ThemeService) {}
}
