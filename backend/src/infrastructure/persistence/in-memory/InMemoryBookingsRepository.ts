import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IBookingsRepository } from '../../../core/ports/IBookingsRepository';
import { Booking } from '../../../core/models/booking';

@Injectable()
export class InMemoryBookingsRepository extends IBookingsRepository {
  private readonly store: Map<string, Booking> = new Map();

  findAll(): Promise<Booking[]> {
    return Promise.resolve(
      Array.from(this.store.values())
        .filter((b) => b.startTime > new Date())
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    );
  }

  create(data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const booking: Booking = {
      id: randomUUID(),
      eventTypeId: data.eventTypeId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      startTime: data.startTime,
      endTime: data.endTime,
      createdAt: new Date(),
    };
    this.store.set(booking.id, booking);
    return Promise.resolve(booking);
  }

  findOverlapping(startTime: Date, endTime: Date): Promise<Booking[]> {
    return Promise.resolve(
      Array.from(this.store.values()).filter((b) => {
        return b.startTime < endTime && b.endTime > startTime;
      }),
    );
  }

  findByEventTypeAndRange(
    eventTypeId: string,
    from: Date,
    to: Date,
  ): Promise<Booking[]> {
    return Promise.resolve(
      Array.from(this.store.values()).filter((b) => {
        return (
          b.eventTypeId === eventTypeId &&
          b.startTime >= from &&
          b.endTime <= to
        );
      }),
    );
  }
}
