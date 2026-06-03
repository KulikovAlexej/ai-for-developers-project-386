import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventTypesModule } from './event-types/event-types.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [EventTypesModule, BookingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
