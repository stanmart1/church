import pool from '../config/database.js';
import { sendEmail } from './emailService.js';
import { broadcastToAllUsers } from '../websocket/notificationWebSocket.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendLivestreamStartNotification = async (livestreamId, livestreamData) => {
  try {
    const users = await pool.query(
      `SELECT id, email, name, notification_preferences FROM users`
    );

    const notifications = users.rows.map(user => ({
      recipient_id: user.id,
      recipient_email: user.email,
      type: 'Livestream Started',
      message: `${livestreamData.title} is now live!`,
      status: 'pending',
      link: '/member-dashboard'
    }));

    if (notifications.length > 0) {
      const values = notifications.map((n, i) => 
        `($${i*6+1}, $${i*6+2}, $${i*6+3}, $${i*6+4}, $${i*6+5}, $${i*6+6})`
      ).join(',');
      
      const params = notifications.flatMap(n => [
        n.recipient_id, n.recipient_email, n.type, n.message, n.status, n.link
      ]);

      await pool.query(
        `INSERT INTO notifications (recipient_id, recipient_email, type, message, status, link) 
         VALUES ${values}`,
        params
      );

      broadcastToAllUsers();

      setImmediate(async () => {
        const watchUrl = `${process.env.FRONTEND_URL}/member-dashboard`;
        
        const templatePath = path.join(__dirname, '../templates/livestreamStart.html');
        let emailHtml = fs.readFileSync(templatePath, 'utf8');
        
        emailHtml = emailHtml.replace('{{title}}', livestreamData.title);
        emailHtml = emailHtml.replace('{{description}}', livestreamData.description 
          ? `<p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">${livestreamData.description}</p>` 
          : '');
        emailHtml = emailHtml.replace('{{watchUrl}}', watchUrl);
        
        for (const user of users.rows) {
          try {
            await sendEmail(user.email, 'Livestream Started', emailHtml);
          } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
          }
        }
      });
    }

    return { success: true, notificationsSent: notifications.length };
  } catch (error) {
    console.error('Notification service error:', error);
    throw error;
  }
};
