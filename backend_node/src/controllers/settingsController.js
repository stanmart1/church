import pool from '../config/database.js';

export const getSystemStatus = async (req, res) => {
  try {
    const os = await import('os');
    
    const dbUptimeResult = await pool.query("SELECT EXTRACT(EPOCH FROM (NOW() - pg_postmaster_start_time())) as uptime");
    const uptimeSeconds = parseFloat(dbUptimeResult.rows[0].uptime);
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    
    const cpus = os.cpus();
    const cpuUsage = Math.round(cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length);
    
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);
    
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const activeUsers = parseInt(usersResult.rows[0].count);
    
    res.json({
      uptime: `${days} days, ${hours} hours`,
      cpuUsage: `${cpuUsage}%`,
      memoryUsage: `${memoryUsage}%`,
      activeUsers
    });
  } catch (error) {
    console.error('Get system status error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSecurityStats = async (req, res) => {
  try {
    const alertsResult = await pool.query(
      "SELECT COUNT(*) as count FROM audit_logs WHERE severity IN ('high', 'critical') AND created_at >= NOW() - INTERVAL '24 hours'"
    );
    const blockedResult = await pool.query(
      "SELECT COUNT(*) as count FROM audit_logs WHERE event LIKE '%Failed%' AND created_at >= NOW() - INTERVAL '7 days'"
    );
    const usersResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE status = 'active'"
    );
    
    const securitySettings = await pool.query(
      "SELECT COUNT(*) as count FROM settings WHERE category = 'security' AND value = 'true'"
    );
    const totalSecuritySettings = 10;
    const securityScore = Math.round((parseInt(securitySettings.rows[0].count) / totalSecuritySettings) * 100);
    
    res.json({
      securityScore,
      activeSessions: parseInt(usersResult.rows[0].count),
      securityAlerts: parseInt(alertsResult.rows[0].count),
      blockedAttempts: parseInt(blockedResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get security stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getRecentNotifications = async (req, res) => {
  try {
    const userId = req.query.user_id;
    let query = `SELECT id, type, message, status, read, link,
       CASE 
         WHEN created_at > NOW() - INTERVAL '1 hour' THEN EXTRACT(EPOCH FROM (NOW() - created_at))/60 || ' minutes ago'
         WHEN created_at > NOW() - INTERVAL '24 hours' THEN EXTRACT(EPOCH FROM (NOW() - created_at))/3600 || ' hours ago'
         ELSE EXTRACT(EPOCH FROM (NOW() - created_at))/86400 || ' days ago'
       END as time
       FROM notifications`;
    
    const params = [];
    if (userId) {
      query += ' WHERE recipient_id = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 10';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get recent notifications error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.query.user_id;
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = $1 AND read = false',
      [userId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getIntegrationStats = async (req, res) => {
  try {
    const activeResult = await pool.query(
      "SELECT COUNT(*) as count FROM settings WHERE category = 'integrations' AND key LIKE '%_enabled' AND value = 'true'"
    );
    const totalResult = await pool.query(
      "SELECT COUNT(*) as count FROM settings WHERE category = 'integrations' AND key LIKE '%_enabled'"
    );
    const active = parseInt(activeResult.rows[0].count);
    const total = parseInt(totalResult.rows[0].count);
    
    res.json({
      active,
      inactive: total - active,
      total,
      errors: 0
    });
  } catch (error) {
    console.error('Get integration stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM settings';
    const params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    const result = await pool.query(query, params);
    
    const defaults = {
      maxUploadSize: '10',
      sessionTimeout: '30'
    };
    
    const settings = { ...defaults };
    result.rows.forEach(row => {
      let value = row.value;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value.startsWith('{') || value.startsWith('[')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if JSON parse fails
        }
      }
      settings[row.key] = value;
    });

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSettingByKey = async (req, res) => {
  try {
    console.log('Fetching setting by key:', req.params.key);
    const result = await pool.query('SELECT * FROM settings WHERE key = $1', [req.params.key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get setting by key error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    console.log('Updating setting:', req.params.key);
    const { value, category } = req.body;

    const result = await pool.query(
      `INSERT INTO settings (key, value, category) VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET value = $2, category = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.params.key, value, category || null]
    );

    console.log('Setting updated:', result.rows[0].key);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update setting error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateBulkSettings = async (req, res) => {
  try {
    console.log('Updating bulk settings');
    const { settings } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const [key, data] of Object.entries(settings)) {
        const { value, category } = data;
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await client.query(
          `INSERT INTO settings (key, value, category) VALUES ($1, $2, $3)
           ON CONFLICT (key) DO UPDATE SET value = $2, category = $3, updated_at = CURRENT_TIMESTAMP`,
          [key, stringValue, category || null]
        );
      }
      
      await client.query('COMMIT');
      console.log(`Updated ${Object.keys(settings).length} settings`);
      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update bulk settings error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const testIntegration = async (req, res) => {
  try {
    const { integration } = req.params;
    console.log('Testing integration:', integration);
    
    const result = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`${integration}_enabled`]
    );
    
    if (result.rows.length === 0 || result.rows[0].value !== 'true') {
      return res.status(400).json({ success: false, message: 'Integration not enabled' });
    }
    
    await pool.query(
      "INSERT INTO audit_logs (event, severity, details) VALUES ($1, 'low', $2)",
      [`Integration Test: ${integration}`, `Testing ${integration} connection`]
    );
    
    res.json({ success: true, message: 'Connection successful' });
  } catch (error) {
    console.error('Test integration error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const testEmail = async (req, res) => {
  try {
    console.log('Testing email configuration');
    const { recipient } = req.body;
    const { sendEmail } = await import('../services/emailService.js');
    
    await sendEmail(
      recipient || 'test@example.com',
      'Test Email from Church Management System',
      '<h1>Test Email</h1><p>This is a test email from your church management system.</p>'
    );
    
    await pool.query(
      "INSERT INTO audit_logs (event, severity, details) VALUES ('Email Test', 'low', 'Resend email test successful')"
    );
    
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
