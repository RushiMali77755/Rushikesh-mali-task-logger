import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import {
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  CategoryReport,
  ProjectReport,
} from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private api: ApiService) {}

  getDailyReport(date?: string): Observable<ApiResponse<DailyReport>> {
    return this.api.get<DailyReport>('/reports/daily', date ? { date } : undefined);
  }

  getWeeklyReport(date?: string): Observable<ApiResponse<WeeklyReport>> {
    return this.api.get<WeeklyReport>('/reports/weekly', date ? { date } : undefined);
  }

  getMonthlyReport(year?: number, month?: number): Observable<ApiResponse<MonthlyReport>> {
    return this.api.get<MonthlyReport>('/reports/monthly', { year, month });
  }

  getCategoryReport(from?: string, to?: string): Observable<ApiResponse<CategoryReport>> {
    return this.api.get<CategoryReport>('/reports/category', { from, to });
  }

  getProjectReport(from?: string, to?: string): Observable<ApiResponse<ProjectReport>> {
    return this.api.get<ProjectReport>('/reports/project', { from, to });
  }
}
