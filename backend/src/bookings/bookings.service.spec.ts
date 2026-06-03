/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { IBookingsRepository } from '../core/ports/IBookingsRepository';
import { EventTypesService } from '../event-types/event-types.service';
import { EventType } from '../core/models/event-type';

describe('BookingsService', () => {
  let service: BookingsService;
  let repo: jest.Mocked<IBookingsRepository>;
  let eventTypesService: jest.Mocked<EventTypesService>;

  const mockEventType: EventType = {
    id: 'e1e1e1e1-e29b-41d4-a716-446655440000',
    title: 'Consultation',
    description: 'Desc',
    duration: 30,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: IBookingsRepository,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOverlapping: jest.fn(),
            findByEventTypeAndRange: jest.fn(),
          },
        },
        {
          provide: EventTypesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    repo = module.get(IBookingsRepository);
    eventTypesService = module.get(EventTypesService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('findAll', () => {
    it('should return all bookings', async () => {
      repo.findAll.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    const validDto = {
      eventTypeId: 'e1e1e1e1-e29b-41d4-a716-446655440000',
      guestName: 'John',
      guestEmail: 'john@test.com',
      startTime: '2026-06-10T10:00:00.000Z',
    };

    it('should create and return a booking', async () => {
      jest.useFakeTimers({ advanceTimers: true });
      jest.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));

      eventTypesService.findOne.mockResolvedValue(mockEventType);
      repo.findOverlapping.mockResolvedValue([]);
      repo.create.mockImplementation((data) => Promise.resolve({
        id: 'new-booking-id',
        eventTypeId: data.eventTypeId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        startTime: data.startTime,
        endTime: data.endTime,
        createdAt: new Date(),
      }));

      const result = await service.create(validDto);

      expect(result.id).toBeDefined();
      expect(result.guestName).toBe('John');
      expect(repo.create).toHaveBeenCalledTimes(1);
    });

    it('should throw if event type not found', async () => {
      eventTypesService.findOne.mockRejectedValue(
        new BadRequestException('Event type not found'),
      );

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if startTime is in the past', async () => {
      const dto = {
        ...validDto,
        startTime: '2020-01-01T00:00:00.000Z',
      };
      eventTypesService.findOne.mockResolvedValue(mockEventType);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if startTime is beyond 14 days', async () => {
      eventTypesService.findOne.mockResolvedValue(mockEventType);

      await expect(
        service.create({
          ...validDto,
          startTime: '2099-06-10T10:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw on overlap', async () => {
      jest.useFakeTimers({ advanceTimers: true });
      jest.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));

      eventTypesService.findOne.mockResolvedValue(mockEventType);
      repo.findOverlapping.mockResolvedValue([
        {
          id: 'existing',
          eventTypeId: 'e1',
          guestName: 'Existing',
          guestEmail: 'e@t.com',
          startTime: new Date('2026-06-10T10:00:00.000Z'),
          endTime: new Date('2026-06-10T10:30:00.000Z'),
          createdAt: new Date(),
        },
      ]);

      await expect(service.create(validDto)).rejects.toThrow(ConflictException);
    });
  });
});
