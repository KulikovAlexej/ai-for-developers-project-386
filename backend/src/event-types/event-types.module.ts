import { Module } from '@nestjs/common';
import { IEventTypesRepository } from '../core/ports/IEventTypesRepository';
import { InMemoryEventTypesRepository } from '../infrastructure/persistence/in-memory/InMemoryEventTypesRepository';

@Module({
  providers: [
    {
      provide: IEventTypesRepository,
      useClass: InMemoryEventTypesRepository,
    },
  ],
  exports: [IEventTypesRepository],
})
export class EventTypesModule {}
