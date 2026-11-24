import { PlanRow, toPlan } from './plan';

describe('toPlan', () => {
  it('convierte el precio de texto a número', () => {
    const row: PlanRow = {
      id: 1,
      name: 'Básico',
      monthly_price: '29.90',
      member_count: 3,
    };

    const plan = toPlan(row);

    expect(plan.monthlyPrice).toBe(99);
  });
});
