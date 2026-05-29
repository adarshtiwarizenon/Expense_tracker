import { Pipe, PipeTransform } from '@angular/core';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Pipe({
  name: 'severity',
  standalone: true,
})
export class SeverityPipe implements PipeTransform {
  transform(value: string | null | undefined, kind: 'type' | 'status' | 'frequency' = 'type'): Severity {
    if (!value) return 'secondary';

    if (kind === 'type') {
      return value === 'INCOME' ? 'success' : 'danger';
    }

    if (kind === 'status') {
      if (value === 'EXCEEDED') return 'danger';
      if (value === 'WARNING') return 'warn';
      return 'success';
    }

    if (kind === 'frequency') {
      if (value === 'DAILY') return 'warn';
      if (value === 'WEEKLY') return 'info';
      return 'success';
    }

    return 'secondary';
  }
}
