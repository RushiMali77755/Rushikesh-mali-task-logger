import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { DailyLog, DailyLogListResponse, CreateDailyLogDto, UpdateDailyLogDto } from '../models/daily-log.model';

@Injectable({
  providedIn: 'root',
})
export class DailyLogService {
  constructor(private api: ApiService) {}

  getDailyLogs(params?: { from?: string; to?: string; page?: number; limit?: number }): Observable<ApiResponse<DailyLogListResponse>> {
    return this.api.get<DailyLogListResponse>('/daily-logs', params);
  }

  getDailyLog(id: number): Observable<ApiResponse<DailyLog>> {
    return this.api.get<DailyLog>(`/daily-logs/${id}`);
  }

  getDailyLogByDate(date: string): Observable<ApiResponse<DailyLog>> {
    return this.api.get<DailyLog>(`/daily-logs/by-date/${date}`);
  }

  createDailyLog(dto: CreateDailyLogDto): Observable<ApiResponse<DailyLog>> {
    return this.api.post<DailyLog>('/daily-logs', dto);
  }

  updateDailyLog(id: number, dto: UpdateDailyLogDto): Observable<ApiResponse<DailyLog>> {
    return this.api.put<DailyLog>(`/daily-logs/${id}`, dto);
  }

  deleteDailyLog(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.api.delete<{ message: string }>(`/daily-logs/${id}`);
  }
}
