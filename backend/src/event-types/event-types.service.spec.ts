/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { IEventTypesRepository } from '../core/ports/IEventTypesRepository';
import { EventType } from '../core/models/event-type';

describe('EventTypesService', () => {
  let service: EventTypesService;
  let repo: jest.Mocked<IEventTypesRepository>;

  const mockEventType: EventType = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test',
    description: 'Desc',
    duration: 30,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventTypesService,
        {
          provide: IEventTypesRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventTypesService>(EventTypesService);
    repo = module.get(IEventTypesRepository);
  });

  describe('findAll', () => {
    it('should return all event types', async () => {
      repo.findAll.mockResolvedValue([mockEventType]);
      const result = await service.findAll();
      expect(result).toEqual([mockEventType]);
      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return an event type by id', async () => {
      repo.findOne.mockResolvedValue(mockEventType);
      const result = await service.findOne(mockEventType.id);
      expect(result).toEqual(mockEventType);
      expect(repo.findOne).toHaveBeenCalledWith(mockEventType.id);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new event type', async () => {
      const dto = { title: 'New', description: 'New desc', duration: 45 };
      repo.create.mockResolvedValue({ id: 'new-id', ...dto });
      const result = await service.create(dto);
      expect(result).toMatchObject(dto);
      expect(repo.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update and return the event type', async () => {
      repo.update.mockResolvedValue({ ...mockEventType, title: 'Updated' });
      const result = await service.update(mockEventType.id, {
        title: 'Updated',
      });
      expect(result.title).toBe('Updated');
      expect(repo.update).toHaveBeenCalledWith(mockEventType.id, {
        title: 'Updated',
      });
    });

    it('should throw NotFoundException if not found', async () => {
      repo.update.mockResolvedValue(null);
      await expect(
        service.update('non-existent', { title: 'Nope' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete and return void', async () => {
      repo.delete.mockResolvedValue(true);
      await expect(service.delete(mockEventType.id)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(mockEventType.id);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.delete.mockResolvedValue(false);
      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
