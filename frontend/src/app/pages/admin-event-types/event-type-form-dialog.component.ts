import { Component, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { EventType, CreateEventTypeRequest } from '../../models/api.types';
import { EventTypesService } from '../../services/event-types.service';

@Component({
  selector: 'app-event-type-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './event-type-form-dialog.component.html',
  styleUrl: './event-type-form-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventTypeFormDialogComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EventTypeFormDialogComponent>);
  private readonly eventTypesService = inject(EventTypesService);
  protected readonly eventType = inject<EventType | null>(MAT_DIALOG_DATA);

  protected readonly form = this.fb.nonNullable.group({
    title: [this.eventType?.title ?? '', Validators.required],
    description: [this.eventType?.description ?? '', Validators.required],
    duration: [this.eventType?.duration ?? 30, [Validators.required, Validators.min(15)]],
  });

  protected readonly isEdit = !!this.eventType;

  protected get submitError(): string | null {
    return this.form.errors?.['submitError'] ?? null;
  }

  protected submit(): void {
    if (this.form.invalid) return;

    const dto: CreateEventTypeRequest = {
      title: this.form.value.title!,
      description: this.form.value.description!,
      duration: this.form.value.duration!,
    };

    const request = this.isEdit
      ? this.eventTypesService.update(this.eventType!.id, dto)
      : this.eventTypesService.create(dto);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => this.dialogRef.close(result),
      error: () => this.form.setErrors({ submitError: 'Failed to save event type' }),
    });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
