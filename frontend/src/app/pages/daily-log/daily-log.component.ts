import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DailyLogService } from '../../services/daily-log.service';
import { TaskService } from '../../services/task.service';
import { DailyLog } from '../../models/daily-log.model';
import {
  Task,
  TASK_CATEGORIES,
  TASK_STATUSES,
  TaskCategory,
  TaskStatus,
  CreateTaskDto,
  UpdateTaskDto,
} from '../../models/task.model';
import { TagInputComponent } from '../../components/tag-input/tag-input.component';

@Component({
  selector: 'app-daily-log',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TagInputComponent],
  template: `
    <div class="daily-log-page">
      <!-- Date header & Navigation -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Daily Task Log</h1>
          <p class="text-muted">Record working hours and log tasks for the day.</p>
        </div>
        <div class="date-navigator">
          <button class="btn btn-secondary btn-sm" (click)="changeDate(-1)" title="Previous Day">&larr; Prev</button>
          <input
            type="date"
            class="form-input date-picker-input"
            [ngModel]="selectedDate"
            (ngModelChange)="onDateSelect($event)"
          />
          <button class="btn btn-secondary btn-sm" (click)="changeDate(1)" title="Next Day">Next &rarr;</button>
          <button class="btn btn-ghost btn-sm" (click)="goToToday()">Today</button>
        </div>
      </div>

      <!-- Notification message -->
      @if (notificationMessage) {
        <div class="notification-bar" [class.success]="isSuccessNotice" [class.error]="!isSuccessNotice">
          {{ notificationMessage }}
          <button class="close-btn" (click)="notificationMessage = ''">&times;</button>
        </div>
      }

      <!-- Daily Working Hours & Day Comment Card -->
      <div class="card log-details-card">
        <div class="card-header">
          <h2 class="card-title">Daily Attendance & Notes</h2>
          @if (currentLog?.totalWorkingHours !== null && currentLog?.totalWorkingHours !== undefined) {
            <span class="badge badge-info hours-badge">
              Total Hours: {{ currentLog?.totalWorkingHours }} hrs
            </span>
          }
        </div>

        <div class="attendance-grid">
          <div class="form-group">
            <label class="form-label">Login Time *</label>
            <input
              type="time"
              class="form-input"
              [(ngModel)]="loginTime"
              (change)="onTimeChange()"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Logout Time</label>
            <input
              type="time"
              class="form-input"
              [(ngModel)]="logoutTime"
              (change)="onTimeChange()"
            />
          </div>

          <div class="form-group calculated-hours-group">
            <label class="form-label">Calculated Working Hours</label>
            <div class="calculated-hours-val">
              {{ computedWorkingHours !== null ? computedWorkingHours + ' hrs' : '—' }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Overall Day Comment</label>
          <textarea
            class="form-textarea"
            rows="2"
            placeholder="Add an overall comment or summary about today's work..."
            [(ngModel)]="dayComment"
          ></textarea>
        </div>

        <div class="actions-row">
          <button class="btn btn-primary" (click)="saveDailyLog()" [disabled]="isSavingLog">
            {{ isSavingLog ? 'Saving...' : (currentLog ? 'Update Attendance & Comment' : 'Record Login Time') }}
          </button>
          @if (currentLog) {
            <button class="btn btn-ghost btn-sm" (click)="deleteDailyLog()" title="Delete today's log">
              Delete Log
            </button>
          }
        </div>
      </div>

      <!-- Tasks Section -->
      <div class="tasks-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">Tasks ({{ tasks.length }})</h2>
            <p class="text-subtle font-sm">
              Total Task Duration: {{ totalTaskDuration }} hrs
            </p>
          </div>
          <button class="btn btn-primary" (click)="openAddTaskModal()" [disabled]="!currentLog">
            + Add Task
          </button>
        </div>

        @if (!currentLog) {
          <div class="empty-state card">
            <div class="empty-state-icon">⏱️</div>
            <p class="empty-state-text">Please record login time for {{ selectedDate }} first to start adding tasks.</p>
          </div>
        } @else if (tasks.length === 0) {
          <div class="empty-state card">
            <div class="empty-state-icon">📝</div>
            <p class="empty-state-text">No tasks logged for {{ selectedDate }} yet. Click "+ Add Task" to begin.</p>
          </div>
        } @else {
          <div class="tasks-list">
            @for (t of tasks; track t.id) {
              <div class="card task-card" [class.completed]="t.status === 'Completed'">
                <div class="task-card-main">
                  <div class="task-header-row">
                    <div class="badges-row">
                      <span class="badge badge-info">{{ t.category }}</span>
                      <span
                        class="badge"
                        [class.badge-success]="t.status === 'Completed'"
                        [class.badge-warning]="t.status === 'Pending'"
                        [class.badge-info]="t.status === 'In Progress'"
                      >
                        {{ t.status }}
                      </span>
                    </div>

                    <div class="time-duration-info">
                      @if (t.startTime) {
                        <span>{{ t.startTime }} &ndash; {{ t.endTime || 'Ongoing' }}</span>
                      }
                      @if (t.durationHours) {
                        <span class="duration-pill">({{ t.durationHours }} hrs)</span>
                      }
                    </div>
                  </div>

                  <p class="task-description">{{ t.description }}</p>

                  @if (t.tags && t.tags.length > 0) {
                    <div class="tags-list">
                      @for (tag of t.tags; track tag) {
                        <span class="chip">{{ tag }}</span>
                      }
                    </div>
                  }
                </div>

                <div class="task-card-actions">
                  <button class="btn btn-secondary btn-sm" (click)="editTask(t)">Edit</button>
                  <button class="btn btn-ghost btn-sm text-error" (click)="deleteTask(t.id)">Delete</button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Add / Edit Task Modal / Drawer -->
      @if (showTaskModal) {
        <div class="modal-overlay" (click)="closeTaskModal()">
          <div class="modal-card card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ editingTaskId ? 'Edit Task' : 'Add New Task' }}</h3>
              <button class="close-modal-btn" (click)="closeTaskModal()">&times;</button>
            </div>

            <form (ngSubmit)="submitTaskForm()">
              <div class="form-group">
                <label class="form-label">Task Description *</label>
                <textarea
                  class="form-textarea"
                  rows="3"
                  placeholder="Describe the task in detail..."
                  [(ngModel)]="taskForm.description"
                  name="description"
                  required
                ></textarea>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Category *</label>
                  <select class="form-select" [(ngModel)]="taskForm.category" name="category" required>
                    @for (cat of categoryOptions; track cat) {
                      <option [value]="cat">{{ cat }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Status *</label>
                  <select class="form-select" [(ngModel)]="taskForm.status" name="status" required>
                    @for (st of statusOptions; track st) {
                      <option [value]="st">{{ st }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Start Time</label>
                  <input
                    type="time"
                    class="form-input"
                    [(ngModel)]="taskForm.startTime"
                    name="startTime"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">End Time</label>
                  <input
                    type="time"
                    class="form-input"
                    [(ngModel)]="taskForm.endTime"
                    name="endTime"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Task Tags</label>
                <app-tag-input
                  [selectedTags]="taskForm.tags"
                  (tagsChange)="taskForm.tags = $event"
                ></app-tag-input>
              </div>

              @if (taskFormError) {
                <div class="text-error font-sm mb-md">{{ taskFormError }}</div>
              }

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeTaskModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="isSubmittingTask">
                  {{ isSubmittingTask ? 'Saving...' : (editingTaskId ? 'Update Task' : 'Add Task') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .daily-log-page {
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

    .date-navigator {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .date-picker-input {
      padding: 6px 12px;
      font-size: 13px;
      width: auto;
    }

    .notification-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      font-size: 13px;
      border-radius: var(--radius-none);

      &.success {
        background-color: rgba(36, 161, 72, 0.15);
        border-left: 4px solid var(--color-success);
        color: #0e6027;
      }

      &.error {
        background-color: rgba(218, 30, 40, 0.15);
        border-left: 4px solid var(--color-error);
        color: #8c1017;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: inherit;
      }
    }

    .log-details-card {
      .hours-badge {
        font-size: 13px;
        padding: 4px 10px;
      }
    }

    .attendance-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);

      @media (max-width: 672px) {
        grid-template-columns: 1fr;
      }
    }

    .calculated-hours-group {
      justify-content: center;
    }

    .calculated-hours-val {
      padding: 11px 16px;
      font-size: 16px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary);
      background-color: var(--color-surface-1);
      border-bottom: 1px solid var(--color-hairline);
    }

    .actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--spacing-sm);
    }

    .tasks-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .font-sm {
      font-size: 12px;
    }

    .mb-md {
      margin-bottom: var(--spacing-md);
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .task-card {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-md);
      transition: border-color 0.15s ease;

      &.completed {
        border-left: 3px solid var(--color-success);
      }
    }

    .task-card-main {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      flex: 1;
    }

    .task-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
    }

    .badges-row {
      display: flex;
      gap: var(--spacing-xs);
      align-items: center;
    }

    .time-duration-info {
      font-size: 12px;
      color: var(--color-ink-muted);
      display: flex;
      gap: 6px;
      align-items: center;

      .duration-pill {
        font-weight: var(--font-weight-semibold);
        color: var(--color-ink);
      }
    }

    .task-description {
      font-size: 14px;
      line-height: 1.5;
      color: var(--color-ink);
      margin: 0;
      white-space: pre-wrap;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }

    .task-card-actions {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-shrink: 0;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(22, 22, 22, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }

    .modal-card {
      width: 100%;
      max-width: 580px;
      max-height: 90vh;
      overflow-y: auto;
      background: var(--color-canvas);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-hairline);
      padding-bottom: var(--spacing-xs);
    }

    .modal-title {
      font-size: 18px;
      font-weight: var(--font-weight-regular);
      margin: 0;
    }

    .close-modal-btn {
      background: none;
      border: none;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      color: var(--color-ink-muted);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-lg);
      border-top: 1px solid var(--color-hairline);
      padding-top: var(--spacing-md);
    }
  `],
})
export class DailyLogComponent implements OnInit {
  selectedDate: string = this.getTodayIso();
  currentLog: DailyLog | null = null;
  tasks: Task[] = [];

