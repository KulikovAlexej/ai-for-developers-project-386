import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryBookingsRepository } from './InMemoryBookingsRepository';
import { IBookingsRepository } from '../../../core/ports/IBookingsRepository';

describe('InMemoryBookingsRepository', () => {
  let repo: IBookingsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IBookingsRepository,
          useClass: InMemoryBookingsRepository,
        },
      ],
    }).compile();

    repo = module.get<IBookingsRepository>(IBookingsRepository);
  });

  it('should create and find a booking', async () => {
    const now = new Date();
    const start = new Date(now.getTime() + 3600000);
    const end = new Date(start.getTime() + 1800000);

    const created = await repo.create({
      eventTypeId: 'event-1',
      guestName: 'John',
      guestEmail: 'john@test.com',
      startTime: start,
      endTime: end,
    });

    expect(created.id).toBeDefined();
    expect(created.guestName).toBe('John');
    expect(created.createdAt).toBeInstanceOf(Date);
  });

  it('should find all future bookings sorted', async () => {
    const now = new Date();
    const past = new Date(now.getTime() - 7200000);
    const future1 = new Date(now.getTime() + 3600000);
    const future2 = new Date(now.getTime() + 7200000);

    await repo.create({
      eventTypeId: 'e1',
      guestName: 'Past',
      guestEmail: 'p@t.com',
      startTime: past,
      endTime: new Date(past.getTime() + 1800000),
    });
    await repo.create({
      eventTypeId: 'e1',
      guestName: 'Future2',
      guestEmail: 'f2@t.com',
      startTime: future2,
      endTime: new Date(future2.getTime() + 1800000),
    });
    await repo.create({
      eventTypeId: 'e1',
      guestName: 'Future1',
      guestEmail: 'f1@t.com',
      startTime: future1,
      endTime: new Date(future1.getTime() + 1800000),
    });

    const all = await repo.findAll();
    expect(all).toHaveLength(2);
    expect(all[0].guestName).toBe('Future1');
    expect(all[1].guestName).toBe('Future2');
  });

  it('should find overlapping bookings', async () => {
    const base = new Date('2026-06-10T10:00:00Z');
    await repo.create({
      eventTypeId: 'e1',
      guestName: 'A',
      guestEmail: 'a@t.com',
      startTime: base,
      endTime: new Date(base.getTime() + 3600000),
    });

    const overlapping = await repo.findOverlapping(
      new Date('2026-06-10T10:30:00Z'),
      new Date('2026-06-10T11:30:00Z'),
    );
    expect(overlapping).toHaveLength(1);

    const nonOverlapping = await repo.findOverlapping(
      new Date('2026-06-10T11:00:00Z'),
      new Date('2026-06-10T12:00:00Z'),
    );
    expect(nonOverlapping).toHaveLength(0);
  });

  it('should find bookings by event type and range', async () => {
    const base = new Date('2026-06-10T10:00:00Z');
    await repo.create({
      eventTypeId: 'e1',
      guestName: 'A',
      guestEmail: 'a@t.com',
      startTime: base,
      endTime: new Date(base.getTime() + 3600000),
    });
    await repo.create({
      eventTypeId: 'e2',
      guestName: 'B',
      guestEmail: 'b@t.com',
      startTime: base,
      endTime: new Date(base.getTime() + 3600000),
    });

    const result = await repo.findByEventTypeAndRange(
      'e1',
      new Date('2026-06-01T00:00:00Z'),
      new Date('2026-06-30T00:00:00Z'),
    );
    expect(result).toHaveLength(1);
    expect(result[0].guestName).toBe('A');
  });
});
