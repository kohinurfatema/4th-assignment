import 'dotenv/config';
import dns from 'dns';
import { Agent, setGlobalDispatcher } from 'undici';
import app from './app';

// Force IPv4 for all outbound connections — IPv6 times out on this network
dns.setDefaultResultOrder('ipv4first');
setGlobalDispatcher(new Agent({
  connect: {
    lookup: (hostname: string, options: dns.LookupOptions, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => {
      dns.lookup(hostname, { ...options, family: 4 }, callback as any);
    },
  },
}));

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
