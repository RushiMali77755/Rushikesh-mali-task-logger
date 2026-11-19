import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DailyLogService } from '../../services/daily-log.service';
import { DailyLog } from '../../models/daily-log.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="history-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Attendance & Task History</h1>
          <p class="text-muted">Browse and search through all recorded daily logs.</p>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="card filters-card">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">From Date</label>
            <input
              type="date"
              class="form-input"
              [(ngModel)]="fromDate"
              (change)="applyFilters()"
            />
          </div>

          <div class="form-group">
            <label class="form-label">To Date</label>
            <input
              type="date"
              class="form-input"
              [(ngModel)]="toDate"
              (change)="applyFilters()"
            />
          </div>

          <div class="filter-actions">
            <button class="btn btn-secondary btn-sm" (click)="resetFilters()">Reset Dates</button>
            <button class="btn btn-primary btn-sm" (click)="applyFilters()">Filter</button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card history-table-card">
        <div class="card-header">
          <div class="results-count">
            Showing {{ logs.length }} of {{ totalCount }} logs
          </div>
          @if (totalFilteredHours > 0) {
            <span class="badge badge-info">
              Total Hours in Period: {{ totalFilteredHours }} hrs
            </span>
          }
        </div>

        @if (isLoading) {
          <div class="empty-state">
            <p class="empty-state-text">Loading history logs...</p>
          </div>
        } @else if (logs.length === 0) {
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <p class="empty-state-text">No daily logs found for the selected date range.</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                  <th>Working Hours</th>
                  <th>Day Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (log of logs; track log.id) {
                  <tr>
                    <td>
                      <strong>{{ log.logDate }}</strong>
                    </td>
                    <td>{{ log.loginTime }}</td>
                    <td>{{ log.logoutTime || '—' }}</td>
                    <td>
                      @if (log.totalWorkingHours !== null) {
                        <span class="badge badge-info">{{ log.totalWorkingHours }} hrs</span>
                      } @else {
                        <span class="badge badge-warning">Missing Logout</span>
                      }
                    </td>
                    <td class="comment-cell">{{ log.dayComment || '—' }}</td>
                    <td>
                      <div class="table-actions">
                        <a [routerLink]="['/daily-log', log.logDate]" class="btn btn-secondary btn-sm">
                          Open Log
                        </a>
                        <button class="btn btn-ghost btn-sm text-error" (click)="deleteLog(log.id)">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages > 1) {
            <div class="pagination-bar">
              <button
                class="btn btn-secondary btn-sm"
                [disabled]="currentPage === 1"
                (click)="goToPage(currentPage - 1)"
              >
                &larr; Previous
              </button>
              <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
              <button
                class="btn btn-secondary btn-sm"
                [disabled]="currentPage === totalPages"
                (click)="goToPage(currentPage + 1)"
              >
                Next &rarr;
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .history-page {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .filters-card {
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .filters-grid {
      display: flex;
      align-items: flex-end;
      gap: var(--spacing-md);
      flex-wrap: wrap;

      .form-group {
        margin-bottom: 0;
        min-width: 160px;
      }
    }

    .filter-actions {
      display: flex;
      gap: var(--spacing-xs);
      margin-bottom: 0;
    }

    .history-table-card {
      .results-count {
        font-size: 13px;
        color: var(--color-ink-muted);
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .comment-cell {
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--color-ink-muted);
    }

    .table-actions {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .pagination-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-md);
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-hairline);
    }

    .page-indicator {
      font-size: 13px;
      color: var(--color-ink-muted);
    }
  `],
})
export class HistoryComponent implements OnInit {
  logs: DailyLog[] = [];
  fromDate = '';
  toDate = '';
  currentPage = 1;
  pageSize = 15;
  totalCount = 0;
  totalPages = 1;
  isLoading = false;

  constructor(private dailyLogService: DailyLogService) {}

  ngOnInit(): void {
    // Default fromDate = 30 days ago
    const d = new Date();
    d.setDate(d.getDate() - 30);
    this.fromDate = d.toISOString().split('T')[0];
    this.toDate = new Date().toISOString().split('T')[0];
    this.loadLogs();
  }

  get totalFilteredHours(): number {
    const sum = this.logs.reduce((acc, l) => acc + (l.totalWorkingHours || 0), 0);
    return Math.round(sum * 100) / 100;
  }

  loadLogs(): void {
    this.isLoading = true;
    this.dailyLogService
      .getDailyLogs({
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
        page: this.currentPage,
        limit: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success && res.data) {
            this.logs = res.data.logs;
            this.totalCount = res.data.pagination.total;
            this.totalPages = res.data.pagination.totalPages;
          }
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  resetFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.currentPage = 1;
    this.loadLogs();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  deleteLog(id: number): void {
    if (!confirm('Are you sure you want to delete this daily log and all associated tasks?')) return;

    this.dailyLogService.deleteDailyLog(id).subscribe({
      next: () => {
        this.loadLogs();
      },
    });
  }
}
