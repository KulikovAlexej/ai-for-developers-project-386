import { Test, TestingModule } from '@nestjs/testing';
import { SlotsService } from './slots.service';
import { IBookingsRepository } from '../core/ports/IBookingsRepository';
import { EventTypesService } from '../event-types/event-types.service';
import { EventType } from '../core/models/event-type';

describe('SlotsService', () => {
  let service: SlotsService;
  let bookingsRepo: jest.Mocked<IBookingsRepository>;
  let eventTypesService: jest.Mocked<EventTypesService>;

  const mockEventType: EventType = {
    id: 'e1e1e1e1-e29b-41d4-a716-446655440000',
    title: '30 min',
    description: 'Desc',
    duration: 30,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotsService,
        {
          provide: EventTypesService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: IBookingsRepository,
          useValue: {
            findByEventTypeAndRange: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SlotsService>(SlotsService);
    eventTypesService = module.get(EventTypesService);
    bookingsRepo = module.get(IBookingsRepository);
  });

  describe('getAvailableSlots', () => {
    it('should return slots only on weekdays within working hours', async () => {
      const monday = new Date('2026-06-08T00:00:00.000Z'); // Monday
      const tuesday = new Date('2026-06-09T00:00:00.000Z'); // Tuesday

      eventTypesService.findOne.mockResolvedValue(mockEventType);
      bookingsRepo.findByEventTypeAndRange.mockResolvedValue([]);

      const result = await service.getAvailableSlots(
        mockEventType.id,
        monday,
        tuesday,
      );

      // Monday 09:00-18:00 with 30min slots = 18 slots
      expect(result.length).toBe(18);

      // First slot at 09:00
      expect(result[0].startTime.getUTCHours()).toBe(9);
      expect(result[0].startTime.getUTCMinutes()).toBe(0);

      // Last slot at 17:30-18:00
      const last = result[result.length - 1];
      expect(last.startTime.getUTCHours()).toBe(17);
      expect(last.startTime.getUTCMinutes()).toBe(30);
      expect(last.endTime.getUTCHours()).toBe(18);
      expect(last.endTime.getUTCMinutes()).toBe(0);
    });

    it('should exclude weekends', async () => {
      const saturday = new Date('2026-06-06T00:00:00.000Z'); // Saturday
      const tuesday = new Date('2026-06-09T00:00:00.000Z'); // Tuesday (to is exclusive)

      eventTypesService.findOne.mockResolvedValue(mockEventType);
      bookingsRepo.findByEventTypeAndRange.mockResolvedValue([]);

      const result = await service.getAvailableSlots(
        mockEventType.id,
        saturday,
        tuesday,
      );

      // Saturday(0) + Sunday(0) + Monday(18) = 18 slots
      expect(result.length).toBe(18);
    });

    it('should exclude slots that overlap with existing bookings', async () => {
      const monday = new Date('2026-06-08T00:00:00.000Z');

      eventTypesService.findOne.mockResolvedValue(mockEventType);
      bookingsRepo.findByEventTypeAndRange.mockResolvedValue([
        {
          id: 'b1',
          eventTypeId: mockEventType.id,
          guestName: 'Test',
          guestEmail: 't@t.com',
          startTime: new Date('2026-06-08T10:00:00.000Z'),
          endTime: new Date('2026-06-08T11:00:00.000Z'),
          createdAt: new Date(),
        },
      ]);

      const result = await service.getAvailableSlots(
        mockEventType.id,
        monday,
        new Date('2026-06-09T00:00:00.000Z'),
      );

      // 18 total Monday slots - 2 slots overlapped (10:00 and 10:30) = 16
      expect(result.length).toBe(16);
      expect(
        result.find((s) => s.startTime.getUTCHours() === 10),
      ).toBeUndefined();
    });

    it('should exclude past slots', async () => {
      jest.useFakeTimers({ advanceTimers: true });
      jest.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));

      const monday = new Date('2026-06-01T00:00:00.000Z');

      eventTypesService.findOne.mockResolvedValue(mockEventType);
      bookingsRepo.findByEventTypeAndRange.mockResolvedValue([]);

      const result = await service.getAvailableSlots(
        mockEventType.id,
        monday,
        new Date('2026-06-02T00:00:00.000Z'),
      );

      // All slots before 12:00 should be excluded
      // 09:00-12:00 = 6 slots excluded, 12:00-18:00 = 12 slots remaining
      expect(result.length).toBe(12);
      expect(result[0].startTime.getUTCHours()).toBe(12);
      expect(result[0].startTime.getUTCMinutes()).toBe(0);

      jest.useRealTimers();
    });

    it('should throw if event type not found', async () => {
      eventTypesService.findOne.mockRejectedValue(new Error('Not found'));

      await expect(
        service.getAvailableSlots('bad-id', new Date(), new Date()),
      ).rejects.toThrow('Not found');
    });
  });
});
