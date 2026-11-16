export interface PlanRow {
  id: number;
  name: string;
  monthly_price: string;
  member_count: number;
}

export interface Plan {
  id: number;
  name: string;
  monthlyPrice: number;
  memberCount: number;
}

export function toPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    monthlyPrice: Number(row.monthly_price),
    memberCount: row.member_count,
  };
}
