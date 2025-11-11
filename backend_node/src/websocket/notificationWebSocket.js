const notificationSubscribers = new Map();

export const setupNotificationWebSocket = (wss) => {
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe-notifications' && data.userId) {
          if (!notificationSubscribers.has(data.userId)) {
            notificationSubscribers.set(data.userId, new Set());
          }
          notificationSubscribers.get(data.userId).add(ws);
          
          ws.on('close', () => {
            const subs = notificationSubscribers.get(data.userId);
            if (subs) {
              subs.delete(ws);
              if (subs.size === 0) {
                notificationSubscribers.delete(data.userId);
              }
            }
          });
        }
      } catch (error) {
        console.error('Notification WebSocket error:', error);
      }
    });
  });
};

export const broadcastNotification = (userId) => {
  const subscribers = notificationSubscribers.get(userId);
  if (subscribers) {
    const message = JSON.stringify({ type: 'new-notification' });
    subscribers.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }
};

export const broadcastToAllUsers = () => {
  notificationSubscribers.forEach((subscribers) => {
    const message = JSON.stringify({ type: 'new-notification' });
    subscribers.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  });
};
