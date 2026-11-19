import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { ReminderCheck } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  constructor(private api: ApiService) {}

  checkReminders(): Observable<ApiResponse<ReminderCheck>> {
    return this.api.get<ReminderCheck>('/reminders/check');
  }
}
