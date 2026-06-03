import { Module } from '@nestjs/common';
import { IEventTypesRepository } from '../core/ports/IEventTypesRepository';
import { InMemoryEventTypesRepository } from '../infrastructure/persistence/in-memory/InMemoryEventTypesRepository';
import { EventTypesService } from './event-types.service';
import { EventTypesController } from './event-types.controller';

@Module({
  controllers: [EventTypesController],
  providers: [
    {
      provide: IEventTypesRepository,
      useClass: InMemoryEventTypesRepository,
    },
    EventTypesService,
  ],
  exports: [EventTypesService],
})
export class EventTypesModule {}
