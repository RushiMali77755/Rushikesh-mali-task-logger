import { DailyLog } from './daily-log.model';
import { Task } from './task.model';

export interface DailyReport {
  log: DailyLog;
  tasks: Task[];
  totalTaskHours: number;
  categoryBreakdown: Record<string, { count: number; hours: number }>;
  taskCount: number;
  completedCount: number;
}

export interface DailySummary {
  date: string;
  loginTime: string;
  logoutTime: string | null;
  totalWorkingHours: number | null;
  totalTaskHours: number;
  taskCount: number;
  completedCount: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  workingDays: number;
  totalWorkingHours: number;
  avgDailyHours: number;
  dailySummaries: DailySummary[];
}

export interface MonthlyReport {
  year: number;
  month: number;
  monthStart: string;
  monthEnd: string;
  workingDays: number;
  totalWorkingHours: number;
  avgDailyHours: number;
  dailySummaries: DailySummary[];
}

export interface CategoryReportItem {
  category: string;
  hours: number;
  percentage: number;
}

export interface CategoryReport {
  from: string;
  to: string;
  categories: CategoryReportItem[];
  totalHours: number;
}

export interface ProjectReportItem {
  tag: string;
  hours: number;
  percentage: number;
}

export interface ProjectReport {
  from: string;
  to: string;
  tags: ProjectReportItem[];
  totalHours: number;
}
