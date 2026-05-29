import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { Category, CategoryType } from '../../../core/models/category.model';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryService } from '../category.service';
import { environment } from '../../../../environments/environment';
import { PageToolbarComponent } from '../../../core/shared/components/page-toolbar/page-toolbar.component';
import { SeverityPipe } from '../../../core/shared/pipes/severity.pipe';
import { ConfirmDirective } from '../../../core/shared/directives/confirm.directive';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    DividerModule,
    Message,
    Select,
    InputTextModule,
    PanelModule,
    SplitButtonModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
    PageToolbarComponent,
    SeverityPipe,
    ConfirmDirective,
  ],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);
  private confirmation = inject(ConfirmationService);

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  selectedCategories: Category[] = [];
  loading = false;
  dialogVisible = false;
  editingCategory: Category | null = null;
  serverError = '';

  defaultPageSize = environment.defaultPageSize;
  pageSizeOptions = environment.pageSizeOptions;

  typeOptions = [
    { label: 'Expense', value: 'EXPENSE' as CategoryType },
    { label: 'Income', value: 'INCOME' as CategoryType },
  ];

  splitMenuItems: MenuItem[] = [
    {
      label: 'Refresh',
      icon: 'pi pi-refresh',
      command: () => this.loadCategories(),
    },
    { separator: true },
    {
      label: 'Delete Selected',
      icon: 'pi pi-trash',
      command: () => this.deleteSelected(),
    },
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['EXPENSE' as CategoryType, Validators.required],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categoriesSubject.next(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.loading = false;
      },
    });
  }

  openCreateDialog(): void {
    this.editingCategory = null;
    this.serverError = '';
    this.form.reset({ type: 'EXPENSE' });
    this.dialogVisible = true;
  }

  openEditDialog(category: Category): void {
    this.editingCategory = category;
    this.serverError = '';
    this.form.patchValue({ name: category.name, type: category.type });
    this.dialogVisible = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.value as any;
    const obs = this.editingCategory
      ? this.categoryService.update(this.editingCategory.id, request)
      : this.categoryService.create(request);

    obs.subscribe({
      next: () => {
        this.notification.success(this.editingCategory ? 'Category updated' : 'Category created');
        this.dialogVisible = false;
        this.form.reset({ type: 'EXPENSE' });
        this.loadCategories();
      },
      error: (err) => {
        this.serverError = err.error?.message || 'Failed to save category.';
      },
    });
  }

  deleteOptimistic(category: Category): void {
    const snapshot = this.categoriesSubject.value;
    this.categoriesSubject.next(snapshot.filter((c) => c.id !== category.id));

    this.categoryService.delete(category.id).subscribe({
      next: () => this.notification.success('Category deleted'),
      error: (err) => {
        this.categoriesSubject.next(snapshot);
        console.error('Failed to delete category', err);
      },
    });
  }

  deleteSelected(): void {
    if (this.selectedCategories.length === 0) {
      this.notification.warn('No categories selected');
      return;
    }
    this.confirmation.confirm({
      message: `Delete ${this.selectedCategories.length} selected categories?`,
      header: 'Bulk Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedCategories.map((c) =>
          this.categoryService.delete(c.id)
        );
        const count = this.selectedCategories.length;
        forkJoin(deletes).subscribe({
          next: () => {
            this.notification.success(`${count} categories deleted`);
            this.selectedCategories = [];
            this.loadCategories();
          },
          error: (err) => {
            this.notification.error(err.error?.message || 'Failed to delete some categories');
            this.selectedCategories = [];
            this.loadCategories();
          },
        });
      },
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  trackById(_index: number, item: { id: number }): number {
    return item.id;
  }
}
