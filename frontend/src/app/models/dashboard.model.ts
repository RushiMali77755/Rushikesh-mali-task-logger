export interface DashboardSummary {
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  tasksCompletedToday: number;
  tasksPending: number;
  avgDailyHours: number;
  workingDaysThisMonth: number;
}

export interface TrendItem {
  date: string;
  hours: number;
}

export interface TrendsData {
  days: number;
  from: string;
  to: string;
  trend: TrendItem[];
}

export interface CategoryDistributionItem {
  category: string;
  hours: number;
  percentage: number;
}

export interface CategoryDistributionData {
  from: string;
  to: string;
  distribution: CategoryDistributionItem[];
  totalHours: number;
}

export interface ReminderCheck {
  loginMissing: boolean;
  logoutMissing: boolean;
  date: string;
}
