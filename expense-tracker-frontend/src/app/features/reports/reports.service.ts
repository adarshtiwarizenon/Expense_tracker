import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

export type ExportFormat = 'csv' | 'pdf';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);

  exportTransactions(
    format: ExportFormat,
    startDate?: string,
    endDate?: string,
    type?: string | null,
    categoryIds?: number[]
  ): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (startDate != null) params = params.set('startDate', startDate);
    if (endDate != null) params = params.set('endDate', endDate);
    if (type != null) params = params.set('type', String(type));
    if (categoryIds?.length) {
      categoryIds.forEach(id => {
        params = params.append('categoryIds', String(id));
      });
    }

    return this.http.get(API_ENDPOINTS.REPORTS.EXPORT, {
      params,
      responseType: 'blob',
    });
  }
}