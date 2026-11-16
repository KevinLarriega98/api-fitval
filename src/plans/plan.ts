// Así llega un plan desde PostgreSQL (una fila)
export interface PlanRow {
  id: number;
  name: string;
  monthly_price: string; // ¡ojo! NUMERIC llega como texto: "29.90"
  member_count: number;
}

// Así lo devuelve nuestra API
export interface Plan {
  id: number;
  name: string;
  monthlyPrice: number;
  memberCount: number;
}

// Convierte una fila en un plan de la API
export function toPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    monthlyPrice: Number(row.monthly_price), // "29.90" → 29.9
    memberCount: "Error de prueba",
  };
}
