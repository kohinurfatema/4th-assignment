import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/categories.routes';
import propertyRoutes from './modules/properties/properties.routes';
import rentalRoutes from './modules/rentals/rentals.routes';
import landlordRoutes from './modules/rentals/landlord.routes';
import paymentRoutes, { stripeWebhook } from './modules/payments/payments.routes';
import reviewRoutes from './modules/reviews/reviews.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Stripe webhook must receive raw body before express.json parses it
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'RentNest API is running 🏠' });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', errorDetails: null });
});

app.use(errorHandler);

export default app;
