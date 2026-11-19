import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import {
  DashboardSummary,
  TrendsData,
  CategoryDistributionData,
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private api: ApiService) {}

  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.api.get<DashboardSummary>('/dashboard/summary');
  }

  getTrends(days?: number): Observable<ApiResponse<TrendsData>> {
    return this.api.get<TrendsData>('/dashboard/trends', { days });
  }

  getCategoryDistribution(from?: string, to?: string): Observable<ApiResponse<CategoryDistributionData>> {
    return this.api.get<CategoryDistributionData>('/dashboard/category-distribution', { from, to });
  }
}
