import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

const makeToken = (id: number, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
    return void res.status(400).json({ message: 'Data tidak lengkap (password minimal 6 karakter)' });
  }
  const exist = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (exist.rowCount) return void res.status(409).json({ message: 'Email sudah terdaftar' });

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, role',
    [name, email, hash]
  );
  const user = rows[0];
  res.status(201).json({ token: makeToken(user.id, user.role), user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return void res.status(401).json({ message: 'Email atau password salah' });
  }
  res.json({
    token: makeToken(user.id, user.role),
    user: { id: user.id, name: user.name, role: user.role },
  });
};