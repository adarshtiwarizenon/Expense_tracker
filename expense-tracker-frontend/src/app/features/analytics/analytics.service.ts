import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  AnalyticsMetrics,
  CategoryDistribution,
  ExpenseTrend,
  MonthlyComparison,
} from '../../core/models/analytics.model';
import { ApiResponse } from '../../core/models/api-response.model';
import { Insight } from '../../core/models/insight.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  getCategoryDistribution(month?: string): Observable<CategoryDistribution[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    return this.http
      .get<ApiResponse<CategoryDistribution[]>>(
        API_ENDPOINTS.ANALYTICS.CATEGORY_DISTRIBUTION,
        { params }
      )
      .pipe(map((res) => res.data));
  }

  getMonthlyComparison(months = 6): Observable<MonthlyComparison[]> {
    const params = new HttpParams().set('months', months);
    return this.http
      .get<ApiResponse<MonthlyComparison[]>>(
        API_ENDPOINTS.ANALYTICS.MONTHLY_COMPARISON,
        { params }
      )
      .pipe(map((res) => res.data));
  }

  getExpenseTrend(startDate?: string, endDate?: string): Observable<ExpenseTrend[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http
      .get<ApiResponse<ExpenseTrend[]>>(
        API_ENDPOINTS.ANALYTICS.EXPENSE_TREND,
        { params }
      )
      .pipe(map((res) => res.data));
  }

  getMetrics(): Observable<AnalyticsMetrics> {
    return this.http
      .get<ApiResponse<AnalyticsMetrics>>(API_ENDPOINTS.ANALYTICS.METRICS)
      .pipe(map((res) => res.data));
  }

  getInsights(): Observable<Insight[]> {
    return this.http
      .get<ApiResponse<Insight[]>>(API_ENDPOINTS.INSIGHTS.BASE)
      .pipe(map((res) => res.data));
  }
}