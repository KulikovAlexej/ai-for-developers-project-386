import { Module } from '@nestjs/common';
import { IBookingsRepository } from '../core/ports/IBookingsRepository';
import { InMemoryBookingsRepository } from '../infrastructure/persistence/in-memory/InMemoryBookingsRepository';
import { EventTypesModule } from '../event-types/event-types.module';
import { BookingsService } from './bookings.service';
import { SlotsService } from './slots.service';
import { BookingsController } from './bookings.controller';
import { SlotsController } from './slots.controller';

@Module({
  imports: [EventTypesModule],
  controllers: [BookingsController, SlotsController],
  providers: [
    {
      provide: IBookingsRepository,
      useClass: InMemoryBookingsRepository,
    },
    BookingsService,
    SlotsService,
  ],
  exports: [IBookingsRepository],
})
export class BookingsModule {}
