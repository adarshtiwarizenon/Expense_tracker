import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BehaviorSubject, Observable, Subject, switchMap, tap } from 'rxjs';
import { CurrencyInrPipe } from '../../../core/shared/pipes/currency-inr.pipe';
import { SeverityPipe } from '../../../core/shared/pipes/severity.pipe';
import { PageToolbarComponent } from '../../../core/shared/components/page-toolbar/page-toolbar.component';
import { ConfirmDirective } from '../../../core/shared/directives/confirm.directive';
import { Category } from '../../../core/models/category.model';
import { FileDownloadService } from '../../../core/services/file-download.service';
import { ReportsService } from '../../reports/reports.service';
import { SkeletonModule } from 'primeng/skeleton';
import {
  Transaction,
  TransactionFilters,
  TransactionRequest,
  TransactionType,
} from '../../../core/models/transaction.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtil } from '../../../core/utils/date.util';
import { CategoryService } from '../../categories/category.service';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { TransactionService } from '../../transactions/transaction.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DatePicker,
    DividerModule,
    Select,
    MultiSelectModule,
    PanelModule,
    SplitButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    TransactionFormComponent,
    SkeletonModule,
    CurrencyInrPipe,
    SeverityPipe,
    PageToolbarComponent,
    ConfirmDirective,
  ],
  templateUrl: './transaction-list.component.html',
})
export class TransactionListComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);
  private reportsService = inject(ReportsService);
  private fileDownloadService = inject(FileDownloadService);

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  private pageSubject = new BehaviorSubject<PageResponse<Transaction> | null>(null);
  page$ = this.pageSubject.asObservable();

  totalRecords = 0;
  loading = false;

  defaultPageSize = environment.defaultPageSize;
  pageSizeOptions = environment.pageSizeOptions;

  dialogVisible = false;
  editingTransaction: Transaction | null = null;
  transactionServerError = '';

  today = new Date();

  filterType: TransactionType | null = null;
  filterCategoryIds: number[] = [];
  filterDateRange: Date[] | null = null;

  private refresh$ = new Subject<TableLazyLoadEvent | null>();

  typeOptions = [
    { label: 'All', value: null },
    { label: 'Income', value: 'INCOME' },
    { label: 'Expense', value: 'EXPENSE' },
  ];

  splitMenuItems: MenuItem[] = [
    {
      label: 'Refresh',
      icon: 'pi pi-refresh',
      command: () => this.reload(),
    },
    { separator: true },
    {
      label: 'Export CSV',
      icon: 'pi pi-file',
      command: () => this.exportCSV(),
    },
    {
      label: 'Export PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportPDF(),
    },
  ];

  // Drives all backend calls; bound directly into template via async pipe
  pageStream$: Observable<PageResponse<Transaction> | null> = this.refresh$.pipe(
    tap(() => (this.loading = true)),
    switchMap((event) =>
      this.transactionService.getAll(this.buildFilters(event ?? undefined))
    ),
    tap((page) => {
      this.pageSubject.next(page);
      this.totalRecords = page.totalElements;
      this.loading = false;
    })
  );

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => this.categoriesSubject.next(data),
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  loadTransactions(event?: TableLazyLoadEvent): void {
    this.refresh$.next(event ?? null);
  }

  private buildFilters(event?: TableLazyLoadEvent): TransactionFilters {
    const filters: TransactionFilters = {
      page: event ? Math.floor((event.first ?? 0) / (event.rows ?? this.defaultPageSize)) : 0,
      size: event?.rows ?? this.defaultPageSize,
      sortBy: (event?.sortField as string) || 'date',
      sortDir: event?.sortOrder === 1 ? 'asc' : 'desc',
    };

    if (this.filterType) filters.type = this.filterType;
    if (this.filterCategoryIds.length > 0) filters.categoryIds = this.filterCategoryIds;
    if (this.filterDateRange?.[0]) {
      filters.startDate = DateUtil.toLocalDateString(this.filterDateRange[0]);
    }
    if (this.filterDateRange?.[1]) {
      filters.endDate = DateUtil.toLocalDateString(this.filterDateRange[1]);
    }
    return filters;
  }

  applyFilters(): void {
    this.reload();
  }

  clearFilters(): void {
    this.filterType = null;
    this.filterCategoryIds = [];
    this.filterDateRange = null;
    this.reload();
  }

  private reload(): void {
    this.refresh$.next(null);
  }

  openCreateDialog(): void {
    this.editingTransaction = null;
    this.transactionServerError = '';
    this.dialogVisible = true;
  }

  openEditDialog(transaction: Transaction): void {
    this.editingTransaction = transaction;
    this.transactionServerError = '';
    this.dialogVisible = true;
  }

  onSave(request: TransactionRequest): void {
    const obs = this.editingTransaction
      ? this.transactionService.update(this.editingTransaction.id, request)
      : this.transactionService.create(request);

    obs.subscribe({
      next: () => {
        this.notification.success(
          this.editingTransaction ? 'Transaction updated' : 'Transaction created'
        );
        this.dialogVisible = false;
        this.reload();
      },
      error: (err) => {
        this.transactionServerError = err.error?.message || 'Failed to save transaction.';
      },
    });
  }

  deleteOptimistic(transaction: Transaction): void {
    const snapshot = this.pageSubject.value;
    if (snapshot) {
      this.pageSubject.next({
        ...snapshot,
        content: snapshot.content.filter((t) => t.id !== transaction.id),
      });
    }

    this.transactionService.delete(transaction.id).subscribe({
      next: () => {
        this.notification.success('Transaction deleted');
        this.reload();
      },
      error: (err) => {
        if (snapshot) this.pageSubject.next(snapshot);
        console.error('Failed to delete transaction', err);
      },
    });
  }

  exportCSV(): void {
    this.runExport('csv');
  }

  exportPDF(): void {
    this.runExport('pdf');
  }

  private runExport(format: 'csv' | 'pdf'): void {
    const startDate = this.filterDateRange?.[0]
      ? DateUtil.toLocalDateString(this.filterDateRange[0])
      : undefined;
    const endDate = this.filterDateRange?.[1]
      ? DateUtil.toLocalDateString(this.filterDateRange[1])
      : undefined;

    this.reportsService
      .exportTransactions(format, startDate, endDate, this.filterType, this.filterCategoryIds)
      .subscribe({
        next: (blob) => {
          const filename = this.fileDownloadService.generateFilename('transactions', format);
          this.fileDownloadService.downloadBlob(blob, filename);
          this.notification.success(`${format.toUpperCase()} exported successfully`);
        },
        error: (err) => console.error(`Failed to export ${format}`, err),
      });
  }

  trackById(_index: number, item: { id: number }): number {
    return item.id;
  }
}
