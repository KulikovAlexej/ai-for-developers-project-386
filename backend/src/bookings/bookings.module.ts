import { Module } from '@nestjs/common';
import { IBookingsRepository } from '../core/ports/IBookingsRepository';
import { InMemoryBookingsRepository } from '../infrastructure/persistence/in-memory/InMemoryBookingsRepository';

@Module({
  providers: [
    {
      provide: IBookingsRepository,
      useClass: InMemoryBookingsRepository,
    },
  ],
  exports: [IBookingsRepository],
})
export class BookingsModule {}
