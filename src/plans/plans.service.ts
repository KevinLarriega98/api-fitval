import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Plan, PlanRow, toPlan } from './plan';

@Injectable()
export class PlansService {
  constructor(private readonly pool: Pool) {}

  // GET /api/plans: del más barato al más caro
  async findAll(): Promise<Plan[]> {
    const result = await this.pool.query<PlanRow>(
      `SELECT p.id, p.name, p.monthly_price,
        COUNT(m.id)::int AS member_count
 FROM plans p
 LEFT JOIN members m ON m.plan_id = p.id
 GROUP BY p.id, p.name, p.monthly_price
 ORDER BY p.monthly_price`,
    );
    return result.rows.map(toPlan); // cada fila → un plan de la API
  }
}
