import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/core/exceptions/http-exception.filter';
import { EventType } from './../src/core/models/event-type';
import { Booking } from './../src/core/models/booking';
import { Slot } from './../src/core/models/slot';

describe('EventTypes (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/event-types', () => {
    it('should return a list of event types', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/event-types')
        .expect(200);

      const body = res.body as EventType[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(1);
      expect(body[0].id).toBeDefined();
      expect(body[0].title).toBeDefined();
      expect(body[0].description).toBeDefined();
      expect(body[0].duration).toBeDefined();
    });
  });

  describe('POST /api/event-types', () => {
    it('should create a new event type', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({ title: 'Test', description: 'Test desc', duration: 30 })
        .expect(200);

      const body = res.body as EventType;
      expect(body.id).toBeDefined();
      expect(body.title).toBe('Test');
      expect(body.duration).toBe(30);
    });

    it('should return 400 on invalid body', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({ title: 'No duration' })
        .expect(400);

      const body = res.body as { code: string; details: string[] };
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(body.details)).toBe(true);
    });
  });

  describe('GET /api/event-types/:id', () => {
    it('should return an event type by id', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({ title: 'Find me', description: 'Desc', duration: 15 })
        .expect(200);

      const created = createRes.body as EventType;

      const res = await request(app.getHttpServer())
        .get(`/api/event-types/${created.id}`)
        .expect(200);

      const body = res.body as EventType;
      expect(body.id).toBe(created.id);
      expect(body.title).toBe('Find me');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/event-types/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      const body = res.body as { code: string };
      expect(body.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/event-types/:id', () => {
    it('should update an existing event type', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({ title: 'Before', description: 'Before desc', duration: 30 })
        .expect(200);

      const created = createRes.body as EventType;

      const res = await request(app.getHttpServer())
        .patch(`/api/event-types/${created.id}`)
        .send({ title: 'After' })
        .expect(200);

      const body = res.body as EventType;
      expect(body.title).toBe('After');
      expect(body.duration).toBe(30);
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .patch('/api/event-types/550e8400-e29b-41d4-a716-446655440000')
        .send({ title: 'Nope' })
        .expect(404);
    });
  });

  describe('DELETE /api/event-types/:id', () => {
    it('should delete an existing event type', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/event-types')
        .send({ title: 'To delete', description: 'Desc', duration: 30 })
        .expect(200);

      const created = createRes.body as EventType;

      await request(app.getHttpServer())
        .delete(`/api/event-types/${created.id}`)
        .expect(204);
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .delete('/api/event-types/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);
    });
  });
});

describe('Bookings (e2e)', () => {
  let app: INestApplication<App>;
  let eventTypeId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/api/event-types')
      .send({ title: '30 min', description: 'Desc', duration: 30 })
      .expect(200);

    eventTypeId = (res.body as EventType).id;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/bookings', () => {
    it('should return a list of bookings', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/bookings')
        .expect(200);

      const body = res.body as Booking[];
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking on a weekday', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          eventTypeId,
          guestName: 'John',
          guestEmail: 'john@test.com',
          startTime: '2026-06-10T10:00:00.000Z', // Wednesday
        })
        .expect(200);

      const body = res.body as Booking;
      expect(body.id).toBeDefined();
      expect(body.guestName).toBe('John');
      expect(body.guestEmail).toBe('john@test.com');
    });

    it('should return 400 on invalid body', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({ eventTypeId: 'not-a-uuid' })
        .expect(400);

      const body = res.body as { code: string };
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for past startTime', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          eventTypeId,
          guestName: 'John',
          guestEmail: 'john@test.com',
          startTime: '2020-01-01T10:00:00.000Z',
        })
        .expect(400);

      const body = res.body as { code: string };
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 on duplicate slot', async () => {
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          eventTypeId,
          guestName: 'First',
          guestEmail: 'first@test.com',
          startTime: '2026-06-10T10:00:00.000Z',
        })
        .expect(200);

      const res = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          eventTypeId,
          guestName: 'Second',
          guestEmail: 'second@test.com',
          startTime: '2026-06-10T10:15:00.000Z', // overlaps with 10:00-10:30
        })
        .expect(409);

      const body = res.body as { code: string };
      expect(body.code).toBe('CONFLICT');
    });
  });

  describe('GET /api/event-types/:id/slots', () => {
    it('should return available slots on a weekday', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/event-types/${eventTypeId}/slots`)
        .query({
          from: '2026-06-08T00:00:00.000Z', // Monday
          to: '2026-06-09T00:00:00.000Z', // Tuesday
        })
        .expect(200);

      const body = res.body as Slot[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(18); // 09:00-18:00 with 30min slots
      expect(body[0].startTime).toBeDefined();
      expect(body[0].endTime).toBeDefined();
    });

    it('should return empty array on weekend', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/event-types/${eventTypeId}/slots`)
        .query({
          from: '2026-06-06T00:00:00.000Z', // Saturday
          to: '2026-06-07T00:00:00.000Z',   // Sunday (to is exclusive)
        })
        .expect(200);

      const body = res.body as Slot[];
      // Saturday and Sunday should have no slots
      expect(body.length).toBe(0);
    });

    it('should return 400 for invalid dates', async () => {
      await request(app.getHttpServer())
        .get(`/api/event-types/${eventTypeId}/slots`)
        .query({ from: 'invalid', to: 'invalid' })
        .expect(400);
    });
  });
});
