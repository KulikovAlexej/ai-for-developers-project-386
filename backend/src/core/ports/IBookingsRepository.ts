import { Booking } from '../models/booking';

export abstract class IBookingsRepository {
  abstract findAll(): Promise<Booking[]>;
  abstract create(data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking>;
  abstract findOverlapping(startTime: Date, endTime: Date): Promise<Booking[]>;
  abstract findByEventTypeAndRange(
    eventTypeId: string,
    from: Date,
    to: Date,
  ): Promise<Booking[]>;
}
