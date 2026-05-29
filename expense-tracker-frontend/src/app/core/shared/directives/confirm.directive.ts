import { Directive, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Directive({
  selector: '[appConfirm]',
  standalone: true,
})
export class ConfirmDirective {
  private confirmation = inject(ConfirmationService);

  @Input() confirmMessage = 'Are you sure?';
  @Input() confirmHeader = 'Confirm';
  @Input() confirmIcon = 'pi pi-exclamation-triangle';
  @Output() confirmed = new EventEmitter<void>();

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();
    this.confirmation.confirm({
      message: this.confirmMessage,
      header: this.confirmHeader,
      icon: this.confirmIcon,
      accept: () => this.confirmed.emit(),
    });
  }
}
