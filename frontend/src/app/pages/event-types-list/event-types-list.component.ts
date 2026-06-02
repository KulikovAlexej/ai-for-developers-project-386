import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EventTypesService } from '../../services/event-types.service';
import { EventType } from '../../models/api.types';

@Component({
  selector: 'app-event-types-list',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './event-types-list.component.html',
  styleUrl: './event-types-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventTypesListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly eventTypes = signal<EventType[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor(
    private readonly eventTypesService: EventTypesService,
  ) {}

  ngOnInit(): void {
    this.eventTypesService.findAll().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
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
