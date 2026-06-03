import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IEventTypesRepository } from '../core/ports/IEventTypesRepository';
import { EventType } from '../core/models/event-type';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@Injectable()
export class EventTypesService {
  constructor(
    @Inject(IEventTypesRepository)
    private readonly repo: IEventTypesRepository,
  ) {}

  async findAll(): Promise<EventType[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<EventType> {
    const eventType = await this.repo.findOne(id);
    if (!eventType) {
      throw new NotFoundException(`Event type with id "${id}" not found`);
    }
    return eventType;
  }

  async create(dto: CreateEventTypeDto): Promise<EventType> {
    return this.repo.create({
      title: dto.title,
      description: dto.description,
      duration: dto.duration,
    });
  }

  async update(id: string, dto: UpdateEventTypeDto): Promise<EventType> {
    const updated = await this.repo.update(id, {
      title: dto.title,
      description: dto.description,
      duration: dto.duration,
    });
    if (!updated) {
      throw new NotFoundException(`Event type with id "${id}" not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Event type with id "${id}" not found`);
    }
  }
}
