import { Server } from 'socket.io';
import pool from './database.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-livestream', (livestreamId) => {
      socket.join(`livestream-${livestreamId}`);
      console.log(`Client ${socket.id} joined livestream ${livestreamId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { livestream_id, user_id, user_name, text } = data;
        const result = await pool.query(
          'INSERT INTO chat_messages (livestream_id, user_id, user_name, text) VALUES ($1, $2, $3, $4) RETURNING *',
          [livestream_id, user_id || null, user_name, text]
        );
        io.to(`livestream-${livestream_id}`).emit('new-message', result.rows[0]);
      } catch (error) {
        console.error('Send message error:', error.message);
      }
    });

    socket.on('update-viewers', async (data) => {
      try {
        const { livestream_id, viewers } = data;
        await pool.query('UPDATE livestreams SET viewers = $1 WHERE id = $2', [viewers, livestream_id]);
        io.to(`livestream-${livestream_id}`).emit('viewers-updated', { viewers });
      } catch (error) {
        console.error('Update viewers error:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};
