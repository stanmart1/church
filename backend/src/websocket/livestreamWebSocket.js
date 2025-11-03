import { WebSocketServer } from 'ws';
import pool from '../config/database.js';
import { setupNotificationWebSocket } from './notificationWebSocket.js';

let wss = null;
const streamSubscriptions = new Map();
const streamStatusSubscribers = new Set();

const MAX_CONNECTIONS_PER_STREAM = 1000;
const CONNECTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 60000; // 1 minute

const cleanupStaleConnections = () => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [streamId, clients] of streamSubscriptions.entries()) {
    for (const client of clients) {
      if (client.readyState !== 1 || (client.lastActivity && (now - client.lastActivity) > CONNECTION_TIMEOUT)) {
        clients.delete(client);
        cleanedCount++;
      }
    }
    if (clients.size === 0) {
      streamSubscriptions.delete(streamId);
    }
  }
  
  for (const client of streamStatusSubscribers) {
    if (client.readyState !== 1) {
      streamStatusSubscribers.delete(client);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} stale WebSocket connections`);
  }
};

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });
  setupNotificationWebSocket(wss);

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.lastActivity = Date.now();
    
    ws.on('pong', () => {
      ws.isAlive = true;
      ws.lastActivity = Date.now();
    });

    ws.on('message', async (message) => {
      try {
        ws.lastActivity = Date.now();
        const data = JSON.parse(message);

        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (data.type === 'subscribe-stream-status') {
          streamStatusSubscribers.add(ws);
        }

        if (data.type === 'subscribe' && data.streamId) {
          if (!streamSubscriptions.has(data.streamId)) {
            streamSubscriptions.set(data.streamId, new Set());
          }
          
          const clients = streamSubscriptions.get(data.streamId);
          if (clients.size >= MAX_CONNECTIONS_PER_STREAM) {
            ws.send(JSON.stringify({ type: 'error', message: 'Stream capacity reached' }));
            return;
          }
          
          ws.streamId = data.streamId;
          clients.add(ws);
          
          const stats = await getStreamStats(data.streamId);
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'stats', stats }));
          }
        }

        if (data.type === 'chat-message' && data.streamId) {
          try {
            const result = await pool.query(
              'INSERT INTO chat_messages (livestream_id, user_id, user_name, text) VALUES ($1, $2, $3, $4) RETURNING *',
              [data.streamId, data.userId || null, data.userName, data.text]
            );
            
            const clients = streamSubscriptions.get(data.streamId);
            if (clients) {
              const messageData = JSON.stringify({ type: 'new-message', message: result.rows[0] });
              clients.forEach((client) => {
                if (client.readyState === 1) {
                  try {
                    client.send(messageData);
                  } catch (error) {
                    console.error('Error sending message:', error.message);
                  }
                }
              });
            }
          } catch (error) {
            console.error('Error inserting chat message:', error.message);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      streamStatusSubscribers.delete(ws);
      if (ws.streamId && streamSubscriptions.has(ws.streamId)) {
        streamSubscriptions.get(ws.streamId).delete(ws);
        if (streamSubscriptions.get(ws.streamId).size === 0) {
          streamSubscriptions.delete(ws.streamId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
    });
  });

  startStatsBroadcast();
  startHeartbeat();
  startCleanupSchedule();
};

const startCleanupSchedule = () => {
  setInterval(cleanupStaleConnections, CLEANUP_INTERVAL);
  console.log('WebSocket cleanup scheduled (every 1 minute)');
};

const startHeartbeat = () => {
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        if (ws.streamId && streamSubscriptions.has(ws.streamId)) {
          streamSubscriptions.get(ws.streamId).delete(ws);
        }
        streamStatusSubscribers.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
};

const getStreamStats = async (streamId) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.is_live,
        COALESCE(COUNT(DISTINCT sv.id) FILTER (WHERE sv.status = 'active'), 0) as current_viewers,
        COALESCE(l.viewers, 0) as peak_viewers,
        COALESCE(COUNT(DISTINCT cm.id), 0) as chat_messages,
        CASE 
          WHEN l.is_live AND l.start_time IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (NOW() - l.start_time))::INTEGER 
          ELSE 0 
        END as duration
      FROM livestreams l
      LEFT JOIN stream_viewers sv ON sv.livestream_id = l.id
      LEFT JOIN chat_messages cm ON cm.livestream_id = l.id
      WHERE l.id = $1
      GROUP BY l.id, l.is_live, l.start_time, l.viewers
    `, [streamId]);

    if (result.rows.length === 0 || !result.rows[0].is_live) return null;

    return {
      current_viewers: parseInt(result.rows[0].current_viewers),
      peak_viewers: parseInt(result.rows[0].peak_viewers),
      duration: result.rows[0].duration,
      chat_messages: parseInt(result.rows[0].chat_messages),
      is_live: result.rows[0].is_live
    };
  } catch (error) {
    console.error('Error getting stream stats:', error.message);
    return null;
  }
};

const startStatsBroadcast = () => {
  setInterval(async () => {
    if (streamSubscriptions.size === 0) return;
    
    for (const [streamId, clients] of streamSubscriptions.entries()) {
      if (clients.size === 0) continue;
      
      const stats = await getStreamStats(streamId);
      if (stats) {
        const message = JSON.stringify({ type: 'stats', stats });
        clients.forEach((client) => {
          if (client.readyState === 1) {
            try {
              client.send(message);
            } catch (error) {
              console.error('Error sending to client:', error.message);
            }
          }
        });
      }
    }
  }, 3000);
};

export const broadcastStreamStatusChange = () => {
  const message = JSON.stringify({ type: 'stream-status-change' });
  streamStatusSubscribers.forEach((client) => {
    if (client.readyState === 1) {
      try {
        client.send(message);
      } catch (error) {
        console.error('Error broadcasting stream status:', error.message);
      }
    }
  });
};

export const broadcastStreamUpdate = () => {
  const message = JSON.stringify({ type: 'stream-update' });
  streamStatusSubscribers.forEach((client) => {
    if (client.readyState === 1) {
      try {
        client.send(message);
      } catch (error) {
        console.error('Error broadcasting stream update:', error.message);
      }
    }
  });
};

export const broadcastViewersUpdate = () => {
  const message = JSON.stringify({ type: 'viewers-update' });
  streamStatusSubscribers.forEach((client) => {
    if (client.readyState === 1) {
      try {
        client.send(message);
      } catch (error) {
        console.error('Error broadcasting viewers update:', error.message);
      }
    }
  });
};

export const broadcastViewerKicked = (userId) => {
  const message = JSON.stringify({ type: 'viewer-kicked', userId });
  streamStatusSubscribers.forEach((client) => {
    if (client.readyState === 1) {
      try {
        client.send(message);
      } catch (error) {
        console.error('Error broadcasting viewer kicked:', error.message);
      }
    }
  });
};

export default { initWebSocket, broadcastStreamStatusChange, broadcastStreamUpdate, broadcastViewersUpdate, broadcastViewerKicked };
