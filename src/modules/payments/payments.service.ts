import Stripe from 'stripe';
import dns from 'dns';
import { Agent, fetch as undiciFetch } from 'undici';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

const ipv4Agent = new Agent({
  connect: {
    lookup: (hostname: string, options: dns.LookupOptions, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => {
      dns.lookup(hostname, { ...options, family: 4 }, callback as any);
    },
  },
});

const ipv4Fetch = (url: string, init?: RequestInit) =>
  undiciFetch(url, { ...init, dispatcher: ipv4Agent } as Parameters<typeof undiciFetch>[1]);

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new AppError('Stripe key not configured', 500);
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient(ipv4Fetch as typeof fetch) });
};

export const createPaymentSession = async (tenantId: string, rentalRequestId: string) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rental) throw new AppError('Rental request not found', 404);
  if (rental.tenantId !== tenantId) throw new AppError('Forbidden', 403);
  if (rental.status !== 'APPROVED') throw new AppError('Rental request must be approved before payment', 400);
  if (rental.payment && rental.payment.status === 'COMPLETED') throw new AppError('Payment already completed', 400);

  const stripe = getStripe();
  const amount = rental.property.pricePerMonth;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Rent: ${rental.property.title}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: { rentalRequestId },
    success_url: `${process.env.CLIENT_URL ?? 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL ?? 'http://localhost:3000'}/payment/cancel`,
  });

  const payment = await prisma.payment.upsert({
    where: { rentalRequestId },
    update: { stripeSessionId: session.id, status: 'PENDING' },
    create: {
      rentalRequestId,
      amount,
      provider: 'STRIPE',
      stripeSessionId: session.id,
      status: 'PENDING',
    },
  });

  return { sessionUrl: session.url, payment };
};

export const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new AppError('Webhook secret not configured', 500);

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    throw new AppError('Invalid webhook signature', 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const rentalRequestId = session.metadata?.['rentalRequestId'];
    if (!rentalRequestId) return;

    await prisma.payment.update({
      where: { rentalRequestId },
      data: {
        status: 'COMPLETED',
        transactionId: session.payment_intent as string,
        paidAt: new Date(),
      },
    });

    await prisma.rentalRequest.update({
      where: { id: rentalRequestId },
      data: { status: 'ACTIVE' },
    });
  }

  if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const rentalRequestId = session.metadata?.['rentalRequestId'];
    if (!rentalRequestId) return;

    await prisma.payment.update({
      where: { rentalRequestId },
      data: { status: 'FAILED' },
    });
  }
};

export const verifyPaymentSession = async (sessionId: string) => {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.status !== 'complete') throw new AppError('Payment not completed', 400);

  const rentalRequestId = session.metadata?.['rentalRequestId'];
  if (!rentalRequestId) throw new AppError('Invalid session', 400);

  await prisma.payment.update({
    where: { rentalRequestId },
    data: { status: 'COMPLETED', transactionId: session.payment_intent as string, paidAt: new Date() },
  });

  await prisma.rentalRequest.update({
    where: { id: rentalRequestId },
    data: { status: 'ACTIVE' },
  });

  return { success: true };
};

export const getUserPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { rentalRequest: { tenantId: userId } },
    include: {
      rentalRequest: {
        include: { property: { select: { id: true, title: true, location: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPaymentById = async (id: string, userId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: {
        include: { property: { select: { id: true, title: true, location: true } } },
      },
    },
  });

  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.rentalRequest.tenantId !== userId) throw new AppError('Forbidden', 403);
  return payment;
};
