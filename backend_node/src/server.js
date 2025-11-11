import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import pool, { healthCheck } from './config/database.js';
import { swaggerSpec } from './config/swagger.js';
import { serveFiles } from './services/storageService.js';
import { initWebSocket, broadcastStreamStatusChange } from './websocket/livestreamWebSocket.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import sermonRoutes from './routes/sermonRoutes.js';
import seriesRoutes from './routes/seriesRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import formRoutes from './routes/formRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import livestreamRoutes from './routes/livestreamRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import givingRoutes from './routes/givingRoutes.js';
import prayerRoutes from './routes/prayerRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import { securityHeaders } from './middleware/security.js';
import { startCleanupSchedule } from './services/tokenBlacklistService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT;

app.use(compression());
app.use(securityHeaders);
app.use(cors({ 
  origin: [process.env.FRONTEND_URL, 'http://192.168.0.100:5173', 'http://192.168.0.101:5173'].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', serveFiles);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Church API is running' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/sermons', sermonRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/livestreams', livestreamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/giving', givingRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/permissions', permissionRoutes);

initWebSocket(httpServer);
startCleanupSchedule();

export { broadcastStreamStatusChange };

httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('WebSocket server ready');
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully at:', result.rows[0].now);
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
});

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  httpServer.close(async () => {
    console.log('HTTP server closed');
    
    try {
      const { gracefulShutdown } = await import('./config/database.js');
      await gracefulShutdown();
      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
