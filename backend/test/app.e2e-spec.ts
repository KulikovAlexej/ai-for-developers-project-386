import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/core/exceptions/http-exception.filter';
import { EventType } from './../src/core/models/event-type';

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
