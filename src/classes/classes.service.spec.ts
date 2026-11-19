import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { ClassesService } from './classes.service';

const spinningRow = {
  id: 1,
  activity: 'Spinning',
  room: 'Sala 1',
  starts_at: new Date('2026-11-02T09:00:00Z'),
  spots: 12,
  trainer_name: 'Carla Navarro',
};

describe('ClassesService', () => {
  const fakePool = { query: jest.fn() };
  const service = new ClassesService(fakePool as unknown as Pool);

  beforeEach(() => {
    fakePool.query.mockReset();
  });

  it('findOne lanza un 404 si no hay ninguna fila', async () => {
    fakePool.query.mockResolvedValue({ rows: [] });

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('findOne devuelve la clase convertida cuando encuentra una fila', async () => {
    fakePool.query.mockResolvedValue({ rows: [spinningRow] });

    const gymClass = await service.findOne(1);

    expect(gymClass.trainerName).toBe('Carla Navarro');
    expect(gymClass.startsAt).toEqual(new Date('2026-11-02T09:00:00Z'));
  });

  it('create rechaza un monitor inexistente sin hacer el INSERT', async () => {
    fakePool.query.mockResolvedValue({ rows: [] });

    const dto = {
      activity: 'Fuerza',
      room: 'Sala 3',
      startsAt: '2026-11-10T18:00:00Z',
      spots: 15,
      trainerId: 99,
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);

    expect(fakePool.query).toHaveBeenCalledTimes(1);
  });

  it('remove rechaza una clase con reservas sin hacer el DELETE', async () => {
    fakePool.query
      .mockResolvedValueOnce({ rows: [spinningRow] })
      .mockResolvedValueOnce({ rows: [{ total: 3 }] });

    await expect(service.remove(1)).rejects.toThrow(ConflictException);

    expect(fakePool.query).toHaveBeenCalledTimes(2);
  });

  it('remove devuelve y borra una clase sin reservas', async () => {
    fakePool.query
      .mockResolvedValueOnce({ rows: [spinningRow] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const gymClass = await service.remove(1);

    expect(gymClass).toEqual({
      id: 1,
      activity: 'Spinning',
      room: 'Sala 1',
      startsAt: new Date('2026-11-02T09:00:00Z'),
      spots: 12,
      trainerName: 'Carla Navarro',
    });

    expect(fakePool.query).toHaveBeenCalledTimes(3);
    expect(fakePool.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('DELETE'),
      [1],
    );
  });
});
