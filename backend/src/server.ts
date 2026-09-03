import { createApp } from './app';
import { ENV } from './config/env';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 IncidentFlow Backend API running on port ${ENV.PORT}`);
  console.log(`📡 Environment: ${ENV.NODE_ENV}`);
  console.log(`🔗 Health Check: http://localhost:${ENV.PORT}/api/health`);
  console.log(`===========================================`);
});

const gracefulShutdown = async () => {
  console.log('\nGracefully shutting down IncidentFlow server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Server stopped.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
