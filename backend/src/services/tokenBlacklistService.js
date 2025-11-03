import pool from '../config/database.js';
import { AUTH } from '../config/constants.js';

export const cleanupExpiredTokens = async () => {
  try {
    const result = await pool.query(
      `DELETE FROM token_blacklist 
       WHERE created_at < NOW() - INTERVAL '${AUTH.TOKEN_BLACKLIST_CLEANUP_HOURS} hours'`
    );
    console.log(`Cleaned up ${result.rowCount} expired blacklist entries`);
    return result.rowCount;
  } catch (error) {
    console.error('Token cleanup error:', error);
    throw error;
  }
};

export const isTokenBlacklisted = async (userId, tokenIat) => {
  const result = await pool.query(
    `SELECT 1 FROM token_blacklist 
     WHERE user_id = $1 AND created_at > $2 
     LIMIT 1`,
    [userId, new Date(tokenIat * 1000)]
  );
  return result.rows.length > 0;
};

export const addToBlacklist = async (userId) => {
  await pool.query(
    'INSERT INTO token_blacklist (user_id) VALUES ($1)',
    [userId]
  );
};

export const startCleanupSchedule = () => {
  setInterval(cleanupExpiredTokens, 6 * 60 * 60 * 1000);
  cleanupExpiredTokens();
  console.log('Token blacklist cleanup scheduled (every 6 hours)');
};
