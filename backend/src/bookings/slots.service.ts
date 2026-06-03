import { Injectable } from '@nestjs/common';
import { IBookingsRepository } from '../core/ports/IBookingsRepository';
import { Slot } from '../core/models/slot';
import { EventTypesService } from '../event-types/event-types.service';

interface WorkingHours {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

@Injectable()
export class SlotsService {
  private readonly workingHours: WorkingHours = {
    startHour: 9,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
  };

  constructor(
    private readonly eventTypesService: EventTypesService,
    private readonly bookingsRepo: IBookingsRepository,
  ) {}

  async getAvailableSlots(
    eventTypeId: string,
    from: Date,
    to: Date,
  ): Promise<Slot[]> {
    const eventType = await this.eventTypesService.findOne(eventTypeId);
    const duration = eventType.duration;

    const now = new Date();
    const generatedSlots: Slot[] = [];

    const current = new Date(
      Date.UTC(
        from.getUTCFullYear(),
        from.getUTCMonth(),
        from.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const toEnd = new Date(
      Date.UTC(
        to.getUTCFullYear(),
        to.getUTCMonth(),
        to.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    while (current.getTime() < toEnd.getTime()) {
      if (!this.isWeekend(current)) {
        const daySlots = this.generateDaySlots(current, duration, now);
        generatedSlots.push(...daySlots);
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    const bookings = await this.bookingsRepo.findByEventTypeAndRange(
      eventTypeId,
      from,
      to,
    );

    return generatedSlots.filter(
      (slot) =>
        !bookings.some(
          (booking) =>
            slot.startTime < booking.endTime &&
            slot.endTime > booking.startTime,
        ),
    );
  }

  private isWeekend(date: Date): boolean {
    const day = date.getUTCDay();
    return day === 0 || day === 6;
  }

  private generateDaySlots(date: Date, duration: number, now: Date): Slot[] {
    const dayStart = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        this.workingHours.startHour,
        this.workingHours.startMinute,
        0,
        0,
      ),
    );

    const dayEnd = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        this.workingHours.endHour,
        this.workingHours.endMinute,
        0,
        0,
      ),
    );

    const slots: Slot[] = [];
    let slotStart = new Date(dayStart);

    while (slotStart.getTime() + duration * 60 * 1000 <= dayEnd.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

      if (slotEnd > now) {
        slots.push({
          startTime: new Date(slotStart),
          endTime: slotEnd,
        });
      }

      slotStart = new Date(slotStart.getTime() + duration * 60 * 1000);
    }

    return slots;
  }
}
