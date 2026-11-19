import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PREDEFINED_TAGS } from '../../models/task.model';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tag-input-container">
      <div class="selected-tags">
        @for (tag of selectedTags; track tag) {
          <span class="chip">
            {{ tag }}
            <button type="button" class="chip-remove" (click)="removeTag(tag)" aria-label="Remove tag">&times;</button>
          </span>
        }
      </div>

      <div class="input-and-suggestions">
        <div class="custom-input-row">
          <input
            type="text"
            class="form-input tag-input-field"
            placeholder="Add tag and press Enter"
            [(ngModel)]="newTag"
            (keydown.enter)="$event.preventDefault(); addCustomTag()"
          />
          <button type="button" class="btn btn-secondary btn-sm" (click)="addCustomTag()">Add</button>
        </div>

        <!-- Predefined tag suggestion pills -->
        <div class="predefined-tags">
          <span class="suggestions-label">Suggestions:</span>
          @for (pt of predefinedList; track pt) {
            <button
              type="button"
              class="suggestion-pill"
              [class.active]="selectedTags.includes(pt)"
              (click)="toggleTag(pt)"
            >
              {{ pt }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tag-input-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      min-height: 28px;
    }

    .custom-input-row {
      display: flex;
      gap: 8px;
    }

    .tag-input-field {
      flex: 1;
      padding: 8px 12px;
      font-size: 13px;
    }

    .predefined-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }

    .suggestions-label {
      font-size: 11px;
      color: var(--color-ink-subtle);
      margin-right: 2px;
    }

    .suggestion-pill {
      background: var(--color-surface-1);
      border: 1px solid var(--color-hairline);
      border-radius: var(--radius-none);
      padding: 2px 8px;
      font-size: 11px;
      color: var(--color-ink-muted);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;

      &:hover {
        background-color: var(--color-surface-2);
        color: var(--color-ink);
      }

      &.active {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
        color: #ffffff;
      }
    }
  `],
})
export class TagInputComponent {
  @Input() selectedTags: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();

  predefinedList = [...PREDEFINED_TAGS];
  newTag = '';

  addCustomTag(): void {
    const trimmed = this.newTag.trim();
    if (trimmed && !this.selectedTags.includes(trimmed)) {
      const updated = [...this.selectedTags, trimmed];
      this.selectedTags = updated;
      this.tagsChange.emit(updated);
    }
    this.newTag = '';
  }

  toggleTag(tag: string): void {
    if (this.selectedTags.includes(tag)) {
      this.removeTag(tag);
    } else {
      const updated = [...this.selectedTags, tag];
      this.selectedTags = updated;
      this.tagsChange.emit(updated);
    }
  }

  removeTag(tag: string): void {
    const updated = this.selectedTags.filter((t) => t !== tag);
    this.selectedTags = updated;
    this.tagsChange.emit(updated);
  }
}
