import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IEventTypesRepository } from '../../../core/ports/IEventTypesRepository';
import { EventType } from '../../../core/models/event-type';

@Injectable()
export class InMemoryEventTypesRepository extends IEventTypesRepository {
  private readonly store: Map<string, EventType> = new Map();

  constructor() {
    super();
    this.seed();
  }

  findAll(): Promise<EventType[]> {
    return Promise.resolve(Array.from(this.store.values()));
  }

  findOne(id: string): Promise<EventType | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  create(data: {
    title: string;
    description: string;
    duration: number;
  }): Promise<EventType> {
    const eventType: EventType = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      duration: data.duration,
    };
    this.store.set(eventType.id, eventType);
    return Promise.resolve(eventType);
  }

  update(
    id: string,
    data: { title?: string; description?: string; duration?: number },
  ): Promise<EventType | null> {
    const existing = this.store.get(id);
    if (!existing) {
      return Promise.resolve(null);
    }
    const updated: EventType = {
      ...existing,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.duration !== undefined && { duration: data.duration }),
    };
    this.store.set(id, updated);
    return Promise.resolve(updated);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.store.delete(id));
  }

  private seed(): void {
    const initial: EventType[] = [
      {
        id: randomUUID(),
        title: 'Краткая встреча',
        description: 'Быстрая встреча для оперативных вопросов',
        duration: 15,
      },
      {
        id: randomUUID(),
        title: 'Консультация',
        description: 'Индивидуальная консультация по любому вопросу',
        duration: 30,
      },
      {
        id: randomUUID(),
        title: 'Воркшоп',
        description: 'Групповой воркшоп с практическими заданиями',
        duration: 60,
      },
    ];
    for (const item of initial) {
      this.store.set(item.id, item);
    }
  }
}
