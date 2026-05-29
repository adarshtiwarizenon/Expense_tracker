import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Message } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { Select } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Category } from '../../../core/models/category.model';
import {
  Transaction,
  TransactionRequest,
  TransactionType,
} from '../../../core/models/transaction.model';
import { DateUtil } from '../../../core/utils/date.util';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePicker,
    DialogModule,
    Message,
    DividerModule,
    Select,
    InputNumberModule,
    InputTextModule,
    Textarea,
    RadioButtonModule,
  ],
  templateUrl: './transaction-form.component.html',
})
export class TransactionFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() editingTransaction: Transaction | null = null;
  @Input() categories: Category[] = [];
  @Input() serverError = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<TransactionRequest>();

  today = new Date();

  paymentMethods = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Credit Card', value: 'Credit Card' },
    { label: 'Debit Card', value: 'Debit Card' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
    { label: 'Other', value: 'Other' },
  ];

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    type: ['EXPENSE' as TransactionType, Validators.required],
    date: [new Date(), Validators.required],
    description: [''],
    paymentMethod: [''],
    categoryId: [null as number | null, Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    const editingChanged = !!changes['editingTransaction'];
    const becameVisible =
      !!changes['visible'] && changes['visible'].currentValue === true;

    if (editingChanged || becameVisible) {
      if (this.editingTransaction) {
        this.form.patchValue({
          amount: this.editingTransaction.amount,
          type: this.editingTransaction.type,
          date: new Date(this.editingTransaction.date),
          description: this.editingTransaction.description || '',
          paymentMethod: this.editingTransaction.paymentMethod || '',
          categoryId: this.editingTransaction.categoryId,
        });
      } else {
        this.form.reset({
          type: 'EXPENSE',
          date: new Date(),
          description: '',
          paymentMethod: '',
        });
      }

    }
  }

  get filteredCategories(): Category[] {
    const selectedType = this.form.get('type')?.value;
    return this.categories.filter((c) => c.type === selectedType);
  }

  onTypeChange(): void {
    this.form.patchValue({ categoryId: null });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request: TransactionRequest = {
      amount: value.amount!,
      type: value.type!,
      date: DateUtil.toLocalDateString(value.date as Date),
      description: value.description || undefined,
      paymentMethod: value.paymentMethod || undefined,
      categoryId: value.categoryId!,
    };

    this.save.emit(request);
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}