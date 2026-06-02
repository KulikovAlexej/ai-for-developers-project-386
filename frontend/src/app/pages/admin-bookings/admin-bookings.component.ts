import { Component, inject, DestroyRef, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { Booking } from '../../models/api.types';
import { BookingsService } from '../../services/bookings.service';
import { EventTypesService } from '../../services/event-types.service';

@Component({
  selector: 'app-admin-bookings',
  imports: [
    RouterLink,
    RouterLinkActive,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
  ],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBookingsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly bookingsService = inject(BookingsService);
  private readonly eventTypesService = inject(EventTypesService);

  protected readonly bookings = signal<Booking[]>([]);
  protected readonly eventTypeMap = signal<Record<string, string>>({});
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly displayedColumns = ['guestName', 'guestEmail', 'eventType', 'startTime', 'endTime'];

  ngOnInit(): void {
    this.loadData();
  }

  protected getEventTypeTitle(eventTypeId: string): string {
    return this.eventTypeMap()[eventTypeId] ?? eventTypeId;
  }

  private loadData(): void {
    forkJoin({
      eventTypes: this.eventTypesService.findAll(),
      bookings: this.bookingsService.findAll(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ eventTypes, bookings }) => {
          const map: Record<string, string> = {};
          for (const et of eventTypes) {
            map[et.id] = et.title;
          }
          this.eventTypeMap.set(map);
          this.bookings.set(
            [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime)),
          );
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? 'Failed to load bookings');
          this.loading.set(false);
        },
      });
  }
}
