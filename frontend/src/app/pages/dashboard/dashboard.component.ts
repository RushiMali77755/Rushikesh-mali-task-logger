import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DailyLogService } from '../../services/daily-log.service';
import { DashboardSummary } from '../../models/dashboard.model';
import { DailyLog } from '../../models/daily-log.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Developer Dashboard</h1>
          <p class="text-muted">Overview of your working hours, productivity trends, and task metrics.</p>
        </div>
        <a routerLink="/daily-log" class="btn btn-primary">
          Log Today's Work &rarr;
        </a>
      </div>

      <!-- KPI Summary Cards Row -->
      <div class="grid-4 stats-grid">
        <div class="card stat-card">
          <div class="stat-label">Hours This Week</div>
          <div class="stat-value">{{ summary?.totalHoursThisWeek ?? 0 }} <span class="stat-unit">hrs</span></div>
          <div class="stat-meta text-subtle">Monday &ndash; Sunday</div>
        </div>

        <div class="card stat-card">
          <div class="stat-label">Hours This Month</div>
          <div class="stat-value">{{ summary?.totalHoursThisMonth ?? 0 }} <span class="stat-unit">hrs</span></div>
          <div class="stat-meta text-subtle">{{ summary?.workingDaysThisMonth ?? 0 }} logged days</div>
        </div>

        <div class="card stat-card">
          <div class="stat-label">Tasks Completed Today</div>
          <div class="stat-value text-success">{{ summary?.tasksCompletedToday ?? 0 }}</div>
          <div class="stat-meta text-subtle">{{ summary?.tasksPending ?? 0 }} tasks pending</div>
        </div>

        <div class="card stat-card">
          <div class="stat-label">Daily Average (Month)</div>
          <div class="stat-value text-info">{{ summary?.avgDailyHours ?? 0 }} <span class="stat-unit">hrs/day</span></div>
          <div class="stat-meta text-subtle">Based on active days</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2 charts-grid">
        <!-- Working Hours Trend -->
        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title">Working Hours Trend (Last 30 Days)</h2>
          </div>
          <div class="chart-container">
            <canvas #trendCanvas></canvas>
          </div>
        </div>

        <!-- Category Distribution -->
        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title">Time by Task Category</h2>
          </div>
          <div class="chart-container donut-container">
            <canvas #categoryCanvas></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="card recent-logs-card">
        <div class="card-header">
          <h2 class="card-title">Recent Daily Logs</h2>
          <a routerLink="/history" class="btn btn-ghost btn-sm">View All History &rarr;</a>
        </div>

        @if (recentLogs.length === 0) {
          <div class="empty-state">
            <p class="empty-state-text">No activity recorded yet. Start by logging your work today!</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                  <th>Total Hours</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (log of recentLogs; track log.id) {
                  <tr>
                    <td><strong>{{ log.logDate }}</strong></td>
                    <td>{{ log.loginTime }}</td>
                    <td>{{ log.logoutTime || '—' }}</td>
                    <td>
                      @if (log.totalWorkingHours !== null) {
                        <span class="badge badge-info">{{ log.totalWorkingHours }} hrs</span>
                      } @else {
                        <span class="text-subtle">—</span>
                      }
                    </td>
                    <td class="notes-cell">{{ log.dayComment || '—' }}</td>
                    <td>
                      <a [routerLink]="['/daily-log', log.logDate]" class="btn btn-secondary btn-sm">
                        View / Edit
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .stat-label {
      font-size: 12px;
      font-weight: var(--font-weight-regular);
      color: var(--color-ink-muted);
      letter-spacing: var(--letter-spacing-caption);
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 32px;
      font-weight: var(--font-weight-light);
      color: var(--color-ink);
      line-height: 1.1;

      .stat-unit {
        font-size: 14px;
        color: var(--color-ink-muted);
        font-weight: var(--font-weight-regular);
      }
    }

    .stat-meta {
      font-size: 11px;
    }

    .chart-card {
      min-height: 320px;
    }

    .chart-container {
      position: relative;
      height: 250px;
      width: 100%;
    }

    .donut-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .notes-cell {
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--color-ink-muted);
    }
  `],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryCanvas') categoryCanvas!: ElementRef<HTMLCanvasElement>;

  summary: DashboardSummary | null = null;
  recentLogs: DailyLog[] = [];

  private trendChart?: Chart;
  private categoryChart?: Chart;

  constructor(
    private dashboardService: DashboardService,
    private dailyLogService: DailyLogService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadRecentLogs();
  }

  ngAfterViewInit(): void {
    this.loadTrendChart();
    this.loadCategoryChart();
  }

  ngOnDestroy(): void {
    this.trendChart?.destroy();
    this.categoryChart?.destroy();
  }

  private loadSummary(): void {
    this.dashboardService.getSummary().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.summary = res.data;
        }
      },
    });
  }

  private loadRecentLogs(): void {
    this.dailyLogService.getDailyLogs({ limit: 5 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recentLogs = res.data.logs;
        }
      },
    });
  }

  private loadTrendChart(): void {
    this.dashboardService.getTrends(30).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const labels = res.data.trend.map((t) => t.date.slice(5)); // MM-DD
          const data = res.data.trend.map((t) => t.hours);

          if (this.trendCanvas?.nativeElement) {
            this.trendChart?.destroy();
            this.trendChart = new Chart(this.trendCanvas.nativeElement, {
              type: 'line',
              data: {
                labels: labels.length > 0 ? labels : ['No data'],
                datasets: [
                  {
                    label: 'Working Hours',
                    data: data.length > 0 ? data : [0],
                    borderColor: '#0f62fe',
                    backgroundColor: 'rgba(15, 98, 254, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2,
                    pointBackgroundColor: '#0f62fe',
                    pointRadius: 4,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    suggestedMax: 10,
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    ticks: { font: { family: 'IBM Plex Sans' } },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { family: 'IBM Plex Sans' } },
                  },
                },
              },
            });
          }
        }
      },
    });
  }

  private loadCategoryChart(): void {
    this.dashboardService.getCategoryDistribution().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const distribution = res.data.distribution;
          const labels = distribution.map((d) => d.category);
          const data = distribution.map((d) => d.hours);

          const colors = [
            '#0f62fe',
            '#0043ce',
            '#24a148',
            '#f1c21b',
            '#da1e28',
            '#8a3ffc',
            '#0072c3',
            '#1192e8',
            '#005d5d',
            '#9f1853',
            '#fa4d56',
          ];

          if (this.categoryCanvas?.nativeElement) {
            this.categoryChart?.destroy();
            this.categoryChart = new Chart(this.categoryCanvas.nativeElement, {
              type: 'doughnut',
              data: {
                labels: labels.length > 0 ? labels : ['No tasks logged'],
                datasets: [
                  {
                    data: data.length > 0 ? data : [1],
                    backgroundColor: data.length > 0 ? colors.slice(0, labels.length) : ['#e0e0e0'],
                    borderWidth: 1,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      font: { family: 'IBM Plex Sans', size: 11 },
                      boxWidth: 12,
                    },
                  },
                },
              },
            });
          }
        }
      },
    });
  }
}
