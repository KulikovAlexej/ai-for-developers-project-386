import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EventType, CreateEventTypeRequest, UpdateEventTypeRequest } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class EventTypesService {
  constructor(private readonly api: ApiService) {}

  findAll(): Observable<EventType[]> {
    return this.api.get<EventType[]>('/event-types');
  }

  findOne(id: string): Observable<EventType> {
    return this.api.get<EventType>(`/event-types/${id}`);
  }

  create(dto: CreateEventTypeRequest): Observable<EventType> {
    return this.api.post<EventType>('/event-types', dto);
  }

  update(id: string, dto: UpdateEventTypeRequest): Observable<EventType> {
    return this.api.patch<EventType>(`/event-types/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/event-types/${id}`);
  }
}
