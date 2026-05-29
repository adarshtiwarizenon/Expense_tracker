import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { CurrencyInrPipe } from '../../../core/shared/pipes/currency-inr.pipe';
import { SeverityPipe } from '../../../core/shared/pipes/severity.pipe';
import { PageToolbarComponent } from '../../../core/shared/components/page-toolbar/page-toolbar.component';
import { ConfirmDirective } from '../../../core/shared/directives/confirm.directive';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { Category } from '../../../core/models/category.model';
import {
  RecurringTransaction,
  RecurringTransactionRequest,
} from '../../../core/models/recurring.model';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryService } from '../../categories/category.service';
import { RecurringFormComponent } from '../recurring-form/recurring-form.component';
import { RecurringService } from '../recurring.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recurring-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    Message,
    PanelModule,
    RecurringFormComponent,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
    PageToolbarComponent,
    CurrencyInrPipe,
    SeverityPipe,
    ConfirmDirective,
  ],
  templateUrl: './recurring-list.component.html',
  styleUrls: ['./recurring-list.component.scss'],
})
export class RecurringListComponent implements OnInit {
  private recurringService = inject(RecurringService);
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);
  private confirmation = inject(ConfirmationService);

  private recurringSubject = new BehaviorSubject<RecurringTransaction[]>([]);
  recurring$ = this.recurringSubject.asObservable();

  categories: Category[] = [];
  loading = false;
  triggering = false;

  dialogVisible = false;
  editingRecurring: RecurringTransaction | null = null;
  recurringServerError = '';

  defaultPageSize = environment.defaultPageSize;
  pageSizeOptions = environment.pageSizeOptions;

  ngOnInit(): void {
    this.loadCategories();
    this.loadRecurring();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  loadRecurring(): void {
    this.loading = true;
    this.recurringService.getAll().subscribe({
      next: (data) => {
        this.recurringSubject.next(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load recurring transactions', err);
        this.loading = false;
      },
    });
  }

  openCreateDialog(): void {
    this.editingRecurring = null;
    this.recurringServerError = '';
    this.dialogVisible = true;
  }

  openEditDialog(recurring: RecurringTransaction): void {
    this.editingRecurring = recurring;
    this.recurringServerError = '';
    this.dialogVisible = true;
  }

  onSave(request: RecurringTransactionRequest): void {
    const obs = this.editingRecurring
      ? this.recurringService.update(this.editingRecurring.id, request)
      : this.recurringService.create(request);

    obs.subscribe({
      next: () => {
        this.notification.success(
          this.editingRecurring
            ? 'Recurring transaction updated'
            : 'Recurring transaction created'
        );
        this.dialogVisible = false;
        this.loadRecurring();
      },
      error: (err) => {
        this.recurringServerError = err.error?.message || 'Failed to save';
      },
    });
  }

  deleteOptimistic(recurring: RecurringTransaction): void {
    const snapshot = this.recurringSubject.value;
    this.recurringSubject.next(snapshot.filter((r) => r.id !== recurring.id));

    this.recurringService.delete(recurring.id).subscribe({
      next: () => this.notification.success('Recurring transaction deleted'),
      error: (err) => {
        this.recurringSubject.next(snapshot);
        console.error('Failed to delete recurring transaction', err);
      },
    });
  }

  triggerNow(): void {
    this.confirmation.confirm({
      message: 'Process all due recurring transactions now?',
      header: 'Trigger Scheduler',
      icon: 'pi pi-bolt',
      accept: () => {
        this.triggering = true;
        this.recurringService.triggerNow().subscribe({
          next: (res) => {
            this.notification.success(
              `${res.transactionsCreated} transaction(s) auto-created`
            );
            this.triggering = false;
            this.loadRecurring();
          },
          error: (err) => {
            console.error('Failed to trigger recurring scheduler', err);
            this.triggering = false;
          },
        });
      },
    });
  }

  trackById(_index: number, item: { id: number }): number {
    return item.id;
  }
}
