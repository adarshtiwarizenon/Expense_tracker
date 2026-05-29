import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileDownloadService {

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  generateFilename(prefix: string, format: 'csv' | 'pdf'): string {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    return `${prefix}-${dateStr}.${format}`;
  }
}