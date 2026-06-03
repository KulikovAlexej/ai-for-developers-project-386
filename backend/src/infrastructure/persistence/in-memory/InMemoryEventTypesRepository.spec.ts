import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryEventTypesRepository } from './InMemoryEventTypesRepository';
import { IEventTypesRepository } from '../../../core/ports/IEventTypesRepository';

describe('InMemoryEventTypesRepository', () => {
  let repo: IEventTypesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IEventTypesRepository,
          useClass: InMemoryEventTypesRepository,
        },
      ],
    }).compile();

    repo = module.get<IEventTypesRepository>(IEventTypesRepository);
  });

  it('should return seeded event types on findAll', async () => {
    const result = await repo.findAll();
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('duration');
  });

  it('should find one by id', async () => {
    const all = await repo.findAll();
    const first = all[0];
    const found = await repo.findOne(first.id);
    expect(found).toEqual(first);
  });

  it('should return null for non-existent id', async () => {
    const result = await repo.findOne('non-existent');
    expect(result).toBeNull();
  });

  it('should create a new event type', async () => {
    const created = await repo.create({
      title: 'Test',
      description: 'Test desc',
      duration: 45,
    });
    expect(created.id).toBeDefined();
    expect(created.title).toBe('Test');
    expect(created.duration).toBe(45);
    const all = await repo.findAll();
    expect(all).toHaveLength(4);
  });

  it('should update an existing event type', async () => {
    const all = await repo.findAll();
    const first = all[0];
    const updated = await repo.update(first.id, { title: 'Updated' });
    expect(updated).not.toBeNull();
    expect(updated!.title).toBe('Updated');
    expect(updated!.duration).toBe(first.duration);
  });

  it('should return null when updating non-existent', async () => {
    const result = await repo.update('non-existent', { title: 'Nope' });
    expect(result).toBeNull();
  });

  it('should delete an existing event type', async () => {
    const all = await repo.findAll();
    const first = all[0];
    const deleted = await repo.delete(first.id);
    expect(deleted).toBe(true);
    const allAfter = await repo.findAll();
    expect(allAfter).toHaveLength(2);
  });

  it('should return false when deleting non-existent', async () => {
    const result = await repo.delete('non-existent');
    expect(result).toBe(false);
  });
});
