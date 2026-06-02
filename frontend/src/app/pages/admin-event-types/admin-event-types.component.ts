import { Component, inject, DestroyRef, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EventType } from '../../models/api.types';
import { EventTypesService } from '../../services/event-types.service';
import { EventTypeFormDialogComponent } from './event-type-form-dialog.component';

@Component({
  selector: 'app-admin-event-types',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-event-types.component.html',
  styleUrl: './admin-event-types.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEventTypesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly eventTypesService = inject(EventTypesService);

  protected readonly eventTypes = signal<EventType[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly displayedColumns = ['title', 'description', 'duration', 'actions'];

  ngOnInit(): void {
    this.loadEventTypes();
  }

  protected openCreateDialog(): void {
    const ref = this.dialog.open(EventTypeFormDialogComponent, {
      data: null,
    });

    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) {
        this.eventTypes.update((list) => [...list, result]);
        this.snackBar.open('Event type created', 'Close', { duration: 3000 });
      }
    });
  }

  protected openEditDialog(eventType: EventType): void {
    const ref = this.dialog.open(EventTypeFormDialogComponent, {
      data: eventType,
    });

    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) {
        this.eventTypes.update((list) =>
          list.map((et) => (et.id === result.id ? result : et)),
        );
        this.snackBar.open('Event type updated', 'Close', { duration: 3000 });
      }
    });
  }

  protected deleteEventType(eventType: EventType): void {
    if (!confirm(`Delete "${eventType.title}"? This action cannot be undone.`)) return;

    this.eventTypesService.delete(eventType.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.eventTypes.update((list) => list.filter((et) => et.id !== eventType.id));
        this.snackBar.open('Event type deleted', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete event type', 'Close', { duration: 3000 });
      },
    });
  }

  private loadEventTypes(): void {
    this.eventTypesService.findAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (types) => {
        this.eventTypes.set(types);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load event types');
        this.loading.set(false);
      },
    });
  }
}
