export interface BookingRow {
  id: number;
  member_id: number;
  class_id: number;
  booked_at: string;
}

export interface Booking {
  id: number;
  memberId: number;
  classId: number;
  bookedAt: string;
}

export function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    memberId: row.member_id,
    classId: row.class_id,
    bookedAt: row.booked_at,
  };
}
