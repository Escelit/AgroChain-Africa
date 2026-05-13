import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-12 bg-white rounded-xl border border-gray-100">
      <span class="text-5xl">{{ icon }}</span>
      <p class="mt-4 text-gray-500">{{ message }}</p>
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() message = 'Nothing here yet.';
}
