import { Component, Input } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-page-toolbar',
  standalone: true,
  imports: [ToolbarModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template pTemplate="start">
        <h2 class="m-0">{{ title }}</h2>
      </ng-template>
      <ng-template pTemplate="end">
        <ng-content></ng-content>
      </ng-template>
    </p-toolbar>
  `,
})
export class PageToolbarComponent {
  @Input({ required: true }) title!: string;
}
