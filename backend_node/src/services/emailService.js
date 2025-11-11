import { Resend } from 'resend';
import pool from '../config/database.js';

let resendClient = null;

const getEmailConfig = async () => {
  const result = await pool.query(
    "SELECT key, value FROM settings WHERE key IN ('resend_api_key', 'resend_from_email')"
  );
  
  const config = {};
  result.rows.forEach(row => {
    config[row.key] = row.value;
  });
  
  return config;
};

const initializeResend = async () => {
  const config = await getEmailConfig();
  
  if (!config.resend_api_key) {
    throw new Error('Resend API key not configured');
  }
  
  resendClient = new Resend(config.resend_api_key);
  return { client: resendClient, fromEmail: config.resend_from_email || 'noreply@church.org' };
};

export const sendEmail = async (to, subject, html) => {
  try {
    const { client, fromEmail } = await initializeResend();
    
    const data = await client.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    });
    
    await pool.query(
      "INSERT INTO notifications (type, message, status, recipient_email) VALUES ($1, $2, 'sent', $3)",
      ['Email', subject, Array.isArray(to) ? to[0] : to]
    );
    
    return { success: true, data };
  } catch (error) {
    await pool.query(
      "INSERT INTO notifications (type, message, status, recipient_email) VALUES ($1, $2, 'failed', $3)",
      ['Email', subject, Array.isArray(to) ? to[0] : to]
    );
    
    throw error;
  }
};

export const testEmailConnection = async () => {
  try {
    await initializeResend();
    return { success: true, message: 'Resend connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
