import { Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { GymClass, GymClassRow, toGymClass } from './gym-class';

@Injectable()
export class ClassesService {
  constructor(private readonly pool: Pool) {}

  async findAll(activity?: string): Promise<GymClass[]> {
    const query = `
      SELECT c.id, c.activity, c.room, c.starts_at, c.spots,
             t.name AS trainer_name
      FROM classes c
      JOIN trainers t ON t.id = c.trainer_id
    `;

    const result =
      activity !== undefined
        ? await this.pool.query<GymClassRow>(
            `${query}
             WHERE c.activity ILIKE '%' || $1 || '%'
             ORDER BY c.starts_at`,
            [activity],
          )
        : await this.pool.query<GymClassRow>(`${query} ORDER BY c.starts_at`);

    return result.rows.map(toGymClass);
  }

  async findOne(id: number): Promise<GymClass> {
    const result = await this.pool.query<GymClassRow>(
      `SELECT c.id, c.activity, c.room, c.starts_at, c.spots,
              t.name AS trainer_name
       FROM classes c
       JOIN trainers t ON t.id = c.trainer_id
       WHERE c.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('La clase no existe');
    }

    return toGymClass(result.rows[0]);
  }
}
