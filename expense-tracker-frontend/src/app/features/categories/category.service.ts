import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, ReplaySubject, defer, map, shareReplay, tap } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiResponse } from '../../core/models/api-response.model';
import { Category, CategoryRequest } from '../../core/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  private invalidate$ = new ReplaySubject<void>(1);
  private cache$?: Observable<Category[]>;

  // Cached: subsequent calls reuse the last result until a mutation invalidates it.
  getAll(): Observable<Category[]> {
    if (!this.cache$) {
      this.cache$ = defer(() =>
        this.http
          .get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.BASE)
          .pipe(map((res) => res.data))
      ).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.cache$;
  }

  getById(id: number): Observable<Category> {
    return this.http
      .get<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BY_ID(id))
      .pipe(map((res) => res.data));
  }

  create(request: CategoryRequest): Observable<Category> {
    return this.http
      .post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BASE, request)
      .pipe(
        map((res) => res.data),
        tap(() => this.invalidateCache())
      );
  }

  update(id: number, request: CategoryRequest): Observable<Category> {
    return this.http
      .put<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BY_ID(id), request)
      .pipe(
        map((res) => res.data),
        tap(() => this.invalidateCache())
      );
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(API_ENDPOINTS.CATEGORIES.BY_ID(id))
      .pipe(
        map(() => undefined),
        tap(() => this.invalidateCache())
      );
  }

  private invalidateCache(): void {
    this.cache$ = undefined;
    this.invalidate$.next();
  }
}
