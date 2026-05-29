import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiResponse } from '../../core/models/api-response.model';
import {
  RecurringTransaction,
  RecurringTransactionRequest,
} from '../../core/models/recurring.model';

@Injectable({ providedIn: 'root' })
export class RecurringService {
  private http = inject(HttpClient);

  getAll(): Observable<RecurringTransaction[]> {
    return this.http
      .get<ApiResponse<RecurringTransaction[]>>(API_ENDPOINTS.RECURRING.BASE)
      .pipe(map((res) => res.data));
  }

  create(request: RecurringTransactionRequest): Observable<RecurringTransaction> {
    return this.http
      .post<ApiResponse<RecurringTransaction>>(
        API_ENDPOINTS.RECURRING.BASE,
        request
      )
      .pipe(map((res) => res.data));
  }

  update(id: number, request: RecurringTransactionRequest): Observable<RecurringTransaction> {
    return this.http
      .put<ApiResponse<RecurringTransaction>>(
        API_ENDPOINTS.RECURRING.BY_ID(id),
        request
      )
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(API_ENDPOINTS.RECURRING.BY_ID(id))
      .pipe(map(() => undefined));
  }

  triggerNow(): Observable<{ transactionsCreated: number }> {
    return this.http
      .post<ApiResponse<{ transactionsCreated: number }>>(
        API_ENDPOINTS.RECURRING.TRIGGER,
        {}
      )
      .pipe(map((res) => res.data));
  }
}