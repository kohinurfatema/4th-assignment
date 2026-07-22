import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'RentNest API is running' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;
