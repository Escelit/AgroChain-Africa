import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
          <h3 class="font-semibold text-gray-800 text-lg">{{ title }}</h3>
          <p class="text-gray-500 text-sm mt-2">{{ message }}</p>
          <div class="flex gap-3 mt-6">
            <button (click)="cancel.emit()" class="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button (click)="confirm.emit()" [class]="'flex-1 text-white py-2 rounded-lg transition-colors ' + confirmClass">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Confirm';
  @Input() confirmClass = 'bg-red-600 hover:bg-red-700';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
