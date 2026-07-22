import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/categories.routes';
import propertyRoutes from './modules/properties/properties.routes';
import rentalRoutes from './modules/rentals/rentals.routes';
import landlordRoutes from './modules/rentals/landlord.routes';
import paymentRoutes, { stripeWebhook } from './modules/payments/payments.routes';

const app = express();

app.use(cors());

// Stripe webhook must receive raw body before express.json parses it
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'RentNest API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/payments', paymentRoutes);

app.use(errorHandler);

export default app;
