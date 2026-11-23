import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { Trainer, TrainerRow, toTrainer } from './trainer';
import { CreateTrainerDto } from './dto/create-trainer.dto';

@Injectable()
export class TrainersService {
  constructor(private readonly pool: Pool) {}

  async findOne(id: number): Promise<Trainer> {
    const result = await this.pool.query<TrainerRow>(
      `SELECT t.id, t.name, t.email, s.name AS specialty
       FROM trainers t
       JOIN trainer_specialties ts ON ts.trainer_id = t.id
       JOIN specialties s ON s.id = ts.specialty_id
       WHERE t.id = $1
       ORDER BY s.id`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('El monitor no existe');
    }

    return toTrainer(result.rows);
  }

  async create(dto: CreateTrainerDto): Promise<Trainer> {
    const client = await this.pool.connect();
    let trainerId: number;

    try {
      await client.query('BEGIN');

      const result = await client.query<{ id: number }>(
        `INSERT INTO trainers (dni, name, email)
       VALUES ($1, $2, $3)
       RETURNING id`,
        [dto.dni, dto.name, dto.email],
      );

      trainerId = result.rows[0].id;

      for (const specialtyId of dto.specialtyIds) {
        const specialty = await client.query(
          'SELECT id FROM specialties WHERE id = $1',
          [specialtyId],
        );

        if (specialty.rows.length === 0) {
          throw new BadRequestException(
            `No existe la especialidad ${specialtyId}`,
          );
        }

        await client.query(
          `INSERT INTO trainer_specialties (trainer_id, specialty_id)
         VALUES ($1, $2)`,
          [trainerId, specialtyId],
        );
      }

      await client.query('COMMIT');
    } catch (error: unknown) {
      await client.query('ROLLBACK');

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('El DNI o el correo ya está registrado');
      }

      throw error;
    } finally {
      client.release();
    }

    return this.findOne(trainerId);
  }
}
