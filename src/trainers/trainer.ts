export interface TrainerRow {
  id: number;
  name: string;
  email: string;
  photo_url: string | null;
  specialty: string;
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  photoUrl: string | null;
  specialties: string[];
}

export function toTrainer(rows: TrainerRow[]): Trainer {
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    photoUrl: rows[0].photo_url,
    specialties: rows.map((row) => row.specialty),
  };
}
