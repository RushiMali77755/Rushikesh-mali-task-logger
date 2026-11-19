import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private api: ApiService) {}

  getTasks(dailyLogId: number): Observable<ApiResponse<Task[]>> {
    return this.api.get<Task[]>(`/daily-logs/${dailyLogId}/tasks`);
  }

  createTask(dailyLogId: number, dto: CreateTaskDto): Observable<ApiResponse<Task>> {
    return this.api.post<Task>(`/daily-logs/${dailyLogId}/tasks`, dto);
  }

  updateTask(taskId: number, dto: UpdateTaskDto): Observable<ApiResponse<Task>> {
    return this.api.put<Task>(`/tasks/${taskId}`, dto);
  }

  deleteTask(taskId: number): Observable<ApiResponse<{ message: string }>> {
    return this.api.delete<{ message: string }>(`/tasks/${taskId}`);
  }
}
