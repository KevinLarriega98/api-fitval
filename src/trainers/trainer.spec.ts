import { toTrainer } from './trainer';

describe('toTrainer', () => {
  it('agrupa las especialidades de un monitor sin exponer su DNI', () => {
    const rows = [
      {
        id: 1,
        name: 'Carla Navarro',
        email: 'carla@gym.com',
        specialty: 'Ciclo indoor',
      },
      {
        id: 1,
        name: 'Carla Navarro',
        email: 'carla@gym.com',
        specialty: 'Fuerza',
      },
    ];

    expect(toTrainer(rows)).toEqual({
      id: 1,
      name: 'Carla Navarro',
      email: 'carla@gym.com',
      specialties: ['Ciclo indoor', 'Fuerza'],
    });
  });
});
