import dotenv from './config/dotenv';
import app from './app';
import { createServer } from 'http';
import logger from './config/logger';
import pool from './config/database';

const server = createServer(app);

// Function to handle graceful shutdown
const shutdownHandler = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  // Close server and remaining connections
  server.close(() => {
    logger.info('HTTP server closed.');
    pool.end(() => {
      logger.info('Database pool closed.');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forcefully shutting down due to timeout.');
    process.exit(1);
  }, 10000);
};

// Function to start the server
const startServer = () => {
  server.listen(dotenv.port, () => {
    logger.info(`🚀 Server running on port ${dotenv.port}`);
  });
};

// Function to connect to the database
const connectDatabaseAndStartServer = async () => {
  try {
    await pool.connect(); // Attempt to connect to the database
    logger.info('✅ Connected to the database');

    // If the database connection is successful, start the server
    startServer();
  } catch (error) {
    logger.error('❌ Failed to connect to the database', error);
    process.exit(1); // Exit the process if the database connection fails
  }
};

// Listen for termination signals
process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);

// Try connecting to the database and start the server
connectDatabaseAndStartServer();
