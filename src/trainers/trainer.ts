export interface TrainerRow {
  id: number;
  name: string;
  email: string;
  specialty: string;
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  specialties: string[];
}

export function toTrainer(rows: TrainerRow[]): Trainer {
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    specialties: rows.map((row) => row.specialty),
  };
}
