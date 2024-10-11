import { Pool } from 'pg';
import logger from './logger';
import dotenv from './dotenv';

// Connection configuration with fallback values
const pool = new Pool({
  connectionString: dotenv.databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000,
});

// Listen to pool events
pool.on('connect', () => {
  logger.info('✅ Successfully connected to the database');
});

pool.on('remove', () => {
  logger.info('🚪 A database connection was closed');
});

pool.on('error', (err) => {
  logger.error('❌ Unexpected error on the database', err);
  process.exit(-1); // Exit the process in case of a fatal error
});

// Retry logic for connecting to the database
const connectWithRetry = async (retries = 5) => {
  while (retries) {
    try {
      await pool.connect(); // Attempt to connect
      logger.info('✅ Database is operational');
      break; // If connection succeeds, break out of the loop
    } catch (error) {
      retries -= 1;
      logger.error(`❌ Failed to connect to the database. Retries left: ${retries}`, error);
      if (retries === 0) {
        logger.error('🚨 No retries left. Shutting down the application.');
        process.exit(1); // Exit if retries are exhausted
      } else {
        logger.info('🔁 Retrying to connect to the database in 5 seconds...');
        await new Promise((res) => setTimeout(res, 5000)); // Wait for 5 seconds before retrying
      }
    }
  }
};

// Call the retry connection logic when the application starts
connectWithRetry();

export default pool;
