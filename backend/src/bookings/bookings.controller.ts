import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from '../core/models/booking';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll(): Promise<Booking[]> {
    return this.bookingsService.findAll();
  }

  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateBookingDto): Promise<Booking> {
    return this.bookingsService.create(dto);
  }
}
