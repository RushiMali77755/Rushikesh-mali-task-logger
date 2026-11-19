import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { ExcelExportService } from '../../services/excel-export.service';
import {
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  CategoryReport,
  ProjectReport,
} from '../../models/report.model';

type ReportTab = 'daily' | 'weekly' | 'monthly' | 'category' | 'project';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Work Reports & Excel Export</h1>
          <p class="text-muted">Generate comprehensive reports and export them directly to Microsoft Excel.</p>
        </div>
      </div>

      <!-- Carbon Tabs Navigation -->
      <div class="tabs">
        <button
          class="tab"
          [class.active]="activeTab === 'daily'"
          (click)="switchTab('daily')"
        >
          Daily Work Report
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'weekly'"
          (click)="switchTab('weekly')"
        >
          Weekly Work Report
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'monthly'"
          (click)="switchTab('monthly')"
        >
          Monthly Work Report
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'category'"
          (click)="switchTab('category')"
        >
          Category-wise Report
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'project'"
          (click)="switchTab('project')"
        >
          Project-wise Report
        </button>
      </div>

      <!-- ── TAB 1: DAILY REPORT ────────────────────────────────────── -->
      @if (activeTab === 'daily') {
        <div class="report-content">
          <div class="card filter-card">
            <div class="filter-controls">
              <div class="form-group inline-group">
                <label class="form-label">Select Date:</label>
                <input
                  type="date"
                  class="form-input"
                  [(ngModel)]="dailyDate"
                  (change)="loadDailyReport()"
                />
              </div>
              <button
                class="btn btn-primary"
                (click)="exportDailyExcel()"
                [disabled]="!dailyReportData"
              >
                📥 Download Excel (.xlsx)
              </button>
            </div>
          </div>

          @if (isLoading) {
            <div class="empty-state"><p class="empty-state-text">Loading daily report...</p></div>
          } @else if (!dailyReportData) {
            <div class="empty-state card">
              <p class="empty-state-text">No data found for {{ dailyDate }}.</p>
            </div>
          } @else {
            <!-- Daily Summary Cards -->
            <div class="grid-4 mb-md">
              <div class="card stat-card">
                <div class="stat-label">Login & Logout</div>
                <div class="stat-value font-md">
                  {{ dailyReportData.log.loginTime }} &ndash; {{ dailyReportData.log.logoutTime || 'Ongoing' }}
                </div>
              </div>
              <div class="card stat-card">
                <div class="stat-label">Working Hours</div>
                <div class="stat-value font-md text-info">
                  {{ dailyReportData.log.totalWorkingHours ?? '—' }} hrs
                </div>
              </div>
              <div class="card stat-card">
                <div class="stat-label">Task Time</div>
                <div class="stat-value font-md">{{ dailyReportData.totalTaskHours }} hrs</div>
              </div>
              <div class="card stat-card">
                <div class="stat-label">Completed Tasks</div>
                <div class="stat-value font-md text-success">
                  {{ dailyReportData.completedCount }} / {{ dailyReportData.taskCount }}
                </div>
              </div>
            </div>

            @if (dailyReportData.log.dayComment) {
              <div class="card comment-banner mb-md">
                <strong>Day Comment:</strong> {{ dailyReportData.log.dayComment }}
              </div>
            }

            <!-- Tasks Table -->
            <div class="card">
              <h2 class="card-title mb-md">Tasks Breakdown</h2>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Start & End</th>
                      <th>Duration</th>
                      <th>Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (t of dailyReportData.tasks; track t.id; let idx = $index) {
                      <tr>
                        <td>{{ idx + 1 }}</td>
                        <td><strong>{{ t.description }}</strong></td>
                        <td><span class="badge badge-info">{{ t.category }}</span></td>
                        <td>
                          <span
                            class="badge"
                            [class.badge-success]="t.status === 'Completed'"
                            [class.badge-warning]="t.status === 'Pending'"
                            [class.badge-info]="t.status === 'In Progress'"
                          >
                            {{ t.status }}
                          </span>
                        </td>
                        <td>{{ t.startTime || '—' }} &ndash; {{ t.endTime || '—' }}</td>
                        <td>{{ t.durationHours ? t.durationHours + ' hrs' : '—' }}</td>
                        <td>
                          @for (tag of t.tags; track tag) {
                            <span class="chip">{{ tag }}</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── TAB 2: WEEKLY REPORT ───────────────────────────────────── -->
      @if (activeTab === 'weekly') {
        <div class="report-content">
          <div class="card filter-card">
            <div class="filter-controls">
              <div class="form-group inline-group">
                <label class="form-label">Select Any Day in Week:</label>
                <input
                  type="date"
                  class="form-input"
                  [(ngModel)]="weeklyDate"
                  (change)="loadWeeklyReport()"
                />
              </div>
              <button
                class="btn btn-primary"
                (click)="exportWeeklyExcel()"
                [disabled]="!weeklyReportData"
              >
                📥 Download Excel (.xlsx)
              </button>
            </div>
          </div>

          @if (isLoading) {
            <div class="empty-state"><p class="empty-state-text">Loading weekly report...</p></div>
          } @else if (!weeklyReportData) {
            <div class="empty-state card">
              <p class="empty-state-text">No logs found for this week.</p>
            </div>
          } @else {
            <div class="grid-4 mb-md">
              <div class="card stat-card">
                <div class="stat-label">Week Range</div>
                <div class="stat-value font-sm">{{ weeklyReportData.weekStart }} &ndash; {{ weeklyReportData.weekEnd }}</div>
              </div>
              <div class="card stat-card">
                <div class="stat-label">Total Working Hours</div>
                <div class="stat-value font-md text-info">{{ weeklyReportData.totalWorkingHours }} hrs</div>
              </div>
              <div class="card stat-card">
                <div class="stat-label">Working Days Logged</div>
                <div class="stat-value font-md">{{ weeklyReportData.workingDays }} days</div>
              </div>
              <div class="card stat-card">
                <div class="stat-label">Daily Average</div>
                <div class="stat-value font-md text-success">{{ weeklyReportData.avgDailyHours }} hrs/day</div>
              </div>
            </div>

            <div class="card">
              <h2 class="card-title mb-md">Daily Breakdown</h2>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Login</th>
                      <th>Logout</th>
                      <th>Attendance Hours</th>
                      <th>Task Hours</th>
                      <th>Tasks Count</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (day of weeklyReportData.dailySummaries; track day.date) {
                      <tr>
                        <td><strong>{{ day.date }}</strong></td>
                        <td>{{ day.loginTime }}</td>
                        <td>{{ day.logoutTime || '—' }}</td>
                        <td>{{ day.totalWorkingHours !== null ? day.totalWorkingHours + ' hrs' : '—' }}</td>
                        <td>{{ day.totalTaskHours }} hrs</td>
                        <td>{{ day.taskCount }}</td>
                        <td><span class="badge badge-success">{{ day.completedCount }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── TAB 3: MONTHLY REPORT ──────────────────────────────────── -->
      @if (activeTab === 'monthly') {
        <div class="report-content">
          <div class="card filter-card">
            <div class="filter-controls">
              <div class="monthly-selectors">
                <div class="form-group inline-group">
                  <label class="form-label">Year:</label>
                  <input
                    type="number"
                    class="form-input num-input"
                    [(ngModel)]="monthlyYear"
                    (change)="loadMonthlyReport()"
                  />
                </div>
                <div class="form-group inline-group">
                  <label class="form-label">Month:</label>
                  <select
                    class="form-select month-select"
                    [(ngModel)]="monthlyMonth"
                    (change)="loadMonthlyReport()"
                  >
                    @for (m of monthsList; track m.value) {
                      <option [value]="m.value">{{ m.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <button
                class="btn btn-primary"
                (click)="exportMonthlyExcel()"
                [disabled]="!monthlyReportData"
              >
                📥 Download Excel (.xlsx)
              </button>
            </div>
          </div>

          @if (isLoading) {
            <div class="empty-state"><p class="empty-state-text">Loading monthly report...</p></div>
          } @else if (!monthlyReportData) {
            <div class="empty-state card">
              <p class="empty-state-text">No logs found for this month.</p>
            </div>
          } @else {
            <div class="grid-4 mb-md">
              <div class="card stat-card">
                <div class="stat-label">Month Period</div>
                <div class="stat-value font-sm">{{ monthlyReportData.monthStart }} &ndash; {{ monthlyReportData.monthEnd }}</div>
              </div>
              <div class="card stat-card">
                <div class="stat-label">Total Working Hours</div>
                <div class="stat-value font-md text-info">{{ monthlyReportData.totalWorkingHours }} hrs</div>
              </div>
              <div class="card stat-card">
                <div class="stat-label">Days Logged</div>
                <div class="stat-value font-md">{{ monthlyReportData.workingDays }} days</div>
              </div>
              <div class="card stat-card">
                <div class="stat-label">Daily Average</div>
                <div class="stat-value font-md text-success">{{ monthlyReportData.avgDailyHours }} hrs/day</div>
              </div>
            </div>

            <div class="card">
              <h2 class="card-title mb-md">Daily Attendance Summary</h2>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Login</th>
                      <th>Logout</th>
                      <th>Working Hours</th>
                      <th>Task Hours</th>
                      <th>Tasks</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (day of monthlyReportData.dailySummaries; track day.date) {
                      <tr>
                        <td><strong>{{ day.date }}</strong></td>
                        <td>{{ day.loginTime }}</td>
                        <td>{{ day.logoutTime || '—' }}</td>
                        <td>{{ day.totalWorkingHours !== null ? day.totalWorkingHours + ' hrs' : '—' }}</td>
                        <td>{{ day.totalTaskHours }} hrs</td>
                        <td>{{ day.taskCount }}</td>
                        <td><span class="badge badge-success">{{ day.completedCount }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── TAB 4: CATEGORY-WISE REPORT ────────────────────────────── -->
      @if (activeTab === 'category') {
        <div class="report-content">
          <div class="card filter-card">
            <div class="filter-controls">
              <div class="range-selectors">
                <div class="form-group inline-group">
                  <label class="form-label">From:</label>
                  <input
                    type="date"
                    class="form-input"
                    [(ngModel)]="categoryFromDate"
                    (change)="loadCategoryReport()"
                  />
                </div>
                <div class="form-group inline-group">
                  <label class="form-label">To:</label>
                  <input
                    type="date"
                    class="form-input"
                    [(ngModel)]="categoryToDate"
                    (change)="loadCategoryReport()"
                  />
                </div>
              </div>

              <button
                class="btn btn-primary"
                (click)="exportCategoryExcel()"
                [disabled]="!categoryReportData"
              >
                📥 Download Excel (.xlsx)
              </button>
            </div>
          </div>

          @if (isLoading) {
            <div class="empty-state"><p class="empty-state-text">Loading category report...</p></div>
          } @else if (!categoryReportData || categoryReportData.categories.length === 0) {
            <div class="empty-state card">
              <p class="empty-state-text">No category task data in this date range.</p>
            </div>
          } @else {
            <div class="card mb-md">
              <div class="stat-label">Total Task Hours in Period</div>
              <div class="stat-value text-info font-md">{{ categoryReportData.totalHours }} hrs</div>
            </div>

            <div class="card">
              <h2 class="card-title mb-md">Category Breakdown</h2>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Hours Spent</th>
                      <th>Percentage of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cat of categoryReportData.categories; track cat.category) {
                      <tr>
                        <td><strong>{{ cat.category }}</strong></td>
                        <td>{{ cat.hours }} hrs</td>
                        <td>
                          <div class="progress-cell">
                            <div class="progress-bar">
                              <div class="progress-fill" [style.width.%]="cat.percentage"></div>
                            </div>
                            <span class="progress-val">{{ cat.percentage }}%</span>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── TAB 5: PROJECT-WISE REPORT ──────────────────────────────── -->
      @if (activeTab === 'project') {
        <div class="report-content">
          <div class="card filter-card">
            <div class="filter-controls">
              <div class="range-selectors">
                <div class="form-group inline-group">
                  <label class="form-label">From:</label>
                  <input
                    type="date"
                    class="form-input"
                    [(ngModel)]="projectFromDate"
                    (change)="loadProjectReport()"
                  />
                </div>
                <div class="form-group inline-group">
                  <label class="form-label">To:</label>
                  <input
                    type="date"
                    class="form-input"
                    [(ngModel)]="projectToDate"
                    (change)="loadProjectReport()"
                  />
                </div>
              </div>

              <button
                class="btn btn-primary"
                (click)="exportProjectExcel()"
                [disabled]="!projectReportData"
              >
                📥 Download Excel (.xlsx)
              </button>
            </div>
          </div>

          @if (isLoading) {
            <div class="empty-state"><p class="empty-state-text">Loading project report...</p></div>
          } @else if (!projectReportData || projectReportData.tags.length === 0) {
            <div class="empty-state card">
              <p class="empty-state-text">No project/tag task data in this date range.</p>
            </div>
          } @else {
            <div class="card mb-md">
              <div class="stat-label">Total Tagged Task Hours</div>
              <div class="stat-value text-info font-md">{{ projectReportData.totalHours }} hrs</div>
            </div>

            <div class="card">
              <h2 class="card-title mb-md">Project / Tag Breakdown</h2>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Project / Tag</th>
                      <th>Hours Spent</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of projectReportData.tags; track item.tag) {
                      <tr>
                        <td>
                          <span class="chip font-sm font-bold">{{ item.tag }}</span>
                        </td>
                        <td>{{ item.hours }} hrs</td>
                        <td>
                          <div class="progress-cell">
                            <div class="progress-bar">
                              <div class="progress-fill" [style.width.%]="item.percentage"></div>
                            </div>
                            <span class="progress-val">{{ item.percentage }}%</span>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .reports-page {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .report-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .filter-card {
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .filter-controls {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .inline-group {
      margin-bottom: 0;
    }

    .monthly-selectors,
    .range-selectors {
      display: flex;
      gap: var(--spacing-md);
      align-items: flex-end;
    }

    .num-input {
      width: 100px;
    }

    .month-select {
      width: 150px;
    }

    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-caption);
      color: var(--color-ink-muted);
    }

    .font-md {
      font-size: 22px;
    }

    .font-sm {
      font-size: 14px;
    }

    .font-bold {
      font-weight: var(--font-weight-semibold);
    }

    .mb-md {
      margin-bottom: var(--spacing-md);
    }

    .comment-banner {
      padding: 12px 16px;
      font-size: 13px;
      border-left: 3px solid var(--color-primary);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .progress-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 160px;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background-color: var(--color-surface-2);
      border-radius: var(--radius-none);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--color-primary);
      transition: width 0.3s ease;
    }

    .progress-val {
      font-size: 12px;
      color: var(--color-ink-muted);
      min-width: 45px;
      text-align: right;
    }
  `],
})
export class ReportsComponent implements OnInit {
  activeTab: ReportTab = 'daily';
  isLoading = false;

  // Tab 1: Daily
  dailyDate: string = new Date().toISOString().split('T')[0];
  dailyReportData: DailyReport | null = null;

  // Tab 2: Weekly
  weeklyDate: string = new Date().toISOString().split('T')[0];
  weeklyReportData: WeeklyReport | null = null;

  // Tab 3: Monthly
  monthlyYear: number = new Date().getFullYear();
  monthlyMonth: number = new Date().getMonth() + 1;
  monthlyReportData: MonthlyReport | null = null;
  monthsList = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  // Tab 4: Category
  categoryFromDate: string = '';
  categoryToDate: string = '';
  categoryReportData: CategoryReport | null = null;

  // Tab 5: Project
  projectFromDate: string = '';
  projectToDate: string = '';
  projectReportData: ProjectReport | null = null;

  constructor(
    private reportService: ReportService,
    private excelExport: ExcelExportService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date().toISOString().split('T')[0];
    this.categoryFromDate = firstDay;
    this.categoryToDate = lastDay;
    this.projectFromDate = firstDay;
    this.projectToDate = lastDay;

    this.loadDailyReport();
  }

  switchTab(tab: ReportTab): void {
    this.activeTab = tab;
    if (tab === 'daily') this.loadDailyReport();
    else if (tab === 'weekly') this.loadWeeklyReport();
    else if (tab === 'monthly') this.loadMonthlyReport();
    else if (tab === 'category') this.loadCategoryReport();
    else if (tab === 'project') this.loadProjectReport();
  }

  loadDailyReport(): void {
    this.isLoading = true;
    this.reportService.getDailyReport(this.dailyDate).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.dailyReportData = res.success && res.data ? res.data : null;
      },
      error: () => {
        this.isLoading = false;
        this.dailyReportData = null;
      },
    });
  }

  loadWeeklyReport(): void {
    this.isLoading = true;
    this.reportService.getWeeklyReport(this.weeklyDate).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.weeklyReportData = res.success && res.data ? res.data : null;
      },
      error: () => {
        this.isLoading = false;
        this.weeklyReportData = null;
      },
    });
  }

  loadMonthlyReport(): void {
    this.isLoading = true;
    this.reportService.getMonthlyReport(this.monthlyYear, this.monthlyMonth).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.monthlyReportData = res.success && res.data ? res.data : null;
      },
      error: () => {
        this.isLoading = false;
        this.monthlyReportData = null;
      },
    });
  }

  loadCategoryReport(): void {
    this.isLoading = true;
    this.reportService.getCategoryReport(this.categoryFromDate, this.categoryToDate).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.categoryReportData = res.success && res.data ? res.data : null;
      },
      error: () => {
        this.isLoading = false;
        this.categoryReportData = null;
      },
    });
  }

  loadProjectReport(): void {
    this.isLoading = true;
    this.reportService.getProjectReport(this.projectFromDate, this.projectToDate).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.projectReportData = res.success && res.data ? res.data : null;
      },
      error: () => {
        this.isLoading = false;
        this.projectReportData = null;
      },
    });
  }

  exportDailyExcel(): void {
    if (this.dailyReportData) {
      this.excelExport.exportDailyReport(this.dailyReportData);
    }
  }

  exportWeeklyExcel(): void {
    if (this.weeklyReportData) {
      this.excelExport.exportWeeklyReport(this.weeklyReportData);
    }
  }

  exportMonthlyExcel(): void {
    if (this.monthlyReportData) {
      this.excelExport.exportMonthlyReport(this.monthlyReportData);
    }
  }

  exportCategoryExcel(): void {
    if (this.categoryReportData) {
      this.excelExport.exportCategoryReport(this.categoryReportData);
    }
  }

  exportProjectExcel(): void {
    if (this.projectReportData) {
      this.excelExport.exportProjectReport(this.projectReportData);
    }
  }
}
