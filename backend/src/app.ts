import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import goalRoutes from './routes/goal.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/', (_req, res) => res.json({ message: 'API Tabungan Impian berjalan' }));
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/admin', adminRoutes);

export default app;