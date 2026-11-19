import { Task } from './task.model';

export interface DailyLog {
  id: number;
  logDate: string;
  loginTime: string;
  logoutTime: string | null;
  totalWorkingHours: number | null;
  dayComment: string | null;
  logoutReminderSent: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface CreateDailyLogDto {
  logDate: string;
  loginTime: string;
  logoutTime?: string | null;
  dayComment?: string | null;
}

export interface UpdateDailyLogDto {
  logDate?: string;
  loginTime?: string;
  logoutTime?: string | null;
  dayComment?: string | null;
  logoutReminderSent?: number;
}

export interface DailyLogListResponse {
  logs: DailyLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
