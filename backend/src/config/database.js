import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let currentPool = null;

const createPool = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 50000,
    allowExitOnIdle: false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  });

  pool.on('error', async (err) => {
    console.error('Database pool error:', err);
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(() => {
        currentPool = createPool();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Manual intervention required.');
    }
  });

  pool.on('connect', () => {
    console.log('New database connection established');
    reconnectAttempts = 0;
  });

  pool.on('remove', () => {
    console.log('Database connection removed from pool');
  });

  return pool;
};

export const healthCheck = async () => {
  try {
    const result = await currentPool.query('SELECT 1 as health, NOW() as timestamp');
    return { 
      healthy: true, 
      timestamp: result.rows[0].timestamp,
      poolSize: currentPool.totalCount,
      idleConnections: currentPool.idleCount,
      waitingClients: currentPool.waitingCount
    };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

export const gracefulShutdown = async () => {
  console.log('Closing database pool...');
  try {
    await currentPool.end();
    console.log('Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
};

currentPool = createPool();
export default currentPool;
