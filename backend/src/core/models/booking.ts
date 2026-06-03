export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}
