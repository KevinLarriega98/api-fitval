import { Module } from '@nestjs/common';
import { Pool } from 'pg';

function createPool() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  pool.on('error', (error) => console.error('PostgreSQL:', error.message));

  return pool;
}

@Module({
  providers: [
    {
      provide: Pool,
      useFactory: createPool,
    },
  ],
  exports: [Pool],
})
export class DatabaseModule {}
