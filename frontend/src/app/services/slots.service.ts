import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Slot } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class SlotsService {
  constructor(private readonly api: ApiService) {}

  getAvailableSlots(eventTypeId: string, from: string, to: string): Observable<Slot[]> {
    return this.api.get<Slot[]>(`/event-types/${eventTypeId}/slots?from=${from}&to=${to}`);
  }
}
