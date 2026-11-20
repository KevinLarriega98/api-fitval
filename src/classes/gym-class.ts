export interface GymClassRow {
  id: number;
  activity: string;
  room: string;
  starts_at: Date;
  spots: number;
  trainer_name: string;
}

export interface GymClass {
  id: number;
  activity: string;
  room: string;
  startsAt: Date;
  spots: number;
  trainerName: string;
}

export function toGymClass(row: GymClassRow): GymClass {
  return {
    id: row.id,
    activity: row.activity,
    room: row.room,
    startsAt: row.starts_at,
    spots: row.spots,
    trainerName: row.trainer_name,
  };
}

export interface GymClassPage {
  data: GymClass[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
