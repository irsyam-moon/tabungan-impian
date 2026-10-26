import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

// Authentication: cek token JWT
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return void res.status(401).json({ message: 'Silakan login dulu' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; role: string };
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

// Authorization: batasi akses berdasarkan role
export const authorize = (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== role) return void res.status(403).json({ message: 'Akses ditolak' });
  next();
};