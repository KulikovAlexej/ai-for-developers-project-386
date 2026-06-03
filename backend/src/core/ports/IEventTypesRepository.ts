import { EventType } from '../models/event-type';

export abstract class IEventTypesRepository {
  abstract findAll(): Promise<EventType[]>;
  abstract findOne(id: string): Promise<EventType | null>;
  abstract create(data: {
    title: string;
    description: string;
    duration: number;
  }): Promise<EventType>;
  abstract update(
    id: string,
    data: { title?: string; description?: string; duration?: number },
  ): Promise<EventType | null>;
  abstract delete(id: string): Promise<boolean>;
}
