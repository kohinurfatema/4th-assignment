import 'dotenv/config';
import dns from 'dns';
import app from './app';

// Force IPv4 — IPv6 times out on this network (affects both pg TCP and fetch)
dns.setDefaultResultOrder('ipv4first');

const PORT = process.env.PORT ?? 5000;

const server = app.listen(PORT, () => {
  console.log(`RentNest server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shut down gracefully');
    process.exit(0);
  });
});
