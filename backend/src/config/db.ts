import 'dotenv/config';
import { Pool, types } from 'pg';

types.setTypeParser(20, (v) => parseInt(v, 10));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});