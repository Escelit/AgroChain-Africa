import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="text-xs px-2 py-1 rounded-full font-medium" [class]="colorClass">
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() colorMap: Record<string, string> = {};

  get colorClass(): string {
    return this.colorMap[this.status] || 'bg-gray-100 text-gray-600';
  }
}
