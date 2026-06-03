import {
  Injectable,
  Inject,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { IBookingsRepository } from '../core/ports/IBookingsRepository';
import { Booking } from '../core/models/booking';
import { EventTypesService } from '../event-types/event-types.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private readonly MAX_DAYS_AHEAD = 14;

  constructor(
    @Inject(IBookingsRepository)
    private readonly repo: IBookingsRepository,
    private readonly eventTypesService: EventTypesService,
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.repo.findAll();
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    const eventType = await this.eventTypesService.findOne(dto.eventTypeId);

    const startTime = new Date(dto.startTime);
    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid startTime format');
    }

    const now = new Date();
    const maxEnd = new Date(
      now.getTime() + this.MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000,
    );

    if (startTime < now) {
      throw new BadRequestException('startTime must be in the future');
    }
    if (startTime > maxEnd) {
      throw new BadRequestException(
        `startTime must be within ${this.MAX_DAYS_AHEAD} days from now`,
      );
    }

    const endTime = new Date(
      startTime.getTime() + eventType.duration * 60 * 1000,
    );

    const overlapping = await this.repo.findOverlapping(startTime, endTime);
    if (overlapping.length > 0) {
      throw new ConflictException(
        'Selected slot overlaps with an existing booking',
      );
    }

    return this.repo.create({
      eventTypeId: dto.eventTypeId,
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      startTime,
      endTime,
    });
  }
}
