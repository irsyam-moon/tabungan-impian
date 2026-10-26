import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getUsers = async (_req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
  res.json(rows);
};