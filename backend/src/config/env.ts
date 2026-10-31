import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/incidentflow?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'development-jwt-secret-incidentflow-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // Deliberately has no default: webhook ingress stays disabled until configured.
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
};

if (ENV.NODE_ENV === 'production' && !ENV.WEBHOOK_SECRET) {
  throw new Error('WEBHOOK_SECRET must be set in production.');
}

if (ENV.NODE_ENV === 'production' && ENV.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}
