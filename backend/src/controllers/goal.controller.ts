import { Response } from 'express';
import { pool } from '../config/db';
import cloudinary, { uploadImage } from '../config/cloudinary';
import { AuthRequest } from '../middlewares/auth';

// Authorization: target harus ada dan milik user yang login
const getOwnGoal = async (req: AuthRequest, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM goals WHERE id = $1', [req.params.id]);
  const goal = rows[0];
  if (!goal) {
    res.status(404).json({ message: 'Target tidak ditemukan' });
    return null;
  }
  if (goal.user_id !== req.user!.id) {
    res.status(403).json({ message: 'Ini bukan target milikmu' });
    return null;
  }
  return goal;
};

// READ: daftar target milik user
export const getGoals = async (req: AuthRequest, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY id DESC', [req.user!.id]);
  res.json(rows);
};

// CREATE: tambah barang + upload gambar
export const createGoal = async (req: AuthRequest, res: Response) => {
  const { name, target_price } = req.body;
  if (!name || !(Number(target_price) > 0) || !req.file) {
    return void res.status(400).json({ message: 'Gambar, nama, dan harga wajib diisi' });
  }
  const img = await uploadImage(req.file.buffer);
  const { rows } = await pool.query(
    'INSERT INTO goals (user_id, name, image_url, image_public_id, target_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [req.user!.id, name, img.url, img.publicId, Number(target_price)]
  );
  res.status(201).json(rows[0]);
};

// UPDATE: ubah nama, harga, atau gambar
export const updateGoal = async (req: AuthRequest, res: Response) => {
  const goal = await getOwnGoal(req, res);
  if (!goal) return;

  const name = req.body.name || goal.name;
  const price = Number(req.body.target_price) || goal.target_price;
  let { image_url, image_public_id } = goal;
  if (req.file) {
    const img = await uploadImage(req.file.buffer);
    await cloudinary.uploader.destroy(goal.image_public_id);
    image_url = img.url;
    image_public_id = img.publicId;
  }
  const { rows } = await pool.query(
    'UPDATE goals SET name = $1, target_price = $2, image_url = $3, image_public_id = $4 WHERE id = $5 RETURNING *',
    [name, price, image_url, image_public_id, goal.id]
  );
  res.json(rows[0]);
};

// Menabung: tambah saldo target
export const addSaving = async (req: AuthRequest, res: Response) => {
  const goal = await getOwnGoal(req, res);
  if (!goal) return;

  const amount = Number(req.body.amount);
  if (!(amount > 0)) return void res.status(400).json({ message: 'Nominal tidak valid' });
  if (goal.saved_amount >= goal.target_price) {
    return void res.status(400).json({ message: 'Target sudah tercapai' });
  }
  const { rows } = await pool.query(
    'UPDATE goals SET saved_amount = saved_amount + $1 WHERE id = $2 RETURNING *',
    [amount, goal.id]
  );
  res.json(rows[0]);
};

// DELETE: ambil uang, hanya kalau sudah tercapai
export const deleteGoal = async (req: AuthRequest, res: Response) => {
  const goal = await getOwnGoal(req, res);
  if (!goal) return;
  if (goal.saved_amount < goal.target_price) {
    return void res.status(400).json({ message: 'Uang baru bisa diambil setelah target tercapai' });
  }
  await cloudinary.uploader.destroy(goal.image_public_id);
  await pool.query('DELETE FROM goals WHERE id = $1', [goal.id]);
  res.json({ message: 'Uang diambil, target dihapus' });
};