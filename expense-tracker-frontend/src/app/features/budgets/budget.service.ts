import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiResponse } from '../../core/models/api-response.model';
import {
  Budget,
  BudgetRequest,
  BudgetUtilization,
} from '../../core/models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);

  getAll(): Observable<Budget[]> {
    return this.http
      .get<ApiResponse<Budget[]>>(API_ENDPOINTS.BUDGETS.BASE)
      .pipe(map((res) => res.data));
  }

  create(request: BudgetRequest): Observable<Budget> {
    return this.http
      .post<ApiResponse<Budget>>(API_ENDPOINTS.BUDGETS.BASE, request)
      .pipe(map((res) => res.data));
  }

  update(id: number, request: BudgetRequest): Observable<Budget> {
    return this.http
      .put<ApiResponse<Budget>>(API_ENDPOINTS.BUDGETS.BY_ID(id), request)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(API_ENDPOINTS.BUDGETS.BY_ID(id))
      .pipe(map(() => undefined));
  }

  getUtilization(month?: string): Observable<BudgetUtilization[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);

    return this.http
      .get<ApiResponse<BudgetUtilization[]>>(
        API_ENDPOINTS.BUDGETS.UTILIZATION,
        { params }
      )
      .pipe(map((res) => res.data));
  }
}