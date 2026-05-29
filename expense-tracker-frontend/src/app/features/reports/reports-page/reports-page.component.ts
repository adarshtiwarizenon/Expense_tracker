import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateUtil } from '../../../core/utils/date.util';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { Message } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { FileDownloadService } from '../../../core/services/file-download.service';
import { PageToolbarComponent } from '../../../core/shared/components/page-toolbar/page-toolbar.component';
import { NotificationService } from '../../../core/services/notification.service';
import { ExportFormat, ReportsService } from '../reports.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DatePicker,
    DividerModule,
    Message,
    PanelModule,
    TooltipModule,
    PageToolbarComponent,
  ],
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss'],
})
export class ReportsPageComponent {
  private reportsService = inject(ReportsService);
  private fileDownloadService = inject(FileDownloadService);
  private notification = inject(NotificationService);

  dateRange: Date[] | null = null;
  exporting = false;
  exportingFormat: ExportFormat | null = null;
  today = new Date();

  exportCSV(): void {
    this.export('csv');
  }

  exportPDF(): void {
    this.export('pdf');
  }

  private export(format: ExportFormat): void {
    this.exporting = true;
    this.exportingFormat = format;

    const startDate = this.dateRange?.[0]
      ? DateUtil.toLocalDateString(this.dateRange[0])
      : undefined;
    const endDate = this.dateRange?.[1]
      ? DateUtil.toLocalDateString(this.dateRange[1])
      : undefined;

    this.reportsService.exportTransactions(format, startDate, endDate).subscribe({
      next: (blob) => {
        const filename = this.fileDownloadService.generateFilename('transactions', format);
        this.fileDownloadService.downloadBlob(blob, filename);
        this.notification.success(`${format.toUpperCase()} exported successfully`);
        this.exporting = false;
        this.exportingFormat = null;
      },
      error: (err) => {
        console.error(`Failed to export ${format}`, err);
        this.exporting = false;
        this.exportingFormat = null;
      },
    });
  }

  clearFilter(): void {
    this.dateRange = null;
  }

  hasDateRange(): boolean {
    return !!(this.dateRange?.[0] && this.dateRange?.[1]);
  }
}