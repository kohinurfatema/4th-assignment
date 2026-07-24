import 'dotenv/config';
import dns from 'dns';
import WebSocket from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

// Force IPv4 for WebSocket connections to NeonDB (port 5432 TCP is blocked, WSS on 443 works)
class IPv4WebSocket extends (WebSocket as any) {
  constructor(address: string, options?: any) {
    super(address, {
      ...options,
      lookup: (hostname: string, opt: dns.LookupOptions, cb: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => {
        dns.lookup(hostname, { ...opt, family: 4 }, cb);
      },
    });
  }
}

neonConfig.webSocketConstructor = IPv4WebSocket;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;
