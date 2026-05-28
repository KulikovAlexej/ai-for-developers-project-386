import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Booking, CreateBookingRequest } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  constructor(private readonly api: ApiService) {}

  findAll(): Observable<Booking[]> {
    return this.api.get<Booking[]>('/bookings');
  }

  create(dto: CreateBookingRequest): Observable<Booking> {
    return this.api.post<Booking>('/bookings', dto);
  }
}
