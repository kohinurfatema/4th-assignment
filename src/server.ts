import 'dotenv/config';
import app from './app';

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
