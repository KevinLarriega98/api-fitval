export type UserRole = 'member' | 'staff';

// Fila de PostgreSQL: solo para uso interno.
export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
}

// Datos que podemos devolver al cliente.
export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
  };
}
