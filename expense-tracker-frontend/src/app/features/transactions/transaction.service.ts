import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiResponse } from '../../core/models/api-response.model';
import { PageResponse } from '../../core/models/page-response.model';
import {
  Transaction,
  TransactionFilters,
  TransactionRequest,
} from '../../core/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);

  // Get all transactions with optional filters and pagination

  getAll(filters: TransactionFilters = {}): Observable<PageResponse<Transaction>> {
    let params = new HttpParams();

    const { categoryIds, ...rest } = filters;

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    if (categoryIds?.length) {
      categoryIds.forEach((id) => {
        params = params.append('categoryIds', String(id));
      });
    }

    return this.http
      .get<ApiResponse<PageResponse<Transaction>>>(API_ENDPOINTS.TRANSACTIONS.BASE, { params })
      .pipe(map((res) => res.data));
  }

  // Get single transaction by ID

  getById(id: number): Observable<Transaction> {
    return this.http
      .get<ApiResponse<Transaction>>(API_ENDPOINTS.TRANSACTIONS.BY_ID(id))
      .pipe(map((res) => res.data));
  }

  // Create a new transaction

  create(request: TransactionRequest): Observable<Transaction> {
    return this.http
      .post<ApiResponse<Transaction>>(API_ENDPOINTS.TRANSACTIONS.BASE, request)
      .pipe(map((res) => res.data));
  }

  // Update an existing transaction

  update(id: number, request: TransactionRequest): Observable<Transaction> {
    return this.http
      .put<ApiResponse<Transaction>>(API_ENDPOINTS.TRANSACTIONS.BY_ID(id), request)
      .pipe(map((res) => res.data));
  }

  // Delete a transaction

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(API_ENDPOINTS.TRANSACTIONS.BY_ID(id))
      .pipe(map(() => undefined));
  }
}
