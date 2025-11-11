import pool from '../config/database.js';
import { HTTP_STATUS } from '../config/constants.js';

export const getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    
    // Execute all queries in parallel
    const [members, sermons, events, announcements, forms, livestream] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE membership_status = 'active' AND role = 'member') as total_members,
          COUNT(*) FILTER (WHERE date_joined >= CURRENT_DATE - INTERVAL '7 days' AND role = 'member') as new_members
        FROM users
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_sermons,
          COALESCE(SUM(downloads), 0) as total_downloads,
          COALESCE(SUM(downloads) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as recent_downloads
        FROM sermons
      `),
      pool.query(`SELECT COUNT(*) as count FROM events WHERE date >= CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) as count FROM announcements`),
      pool.query(`SELECT COUNT(*) as count FROM forms`),
      pool.query(`SELECT COALESCE(viewers, 0) as count, is_live FROM livestreams ORDER BY created_at DESC LIMIT 1`)
    ]);

    let attendanceData = { thisWeek: 0, lastWeek: 0 };
    try {
      const attendance = await pool.query(`
        SELECT 
          COUNT(DISTINCT user_id) FILTER (WHERE date >= CURRENT_DATE - INTERVAL '7 days') as this_week,
          COUNT(DISTINCT user_id) FILTER (WHERE date >= CURRENT_DATE - INTERVAL '14 days' AND date < CURRENT_DATE - INTERVAL '7 days') as last_week
        FROM attendance WHERE present = true
      `);
      attendanceData = attendance.rows[0];
    } catch (err) {
      console.log('attendance table does not exist yet');
    }

    const attendanceChange = attendanceData.last_week > 0 
      ? Math.round(((attendanceData.this_week - attendanceData.last_week) / attendanceData.last_week) * 100)
      : 0;

    const downloadsChange = sermons.rows[0].total_downloads > sermons.rows[0].recent_downloads
      ? Math.round(((sermons.rows[0].recent_downloads) / (sermons.rows[0].total_downloads - sermons.rows[0].recent_downloads)) * 100)
      : 0;

    const response = {
      totalMembers: parseInt(members.rows[0].total_members),
      newMembersThisWeek: parseInt(members.rows[0].new_members),
      weeklyAttendance: parseInt(attendanceData.this_week),
      attendanceChange: attendanceChange,
      sermonDownloads: parseInt(sermons.rows[0].total_downloads),
      downloadsChange: downloadsChange,
      liveViewers: parseInt(livestream.rows[0]?.count || 0),
      isLive: livestream.rows[0]?.is_live || false,
      totalSermons: parseInt(sermons.rows[0].total_sermons),
      upcomingEvents: parseInt(events.rows[0].count),
      activeAnnouncements: parseInt(announcements.rows[0].count),
      totalForms: parseInt(forms.rows[0].count)
    };
    console.log('Dashboard stats:', response);
    res.json(response);
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    console.log('Fetching recent activity...');
    const activities = await pool.query(`
      (
        SELECT 'member' as type, name as title, date_joined as date FROM users WHERE role = 'member' ORDER BY date_joined DESC LIMIT 5
      )
      UNION ALL
      (
        SELECT 'sermon' as type, title, date FROM sermons ORDER BY date DESC LIMIT 5
      )
      UNION ALL
      (
        SELECT 'event' as type, title, date FROM events ORDER BY created_at DESC LIMIT 5
      )
      ORDER BY date DESC
      LIMIT 10
    `);

    console.log('Recent activity count:', activities.rows.length);
    res.json(activities.rows);
  } catch (error) {
    console.error('Recent activity error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getMemberStats = async (req, res) => {
  try {
    console.log('Fetching member stats:', req.params.memberId);
    
    let downloadedSermons = { rows: [{ count: 0 }] };
    try {
      downloadedSermons = await pool.query(
        `SELECT COUNT(DISTINCT sermon_id) as count FROM sermon_downloads 
         WHERE user_id = $1`,
        [req.params.memberId]
      );
    } catch (err) {
      console.log('sermon_downloads table may not exist yet');
    }
    
    let givingTotal = { rows: [{ total: 0 }] };
    try {
      givingTotal = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM giving 
         WHERE user_id = $1 
         AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
        [req.params.memberId]
      );
    } catch (err) {
      console.log('giving table may not have user_id column yet');
    }
    
    let eventsCount = { rows: [{ count: 0 }] };
    try {
      eventsCount = await pool.query(
        `SELECT COUNT(*) as count FROM event_registrations 
         WHERE user_id = $1 AND attended = true`,
        [req.params.memberId]
      );
    } catch (err) {
      console.log('event_registrations table may not have user_id column yet');
    }

    res.json({
      downloadedSermons: parseInt(downloadedSermons.rows[0]?.count || 0),
      totalGiving: parseFloat(givingTotal.rows[0].total),
      eventsAttended: parseInt(eventsCount.rows[0].count)
    });
  } catch (error) {
    console.error('Get member stats error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getMemberRecentSermons = async (req, res) => {
  try {
    console.log('Fetching recent sermons for member');
    const result = await pool.query(
      'SELECT id, title, speaker, date, duration FROM sermons ORDER BY date DESC LIMIT 3'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get member recent sermons error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getMemberUpcomingEvents = async (req, res) => {
  try {
    console.log('Fetching upcoming events for member');
    const result = await pool.query(
      `SELECT id, title, date, type, location FROM events 
       WHERE date >= CURRENT_DATE 
       ORDER BY date ASC LIMIT 3`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get member upcoming events error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
