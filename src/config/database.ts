import { Pool, PoolClient } from 'pg';
import logger from './logger';
import dotenv from './dotenv';

// Connection configuration with fallback values
const pool = new Pool({
  connectionString: dotenv.databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 120000,
});

// // Listen to pool events
pool.on('connect', () => {
  logger.info('✅ Successfully connected to the database');
});

pool.on('remove', () => {
  logger.info('🚪 A database connection was closed');
});

pool.on('error', (err) => {
  logger.error('❌ Unexpected error on the database', err);
});

export default pool;
