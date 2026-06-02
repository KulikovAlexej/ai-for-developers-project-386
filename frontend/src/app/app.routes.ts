import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/event-types-list/event-types-list.component').then(
        (m) => m.EventTypesListComponent,
      ),
  },
  {
    path: 'book/:eventTypeId',
    loadComponent: () =>
      import('./pages/booking/booking.component').then(
        (m) => m.BookingComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'admin/event-types',
    loadComponent: () =>
      import('./pages/admin-event-types/admin-event-types.component').then(
        (m) => m.AdminEventTypesComponent,
      ),
  },
  {
    path: 'admin/bookings',
    loadComponent: () =>
      import('./pages/admin-bookings/admin-bookings.component').then(
        (m) => m.AdminBookingsComponent,
      ),
  },
];
