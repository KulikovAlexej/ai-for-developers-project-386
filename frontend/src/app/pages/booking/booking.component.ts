import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';

import { EventTypesService } from '../../services/event-types.service';
import { SlotsService } from '../../services/slots.service';
import { BookingsService } from '../../services/bookings.service';
import { EventType, Slot, Booking, CreateBookingRequest } from '../../models/api.types';

@Component({
  selector: 'app-booking',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly eventType = signal<EventType | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedDate = signal<Date | null>(null);
  protected readonly slots = signal<Slot[]>([]);
  protected readonly slotsLoading = signal(false);
  protected readonly selectedSlot = signal<Slot | null>(null);
  protected readonly submitting = signal(false);
  protected readonly bookingResult = signal<Booking | null>(null);
  protected readonly conflictError = signal<string | null>(null);

  protected readonly today = new Date();
  protected readonly maxDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  protected bookingForm = this.fb.nonNullable.group({
    guestName: ['', Validators.required],
    guestEmail: ['', [Validators.required, Validators.email]],
  });

  private eventTypeId = '';

  constructor(
    private readonly eventTypesService: EventTypesService,
    private readonly slotsService: SlotsService,
    private readonly bookingsService: BookingsService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(params => {
      this.eventTypeId = params['eventTypeId'];
      this.resetState();
      this.loadEventType();
    });
  }

  private resetState(): void {
    this.eventType.set(null);
    this.loading.set(true);
    this.error.set(null);
    this.selectedDate.set(null);
    this.slots.set([]);
    this.slotsLoading.set(false);
    this.selectedSlot.set(null);
    this.submitting.set(false);
    this.bookingResult.set(null);
    this.conflictError.set(null);
    this.bookingForm.reset({ guestName: '', guestEmail: '' });
  }

  private loadEventType(): void {
    this.eventTypesService.findOne(this.eventTypeId).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (type) => {
        this.eventType.set(type);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load event type');
        this.loading.set(false);
      },
    });
  }

  protected onDateSelected(date: Date | null): void {
    if (!date) return;

    this.selectedDate.set(date);
    this.selectedSlot.set(null);
    this.conflictError.set(null);
    this.slotsLoading.set(true);

    const from = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const to = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString();

    this.slotsService.getAvailableSlots(this.eventTypeId, from, to).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.slotsLoading.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.slotsLoading.set(false);
      },
    });
  }

  protected selectSlot(slot: Slot): void {
    this.selectedSlot.set(slot);
    this.conflictError.set(null);
  }

  protected onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const slot = this.selectedSlot();
    if (!slot) return;

    this.submitting.set(true);
    this.conflictError.set(null);

    const { guestName, guestEmail } = this.bookingForm.value;
    const dto: CreateBookingRequest = {
      eventTypeId: this.eventTypeId,
      guestName: guestName!,
      guestEmail: guestEmail!,
      startTime: slot.startTime,
    };

    this.bookingsService.create(dto).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (booking) => {
        this.bookingResult.set(booking);
        this.submitting.set(false);
      },
      error: (err) => {
        this.conflictError.set(err.message ?? 'Failed to create booking');
        this.submitting.set(false);
      },
    });
  }
}
