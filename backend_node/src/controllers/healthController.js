import { healthCheck as dbHealthCheck } from '../config/database.js';

export const healthCheck = async (req, res) => {
  const dbHealth = await dbHealthCheck();
  
  if (dbHealth.healthy) {
    res.json({
      status: 'ok',
      message: 'Church API is running',
      database: 'connected',
      timestamp: dbHealth.timestamp,
      pool: {
        total: dbHealth.poolSize,
        idle: dbHealth.idleConnections,
        waiting: dbHealth.waitingClients
      }
    });
  } else {
    res.status(503).json({
      status: 'error',
      message: 'Church API is running',
      database: 'disconnected',
      error: dbHealth.error
    });
  }
};