  // Attendance form fields
  loginTime = '';
  logoutTime = '';
  dayComment = '';
  computedWorkingHours: number | null = null;

  // UI state
  isSavingLog = false;
  notificationMessage = '';
  isSuccessNotice = true;

  // Task Modal state
  showTaskModal = false;
  editingTaskId: number | null = null;
  isSubmittingTask = false;
  taskFormError = '';

  categoryOptions = [...TASK_CATEGORIES];
  statusOptions = [...TASK_STATUSES];

  taskForm = {
    description: '',
    category: 'API Development' as TaskCategory,
    status: 'In Progress' as TaskStatus,
    startTime: '',
    endTime: '',
    tags: [] as string[],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dailyLogService: DailyLogService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const dateParam = params.get('date');
      if (dateParam) {
        this.selectedDate = dateParam;
      }
      this.loadDailyLog();
    });
  }

  get totalTaskDuration(): number {
    const sum = this.tasks.reduce((acc, t) => acc + (t.durationHours || 0), 0);
    return Math.round(sum * 100) / 100;
  }

  private getTodayIso(): string {
    return new Date().toISOString().split('T')[0];
  }

  changeDate(daysDelta: number): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + daysDelta);
    this.selectedDate = d.toISOString().split('T')[0];
    this.router.navigate(['/daily-log', this.selectedDate]);
  }

  goToToday(): void {
    this.selectedDate = this.getTodayIso();
    this.router.navigate(['/daily-log']);
  }

  onDateSelect(newDate: string): void {
    this.selectedDate = newDate;
    this.router.navigate(['/daily-log', newDate]);
  }

  onTimeChange(): void {
    if (this.loginTime && this.logoutTime) {
      this.computedWorkingHours = this.calculateHours(this.loginTime, this.logoutTime);
    } else {
      this.computedWorkingHours = null;
    }
  }

  private calculateHours(start: string, end: string): number {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const diffMin = endH * 60 + endM - (startH * 60 + startM);
    return diffMin > 0 ? Math.round((diffMin / 60) * 100) / 100 : 0;
  }

  loadDailyLog(): void {
    this.dailyLogService.getDailyLogByDate(this.selectedDate).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.currentLog = res.data;
          this.loginTime = res.data.loginTime || '';
          this.logoutTime = res.data.logoutTime || '';
          this.dayComment = res.data.dayComment || '';
          this.computedWorkingHours = res.data.totalWorkingHours ?? null;
          this.tasks = res.data.tasks || [];
        } else {
          this.resetLogForm();
        }
      },
      error: () => {
        this.resetLogForm();
      },
    });
  }

  private resetLogForm(): void {
    this.currentLog = null;
    this.loginTime = '';
    this.logoutTime = '';
    this.dayComment = '';
    this.computedWorkingHours = null;
    this.tasks = [];
  }

  saveDailyLog(): void {
    if (!this.loginTime) {
      this.showNotice('Login time is required', false);
      return;
    }

    this.isSavingLog = true;

    if (this.currentLog) {
      // Update existing
      this.dailyLogService
        .updateDailyLog(this.currentLog.id, {
          loginTime: this.loginTime,
          logoutTime: this.logoutTime || null,
          dayComment: this.dayComment || null,
        })
        .subscribe({
          next: (res) => {
            this.isSavingLog = false;
            if (res.success && res.data) {
              this.currentLog = { ...this.currentLog!, ...res.data };
              this.computedWorkingHours = res.data.totalWorkingHours ?? null;
              this.showNotice('Daily attendance updated successfully!', true);
            }
          },
          error: (err) => {
            this.isSavingLog = false;
            this.showNotice(err.error?.error || 'Failed to update daily log', false);
          },
        });
    } else {
      // Create new
      this.dailyLogService
        .createDailyLog({
          logDate: this.selectedDate,
          loginTime: this.loginTime,
          logoutTime: this.logoutTime || null,
          dayComment: this.dayComment || null,
        })
        .subscribe({
          next: (res) => {
            this.isSavingLog = false;
            if (res.success && res.data) {
              this.currentLog = res.data;
              this.computedWorkingHours = res.data.totalWorkingHours ?? null;
              this.showNotice('Daily log created! You can now log tasks.', true);
            }
          },
          error: (err) => {
            this.isSavingLog = false;
            this.showNotice(err.error?.error || 'Failed to create daily log', false);
          },
        });
    }
  }

  deleteDailyLog(): void {
    if (!this.currentLog) return;
    if (!confirm('Are you sure you want to delete this daily log and all its tasks?')) return;

    this.dailyLogService.deleteDailyLog(this.currentLog.id).subscribe({
      next: () => {
        this.showNotice('Daily log deleted', true);
        this.resetLogForm();
      },
      error: (err) => {
        this.showNotice(err.error?.error || 'Failed to delete daily log', false);
      },
    });
  }

  openAddTaskModal(): void {
    this.editingTaskId = null;
    this.taskFormError = '';
    this.taskForm = {
      description: '',
      category: 'API Development',
      status: 'In Progress',
      startTime: '',
      endTime: '',
      tags: [],
    };
    this.showTaskModal = true;
  }

  editTask(t: Task): void {
    this.editingTaskId = t.id;
    this.taskFormError = '';
    this.taskForm = {
      description: t.description,
      category: t.category,
      status: t.status,
      startTime: t.startTime || '',
      endTime: t.endTime || '',
      tags: [...(t.tags || [])],
    };
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
  }

  submitTaskForm(): void {
    if (!this.taskForm.description.trim()) {
      this.taskFormError = 'Description is required';
      return;
    }

    if (this.taskForm.startTime && this.taskForm.endTime) {
      if (this.calculateHours(this.taskForm.startTime, this.taskForm.endTime) <= 0) {
        this.taskFormError = 'End time must be after start time';
        return;
      }
    }

    if (!this.currentLog) return;

    this.isSubmittingTask = true;
    this.taskFormError = '';

    if (this.editingTaskId) {
      const dto: UpdateTaskDto = {
        description: this.taskForm.description,
        category: this.taskForm.category,
        status: this.taskForm.status,
        startTime: this.taskForm.startTime || null,
        endTime: this.taskForm.endTime || null,
        tags: this.taskForm.tags,
      };

      this.taskService.updateTask(this.editingTaskId, dto).subscribe({
        next: (res) => {
          this.isSubmittingTask = false;
          if (res.success && res.data) {
            this.tasks = this.tasks.map((t) => (t.id === this.editingTaskId ? res.data! : t));
            this.closeTaskModal();
            this.showNotice('Task updated successfully!', true);
          }
        },
        error: (err) => {
          this.isSubmittingTask = false;
          this.taskFormError = err.error?.error || 'Failed to update task';
        },
      });
    } else {
      const dto: CreateTaskDto = {
        description: this.taskForm.description,
        category: this.taskForm.category,
        status: this.taskForm.status,
        startTime: this.taskForm.startTime || null,
        endTime: this.taskForm.endTime || null,
        tags: this.taskForm.tags,
      };

      this.taskService.createTask(this.currentLog.id, dto).subscribe({
        next: (res) => {
          this.isSubmittingTask = false;
          if (res.success && res.data) {
            this.tasks = [...this.tasks, res.data];
            this.closeTaskModal();
            this.showNotice('Task added successfully!', true);
          }
        },
        error: (err) => {
          this.isSubmittingTask = false;
          this.taskFormError = err.error?.error || 'Failed to add task';
        },
      });
    }
  }

  deleteTask(taskId: number): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== taskId);
        this.showNotice('Task deleted', true);
      },
      error: (err) => {
        this.showNotice(err.error?.error || 'Failed to delete task', false);
      },
    });
  }

  private showNotice(msg: string, success: boolean): void {
    this.notificationMessage = msg;
    this.isSuccessNotice = success;
    setTimeout(() => {
      if (this.notificationMessage === msg) {
        this.notificationMessage = '';
      }
    }, 4000);
  }
}
