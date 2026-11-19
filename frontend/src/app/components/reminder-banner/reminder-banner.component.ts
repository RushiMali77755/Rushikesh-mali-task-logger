import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReminderService } from '../../services/reminder.service';
import { ReminderCheck } from '../../models/dashboard.model';

@Component({
  selector: 'app-reminder-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (visible && (reminder?.loginMissing || reminder?.logoutMissing)) {
      <div class="reminder-banner">
        <div class="reminder-content">
          <svg class="warning-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <div class="reminder-text">
            @if (reminder?.loginMissing) {
              <strong>Missed Login Reminder:</strong> You haven't recorded your login time for today ({{ reminder?.date }}).
            } @else if (reminder?.logoutMissing) {
              <strong>Pending Logout Reminder:</strong> You haven't recorded your logout time for today yet.
            }
          </div>
          <a routerLink="/daily-log" class="reminder-action">Record Now &rarr;</a>
        </div>
        <button class="dismiss-btn" (click)="dismiss()" aria-label="Dismiss reminder">&times;</button>
      </div>
    }
  `,
  styles: [`
    .reminder-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #fdf3d1;
      border-left: 4px solid var(--color-warning);
      border-bottom: 1px solid #ebd498;
      padding: 10px 16px;
      color: #543b00;
      font-size: 13px;
      font-family: inherit;

      :host-context([data-theme="dark"]) & {
        background-color: #2b2308;
        border-bottom-color: #4f3f0e;
        color: #fce89e;
      }
    }

    .reminder-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .warning-icon {
      color: #8e6a00;
      flex-shrink: 0;

      :host-context([data-theme="dark"]) & {
        color: var(--color-warning);
      }
    }

    .reminder-action {
      color: var(--color-primary);
      text-decoration: underline;
      font-weight: var(--font-weight-semibold);
      white-space: nowrap;

      &:hover {
        color: var(--color-primary-hover);
      }
    }

    .dismiss-btn {
      background: none;
      border: none;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      color: inherit;
      opacity: 0.6;
      padding: 0 4px;

      &:hover {
        opacity: 1;
      }
    }
  `],
})
export class ReminderBannerComponent implements OnInit {
  reminder: ReminderCheck | null = null;
  visible = true;

  constructor(private reminderService: ReminderService) {}

  ngOnInit(): void {
    this.checkReminder();
  }

  checkReminder(): void {
    this.reminderService.checkReminders().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.reminder = res.data;
        }
      },
      error: () => {},
    });
  }

  dismiss(): void {
    this.visible = false;
  }
}
